package com.hallbooking.dao.impl;

import com.hallbooking.dao.CouponDao;
import com.hallbooking.model.Coupon;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public class CouponDaoImpl implements CouponDao {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public Coupon save(Coupon coupon) {
        return mongoTemplate.save(coupon);
    }

    @Override
    public Coupon findByCode(String code) {
        Query query = new Query();
        query.addCriteria(Criteria.where("code").is(code));
        return mongoTemplate.findOne(query, Coupon.class);
    }

    @Override
    public List<Coupon> findByUserId(String userId) {
        Query query = new Query();
        query.addCriteria(Criteria.where("userId").is(userId));
        return mongoTemplate.find(query, Coupon.class);
    }

    @Override
    public List<Coupon> findByParentBookingId(String parentBookingId) {
        Query query = new Query();
        query.addCriteria(Criteria.where("parentBookingId").is(parentBookingId));
        return mongoTemplate.find(query, Coupon.class);
    }

    @Override
    public List<Coupon> findValidCouponsForUserAndItem(String userId, String itemId) {
        Query query = new Query();

        // User-specific coupons OR public coupons (userId = null)
        Criteria userCriteria = new Criteria().orOperator(
            Criteria.where("userId").is(userId),
            Criteria.where("userId").is(null)
        );

        // Item-specific OR category-wide OR global coupons
        Criteria itemCriteria = new Criteria().orOperator(
            Criteria.where("applicableItemId").is(itemId),
            Criteria.where("applicableItemId").is(null)
        );

        // Not expired
        Criteria expiryCriteria = new Criteria().orOperator(
            Criteria.where("expiryTime").gt(LocalDateTime.now()),
            Criteria.where("expiryTime").is(null)
        );

        // Usage check: either old isUsed field or new usage count
        Criteria usageCriteria = new Criteria().orOperator(
            Criteria.where("isUsed").is(false),
            Criteria.where("isUsed").is(null).and("currentUsageCount").lt(1)
        );

        query.addCriteria(
            new Criteria().andOperator(
                userCriteria,
                itemCriteria,
                expiryCriteria,
                usageCriteria
            )
        );

        return mongoTemplate.find(query, Coupon.class);
    }

    @Override
    public List<Coupon> findValidPublicCouponsForItem(String itemId) {
        Query query = new Query();

        // Public coupons only (userId = null)
        Criteria userCriteria = Criteria.where("userId").is(null);

        // Item-specific OR category-wide OR global coupons
        Criteria itemCriteria = new Criteria().orOperator(
            Criteria.where("applicableItemId").is(itemId),
            Criteria.where("applicableItemId").is(null)
        );

        // Not expired
        Criteria expiryCriteria = new Criteria().orOperator(
            Criteria.where("expiryTime").gt(LocalDateTime.now()),
            Criteria.where("expiryTime").is(null)
        );

        // Usage check
        Criteria usageCriteria = new Criteria().orOperator(
            Criteria.where("isUsed").is(false),
            Criteria.where("currentUsageCount").lt(new Criteria().where("maxUsageCount"))
        );

        query.addCriteria(
            new Criteria().andOperator(
                userCriteria,
                itemCriteria,
                expiryCriteria,
                usageCriteria
            )
        );

        return mongoTemplate.find(query, Coupon.class);
    }

    @Override
    public List<Coupon> findByCouponType(String couponType) {
        Query query = new Query();
        query.addCriteria(Criteria.where("couponType").is(couponType));
        return mongoTemplate.find(query, Coupon.class);
    }

    @Override
    public List<Coupon> findByVendorId(String vendorId) {
        Query query = new Query();
        query.addCriteria(Criteria.where("createdByVendorId").is(vendorId));
        return mongoTemplate.find(query, Coupon.class);
    }

    @Override
    public boolean validateCoupon(String code, String userId, String itemId) {
        Coupon coupon = findByCode(code);

        if (coupon == null) {
            return false;
        }

        // Check if coupon is valid
        return !coupon.getIsUsed() &&
               coupon.getUserId().equals(userId) &&
               coupon.getApplicableItemId().equals(itemId) &&
               coupon.getExpiryTime().isAfter(LocalDateTime.now());
    }

    @Override
    public List<Coupon> findAll() {
        return mongoTemplate.findAll(Coupon.class);
    }
}
