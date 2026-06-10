package com.hallbooking.dao.impl;

import com.hallbooking.dao.BlockedDateDao;
import com.hallbooking.model.BlockedDate;
import com.hallbooking.utility.DBConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Component
public class BlockedDateRepositoryImpl implements BlockedDateDao {

    @Autowired
    MongoTemplate mongoTemplate;

    @Override
    public BlockedDate createBlockedDate(BlockedDate blockedDate) throws Exception {
        blockedDate.setCreatedOn(new Date());
        blockedDate.setLastUpdateDate(new Date());
        return mongoTemplate.save(blockedDate);
    }

    @Override
    public List<BlockedDate> getBlockedDatesByItemId(String itemId) {
        Query query = new Query();
        query.addCriteria(Criteria.where("itemId").is(itemId));
        return mongoTemplate.find(query, BlockedDate.class);
    }

    @Override
    public List<BlockedDate> getBlockedDatesByVendorId(String vendorId) {
        Query query = new Query();
        query.addCriteria(Criteria.where("vendorId").is(vendorId));
        return mongoTemplate.find(query, BlockedDate.class);
    }

    @Override
    public BlockedDate getBlockedDateById(String id) {
        Query query = new Query();
        query.addCriteria(Criteria.where("_id").is(id));
        return mongoTemplate.findOne(query, BlockedDate.class);
    }

    @Override
    public void deleteBlockedDate(String id) {
        Query query = new Query();
        query.addCriteria(Criteria.where("_id").is(id));
        mongoTemplate.remove(query, BlockedDate.class);
    }

    /**
     * Find blocked dates that overlap with the requested date range
     *
     * Overlap logic:
     * - Blocked range: [blockStart, blockEnd]
     * - Requested range: [reqStart, reqEnd]
     *
     * Overlap occurs when:
     * 1. blockStart falls within requested range: blockStart >= reqStart AND blockStart <= reqEnd
     * 2. blockEnd falls within requested range: blockEnd >= reqStart AND blockEnd <= reqEnd
     * 3. Requested range falls completely within blocked range: blockStart <= reqStart AND blockEnd >= reqEnd
     */
    @Override
    public List<BlockedDate> findOverlappingBlockedDates(String itemId, LocalDateTime startDate, LocalDateTime endDate) {
        System.out.println("=== BLOCKED DATE CHECK DEBUG ===");
        System.out.println("Checking ItemId: " + itemId);
        System.out.println("Requested From: " + startDate);
        System.out.println("Requested To: " + endDate);

        Query query = new Query();

        // Item must match
        Criteria itemCriteria = Criteria.where("itemId").is(itemId);

        // Overlap conditions
        // 1. Blocked start date falls within requested range
        Criteria overlap1 = new Criteria().andOperator(
            Criteria.where("startDate").gte(startDate),
            Criteria.where("startDate").lte(endDate)
        );

        // 2. Blocked end date falls within requested range
        Criteria overlap2 = new Criteria().andOperator(
            Criteria.where("endDate").gte(startDate),
            Criteria.where("endDate").lte(endDate)
        );

        // 3. Requested range falls completely within blocked range
        Criteria overlap3 = new Criteria().andOperator(
            Criteria.where("startDate").lte(startDate),
            Criteria.where("endDate").gte(endDate)
        );

        // Combine: must match item AND at least one overlap condition
        // FIXED: Use andOperator to combine itemCriteria with orOperator of overlaps
        Criteria overlapCriteria = new Criteria().orOperator(overlap1, overlap2, overlap3);
        Criteria finalCriteria = new Criteria().andOperator(itemCriteria, overlapCriteria);
        query.addCriteria(finalCriteria);

        System.out.println("Query: " + query.toString());

        List<BlockedDate> blockedDates = mongoTemplate.find(query, BlockedDate.class);

        System.out.println("Found " + blockedDates.size() + " overlapping blocked dates");

        return blockedDates;
    }

    @Override
    public boolean areDatesAvailable(String itemId, LocalDateTime startDate, LocalDateTime endDate) {
        List<BlockedDate> overlapping = findOverlappingBlockedDates(itemId, startDate, endDate);
        return overlapping.isEmpty();
    }
}
