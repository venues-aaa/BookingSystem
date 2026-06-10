package com.hallbooking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * BundledItem - Represents an item offered as a bundle with configurable discount
 *
 * Used in Item.freeBundledItems to store both the item ID and discount percentage
 *
 * @author Hall Booking System
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BundledItem {

    /**
     * ID of the item being offered as a bundle
     */
    private String itemId;

    /**
     * Discount percentage (0-100)
     * - 0: No discount
     * - 50: Half price (50% off)
     * - 100: Free (100% off)
     */
    private Integer discountPercentage;

    /**
     * Whether the bundled item must be booked for the same day as the parent booking
     * - true: Coupon valid only for the same booking date (e.g., Hall with Catering on same day)
     * - false: Coupon valid for any date (e.g., Photography can be booked for any day)
     * Default: false (any day)
     */
    private Boolean sameDayOnly = false;
}
