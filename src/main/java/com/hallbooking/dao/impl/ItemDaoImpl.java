package com.hallbooking.dao.impl;

import com.hallbooking.dao.ItemDao;
import com.hallbooking.model.Item;
import com.hallbooking.model.ItemSearchCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ItemDaoImpl - MongoDB implementation of ItemDao interface
 *
 * Provides data access methods for Item entity using MongoTemplate.
 * Schema-driven and category-agnostic - works for all item types.
 *
 * @author Hall Booking System
 * @version 1.0
 */
@Repository
public class ItemDaoImpl implements ItemDao {

    @Autowired
    private MongoTemplate mongoTemplate;

    /**
     * Fetch items based on filter criteria
     *
     * @param item Contains filter criteria (type, vendorId, status, etc.)
     * @return List of matching items
     */
    @Override
    public List<Item> fetchItems(Item item) {
        Query query = new Query();

        // Filter by type if provided
        if (item.getType() != null && !item.getType().trim().isEmpty()) {
            query.addCriteria(Criteria.where("type").is(item.getType()));
        }

        // Filter by vendor if provided
        if (item.getVendorId() != null && !item.getVendorId().trim().isEmpty()) {
            query.addCriteria(Criteria.where("vendorId").is(item.getVendorId()));
        }

        // Filter by status if provided
        if (item.getStatus() != null && !item.getStatus().trim().isEmpty()) {
            query.addCriteria(Criteria.where("status").is(item.getStatus()));
        }

        // Filter by place if provided
        if (item.getPlaceId() != null && !item.getPlaceId().trim().isEmpty()) {
            query.addCriteria(Criteria.where("placeId").is(item.getPlaceId()));
        }

        return mongoTemplate.find(query, Item.class);
    }

    /**
     * Filter items with advanced search criteria
     *
     * @param itemSearchCriteria Advanced search filters
     * @return List of matching items
     */
    @Override
    public List<Item> filteredItems(ItemSearchCriteria itemSearchCriteria) {
        Query query = buildSearchQuery(itemSearchCriteria);
        return mongoTemplate.find(query, Item.class);
    }

    /**
     * Get item by ID
     *
     * @param itemId Item ID
     * @return Item or null if not found
     */
    @Override
    public Item fetchItemDetails(String itemId) {
        return mongoTemplate.findById(itemId, Item.class);
    }

    /**
     * Build MongoDB query from search criteria
     */
    private Query buildSearchQuery(ItemSearchCriteria criteria) {
        Query query = new Query();

        // Type filter
        if (criteria.getType() != null && !criteria.getType().trim().isEmpty()) {
            query.addCriteria(Criteria.where("type").is(criteria.getType()));
        }

        // Place filter
        if (criteria.getPlaceId() != null && !criteria.getPlaceId().trim().isEmpty()) {
            query.addCriteria(Criteria.where("placeId").is(criteria.getPlaceId()));
        }

        // Seating capacity filter (for Auditorium)
        if (criteria.getSeatingCapacity() != null) {
            query.addCriteria(Criteria.where("dynamicData.seating_capacity").gte(criteria.getSeatingCapacity()));
        }

        // Temperature control filter (for Auditorium)
        if (criteria.getTempControl() != null && !criteria.getTempControl().trim().isEmpty()) {
            query.addCriteria(Criteria.where("dynamicData.temp_control").is(criteria.getTempControl()));
        }

        return query;
    }
}
