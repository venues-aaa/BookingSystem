package com.hallbooking.dao;

import com.hallbooking.model.Coupon;

import java.util.List;

public interface CouponDao {

    /**
     * Save or update a coupon
     */
    Coupon save(Coupon coupon);

    /**
     * Find coupon by code
     */
    Coupon findByCode(String code);

    /**
     * Find all coupons for a user
     */
    List<Coupon> findByUserId(String userId);

    /**
     * Find all coupons generated from a parent booking
     */
    List<Coupon> findByParentBookingId(String parentBookingId);

    /**
     * Find valid (unused, not expired) coupons for a user and item
     * Includes user-specific coupons and public coupons
     * Includes item-specific and category-wide coupons
     */
    List<Coupon> findValidCouponsForUserAndItem(String userId, String itemId);

    /**
     * Find valid public coupons for an item
     * Public coupons have userId = NULL
     */
    List<Coupon> findValidPublicCouponsForItem(String itemId);

    /**
     * Find coupons by type
     */
    List<Coupon> findByCouponType(String couponType);

    /**
     * Find coupons by vendor
     */
    List<Coupon> findByVendorId(String vendorId);

    /**
     * Validate coupon (check if exists, not used, not expired, correct user and item)
     */
    boolean validateCoupon(String code, String userId, String itemId);

    /**
     * Find all coupons
     */
    List<Coupon> findAll();
}
