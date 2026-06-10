package com.hallbooking.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Coupon - Generic discount coupon system
 *
 * Supports multiple coupon types:
 * - BUNDLE: Generated when booking items with bundle offers
 * - VENDOR_PROMOTION: Created by vendors for promotional campaigns
 * - REFERRAL: Referral rewards
 * - SEASONAL: Seasonal/holiday discounts
 * - CUSTOM: Custom vendor-defined coupons
 *
 * Can be user-specific or public, item-specific or category-wide
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "coupon")
@CompoundIndex(name = "user_item_valid",
               def = "{'userId': 1, 'applicableItemId': 1, 'isUsed': 1, 'expiryTime': 1}")
public class Coupon {

    @Id
    private String id;

    /**
     * Unique coupon code (e.g., "BUNDLE-ABC123", "SUMMER25", "WELCOME10")
     */
    @Indexed(unique = true)
    private String code;

    /**
     * Coupon type: BUNDLE, VENDOR_PROMOTION, REFERRAL, SEASONAL, CUSTOM
     */
    @Indexed
    private String couponType;

    /**
     * User ID who can use this coupon
     * NULL = public coupon (anyone can use)
     * non-NULL = user-specific coupon
     */
    @Indexed
    private String userId;

    /**
     * Parent booking ID that generated this coupon (for BUNDLE type)
     * NULL for non-bundle coupons
     */
    @Indexed
    private String parentBookingId;

    /**
     * Item ID this coupon can be applied to
     * NULL = can be applied to any item in the applicableCategoryId
     */
    private String applicableItemId;

    /**
     * Category ID this coupon can be applied to
     * NULL = can be applied to items in any category
     */
    @Indexed
    private String applicableCategoryId;

    /**
     * Discount percentage (e.g., 10 for 10% off, 100 for free)
     */
    private Integer discountPercentage;

    /**
     * Maximum number of times this coupon can be used
     * NULL = single-use coupon
     * positive number = can be used that many times
     */
    private Integer maxUsageCount;

    /**
     * Current usage count (how many times already used)
     */
    private Integer currentUsageCount;

    /**
     * Coupon expiry time
     */
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime expiryTime;

    /**
     * Whether coupon has been used (for single-use coupons)
     * Deprecated: Use maxUsageCount/currentUsageCount instead
     */
    @Deprecated
    private Boolean isUsed;

    /**
     * Created by vendor ID (for vendor-created coupons)
     * NULL for system-generated coupons
     */
    @Indexed
    private String createdByVendorId;

    /**
     * Booking ID where this coupon was used (if used)
     */
    private String usedInBookingId;

    /**
     * When the coupon was used
     */
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime usedAt;

    /**
     * When the coupon was created
     */
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * Human-readable description
     */
    private String description;

    /**
     * Whether this bundle coupon is valid only for same-day bookings
     * - true: Coupon can only be used for booking on the same date as parent booking
     *         (e.g., Hall bundled with Catering must be on the same day)
     * - false/null: Coupon can be used for any date (e.g., Photography for any day)
     * Only applies to BUNDLE type coupons
     */
    private Boolean sameDayOnly;

    /**
     * Parent booking date reference (for same-day validation)
     * Stores the booking date from parent booking for same-day validation
     * Only populated for BUNDLE coupons with sameDayOnly = true
     *
     * @JsonFormat ensures MongoDB LocalDate serializes as ISO string "YYYY-MM-DD"
     * instead of array [YYYY, M, D] for consistent frontend/backend handling
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate parentBookingDate;
}
