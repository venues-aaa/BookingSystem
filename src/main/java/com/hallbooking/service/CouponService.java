package com.hallbooking.service;

import com.hallbooking.dao.CouponDao;
import com.hallbooking.model.Coupon;
import com.hallbooking.model.Item;
import com.hallbooking.model.BundledItem;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class CouponService {

    private static final int COUPON_EXPIRY_HOURS = 48;
    private static final int BOOKING_ID_SUFFIX_LENGTH = 6;
    private static final int RANDOM_CODE_LENGTH = 6;

    // Coupon Types
    public static final String COUPON_TYPE_BUNDLE = "BUNDLE";
    public static final String COUPON_TYPE_VENDOR_PROMOTION = "VENDOR_PROMOTION";
    public static final String COUPON_TYPE_REFERRAL = "REFERRAL";
    public static final String COUPON_TYPE_SEASONAL = "SEASONAL";
    public static final String COUPON_TYPE_CUSTOM = "CUSTOM";

    @Autowired
    private CouponDao couponDao;

    @Autowired
    private ItemService itemService;

    /**
     * Generate coupons for bundle offers when a booking is created
     *
     * @param bookingId Parent booking ID
     * @param userId User ID
     * @param itemId Item ID that was booked
     * @param bookingFromDate Parent booking start date (for same-day validation)
     * @return List of generated coupons
     */
    public List<Coupon> generateBundleCoupons(String bookingId, String userId, String itemId, LocalDateTime bookingFromDate) {
        List<Coupon> generatedCoupons = new ArrayList<>();

        try {
            // Get the booked item
            Item item = itemService.getItemById(itemId);

            if (item.getDiscountedBundledItems() == null || item.getDiscountedBundledItems().isEmpty()) {
                return generatedCoupons; // No bundle offers
            }

            // Extract date portion for same-day validation
            LocalDate parentBookingDate = bookingFromDate != null
                ? bookingFromDate.toLocalDate()
                : null;

            log.info("=== COUPON GENERATION DEBUG ===");
            log.info("Booking ID: {}", bookingId);
            log.info("Input bookingFromDate (LocalDateTime): {}", bookingFromDate);
            log.info("Extracted parentBookingDate (LocalDate): {}", parentBookingDate);
            log.info("===============================");

            // Generate a coupon for each bundle offer
            for (BundledItem bundleItem : item.getDiscountedBundledItems()) {
                // CRITICAL: Validate same-day coupons have a valid booking date
                if (Boolean.TRUE.equals(bundleItem.getSameDayOnly()) && parentBookingDate == null) {
                    log.warn("Skipping same-day bundle coupon for item {} - booking date is null", bundleItem.getItemId());
                    continue; // Skip this bundle item
                }

                Coupon coupon = new Coupon();

                // Generate unique coupon code
                String shortBookingId = bookingId.substring(Math.max(0, bookingId.length() - BOOKING_ID_SUFFIX_LENGTH));
                String randomPart = UUID.randomUUID().toString().substring(0, RANDOM_CODE_LENGTH).toUpperCase();
                coupon.setCode("BUNDLE-" + shortBookingId + "-" + randomPart);

                // Bundle coupon properties
                coupon.setCouponType(COUPON_TYPE_BUNDLE);
                coupon.setUserId(userId); // User-specific
                coupon.setParentBookingId(bookingId);
                coupon.setApplicableItemId(bundleItem.getItemId());
                coupon.setDiscountPercentage(bundleItem.getDiscountPercentage());

                // Same-day restriction
                coupon.setSameDayOnly(bundleItem.getSameDayOnly());
                if (Boolean.TRUE.equals(bundleItem.getSameDayOnly())) {
                    coupon.setParentBookingDate(parentBookingDate);
                }

                // Expiry: 48 hours from now
                coupon.setExpiryTime(LocalDateTime.now().plusHours(COUPON_EXPIRY_HOURS));

                // Single-use coupon
                coupon.setMaxUsageCount(1);
                coupon.setCurrentUsageCount(0);
                coupon.setIsUsed(false); // Backward compatibility
                coupon.setCreatedAt(LocalDateTime.now());

                // Get bundle item name for description (with error handling)
                String itemName;
                try {
                    Item bundleItemDetails = itemService.getItemById(bundleItem.getItemId());
                    itemName = getItemName(bundleItemDetails);
                } catch (Exception e) {
                    log.warn("Failed to fetch bundle item {} for coupon description, using fallback name: {}",
                        bundleItem.getItemId(), e.getMessage());
                    itemName = "Item " + bundleItem.getItemId(); // Fallback name
                }

                String sameDayText = Boolean.TRUE.equals(bundleItem.getSameDayOnly())
                    ? " (same-day only)"
                    : "";

                coupon.setDescription(String.format(
                    "%d%% discount on %s%s (valid for 48 hours)",
                    bundleItem.getDiscountPercentage(),
                    itemName,
                    sameDayText
                ));

                Coupon savedCoupon = couponDao.save(coupon);
                generatedCoupons.add(savedCoupon);
            }

        } catch (Exception e) {
            log.error("Failed to generate bundle coupons for booking {}: {}", bookingId, e.getMessage(), e);
        }

        return generatedCoupons;
    }

    /**
     * Validate and apply coupon to a booking
     * Supports both user-specific and public coupons
     * Supports both item-specific and category-wide coupons
     *
     * @param code Coupon code
     * @param userId User ID
     * @param itemId Item ID being booked
     * @param bookingDate Booking date (YYYY-MM-DD) for same-day validation
     * @return Coupon if valid, null otherwise
     */
    public Coupon validateAndGetCoupon(String code, String userId, String itemId, String bookingDate) {
        Coupon coupon = couponDao.findByCode(code);

        if (coupon == null) {
            throw new RuntimeException("Invalid coupon code");
        }

        // Check expiry
        if (coupon.getExpiryTime() != null && coupon.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Coupon has expired");
        }

        // Check usage limit
        if (coupon.getMaxUsageCount() != null) {
            if (coupon.getCurrentUsageCount() != null &&
                coupon.getCurrentUsageCount() >= coupon.getMaxUsageCount()) {
                throw new RuntimeException("Coupon has reached maximum usage limit");
            }
        } else {
            // Fallback to old isUsed field for backward compatibility
            if (coupon.getIsUsed() != null && coupon.getIsUsed()) {
                throw new RuntimeException("Coupon already used");
            }
        }

        // Check user-specific coupon (NULL userId means public coupon)
        if (coupon.getUserId() != null && !coupon.getUserId().equals(userId)) {
            throw new RuntimeException("Coupon is not valid for this user");
        }

        // Check item/category applicability
        if (coupon.getApplicableItemId() != null) {
            // Item-specific coupon
            if (!coupon.getApplicableItemId().equals(itemId)) {
                throw new RuntimeException("Coupon is not valid for this item");
            }
        } else if (coupon.getApplicableCategoryId() != null) {
            // Category-specific coupon - verify item belongs to this category
            try {
                Item item = itemService.getItemById(itemId);
                if (!coupon.getApplicableCategoryId().equals(item.getCategoryId())) {
                    throw new RuntimeException("Coupon is not valid for this item category");
                }
            } catch (Exception e) {
                log.error("Failed to verify item category for coupon validation: {}", e.getMessage());
                throw new RuntimeException("Failed to validate coupon applicability");
            }
        }
        // If both applicableItemId and applicableCategoryId are NULL, coupon is valid for any item

        // Check same-day restriction for bundle coupons
        if (Boolean.TRUE.equals(coupon.getSameDayOnly())) {
            log.info("=== SAME-DAY COUPON VALIDATION ===");
            log.info("Coupon code: {}", coupon.getCode());
            log.info("Coupon parentBookingDate: {}", coupon.getParentBookingDate());
            log.info("Booking date received: {}", bookingDate);

            if (bookingDate == null || bookingDate.trim().isEmpty()) {
                throw new RuntimeException("Booking date is required for same-day coupon validation");
            }

            if (coupon.getParentBookingDate() == null) {
                throw new RuntimeException("Same-day coupon is missing parent booking date");
            }

            // Parse and compare LocalDate objects for type-safe comparison
            try {
                LocalDate bookingLocalDate = LocalDate.parse(bookingDate);
                LocalDate parentDate = coupon.getParentBookingDate();

                log.info("Parsed booking date: {}", bookingLocalDate);
                log.info("Parent booking date: {}", parentDate);
                log.info("Dates equal? {}", parentDate.equals(bookingLocalDate));

                if (!parentDate.equals(bookingLocalDate)) {
                    String errorMsg = String.format(
                        "This coupon is only valid for bookings on %s (same day as parent booking). You tried to book on %s",
                        parentDate.toString(),
                        bookingLocalDate.toString()
                    );
                    log.warn("Same-day validation FAILED: {}", errorMsg);
                    throw new RuntimeException(errorMsg);
                }

                log.info("Same-day validation PASSED");
                log.info("==================================");
            } catch (java.time.format.DateTimeParseException e) {
                log.error("Invalid booking date format: {}", bookingDate, e);
                throw new RuntimeException("Invalid booking date format. Expected: YYYY-MM-DD");
            }
        }

        return coupon;
    }

    /**
     * Mark coupon as used
     *
     * @param couponCode Coupon code
     * @param bookingId Booking ID where coupon was used
     */
    public void markCouponAsUsed(String couponCode, String bookingId) {
        Coupon coupon = couponDao.findByCode(couponCode);
        if (coupon != null) {
            // Increment usage count
            if (coupon.getMaxUsageCount() != null) {
                int currentCount = coupon.getCurrentUsageCount() != null ? coupon.getCurrentUsageCount() : 0;
                coupon.setCurrentUsageCount(currentCount + 1);
            }

            // Backward compatibility
            coupon.setIsUsed(true);
            coupon.setUsedInBookingId(bookingId);
            coupon.setUsedAt(LocalDateTime.now());

            couponDao.save(coupon);
            log.info("Coupon {} marked as used for booking {}", couponCode, bookingId);
        }
    }

    /**
     * Get all coupons for a user
     *
     * @param userId User ID
     * @return List of coupons
     */
    public List<Coupon> getUserCoupons(String userId) {
        return couponDao.findByUserId(userId);
    }

    /**
     * Get valid (unused, not expired) coupons for a user and item
     *
     * @param userId User ID
     * @param itemId Item ID
     * @return List of valid coupons
     */
    public List<Coupon> getValidCouponsForItem(String userId, String itemId) {
        return couponDao.findValidCouponsForUserAndItem(userId, itemId);
    }

    /**
     * Get coupons generated from a booking
     *
     * @param bookingId Booking ID
     * @return List of coupons
     */
    public List<Coupon> getCouponsByBooking(String bookingId) {
        return couponDao.findByParentBookingId(bookingId);
    }

    /**
     * Create a new coupon (vendor/admin)
     *
     * @param coupon Coupon to create
     * @return Created coupon
     */
    public Coupon createCoupon(Coupon coupon) {
        // Validate required fields
        if (coupon.getCode() == null || coupon.getCode().trim().isEmpty()) {
            throw new RuntimeException("Coupon code is required");
        }

        if (coupon.getDiscountPercentage() == null || coupon.getDiscountPercentage() <= 0) {
            throw new RuntimeException("Valid discount percentage is required");
        }

        // Check if code already exists
        Coupon existing = couponDao.findByCode(coupon.getCode());
        if (existing != null) {
            throw new RuntimeException("Coupon code already exists");
        }

        // Set defaults
        if (coupon.getCouponType() == null) {
            coupon.setCouponType(COUPON_TYPE_CUSTOM);
        }

        if (coupon.getCreatedAt() == null) {
            coupon.setCreatedAt(LocalDateTime.now());
        }

        if (coupon.getMaxUsageCount() == null) {
            coupon.setMaxUsageCount(1); // Default: single-use
        }

        if (coupon.getCurrentUsageCount() == null) {
            coupon.setCurrentUsageCount(0);
        }

        coupon.setIsUsed(false); // Backward compatibility

        return couponDao.save(coupon);
    }

    /**
     * Get valid public coupons for an item
     *
     * @param itemId Item ID
     * @return List of public coupons
     */
    public List<Coupon> getPublicCouponsForItem(String itemId) {
        return couponDao.findValidPublicCouponsForItem(itemId);
    }

    /**
     * Get all coupons created by a vendor
     *
     * @param vendorId Vendor ID
     * @return List of coupons
     */
    public List<Coupon> getVendorCoupons(String vendorId) {
        return couponDao.findByVendorId(vendorId);
    }

    /**
     * Release a coupon that was used in a booking (mark as unused)
     * Called when a booking is cancelled
     *
     * @param bookingId Booking ID where coupon was used
     */
    public void releaseCouponUsedInBooking(String bookingId) {
        // Find coupon that was used in this booking
        List<Coupon> allCoupons = couponDao.findAll();
        Coupon usedCoupon = null;

        for (Coupon coupon : allCoupons) {
            if (bookingId.equals(coupon.getUsedInBookingId())) {
                usedCoupon = coupon;
                break;
            }
        }

        if (usedCoupon == null) {
            log.info("No coupon found for booking {}", bookingId);
            return;
        }

        log.info("Releasing coupon {} that was used in cancelled booking {}", usedCoupon.getCode(), bookingId);

        // Reset usage tracking
        usedCoupon.setIsUsed(false);
        if (usedCoupon.getCurrentUsageCount() != null && usedCoupon.getCurrentUsageCount() > 0) {
            usedCoupon.setCurrentUsageCount(usedCoupon.getCurrentUsageCount() - 1);
        }
        usedCoupon.setUsedInBookingId(null);
        usedCoupon.setUsedAt(null);

        couponDao.save(usedCoupon);
        log.info("Coupon {} released and can be used again", usedCoupon.getCode());
    }

    /**
     * Check if any coupons from a parent booking have been used
     * Called before allowing parent booking cancellation
     *
     * @param parentBookingId Parent booking ID
     * @return List of booking IDs where coupons were used (empty if none)
     */
    public List<String> checkUsedCoupons(String parentBookingId) {
        List<Coupon> coupons = couponDao.findByParentBookingId(parentBookingId);
        List<String> usedInBookingIds = new ArrayList<>();

        for (Coupon coupon : coupons) {
            // Check if coupon was used
            if (Boolean.TRUE.equals(coupon.getIsUsed()) ||
                (coupon.getCurrentUsageCount() != null && coupon.getCurrentUsageCount() > 0)) {

                if (coupon.getUsedInBookingId() != null && !coupon.getUsedInBookingId().isEmpty()) {
                    usedInBookingIds.add(coupon.getUsedInBookingId());
                }
            }
        }

        return usedInBookingIds;
    }

    /**
     * Invalidate all coupons generated from a parent booking
     * Called when the parent booking is cancelled
     *
     * @param parentBookingId Parent booking ID
     * @throws RuntimeException if any coupons were already used
     */
    public void invalidateCouponsByParentBooking(String parentBookingId) {
        List<Coupon> coupons = couponDao.findByParentBookingId(parentBookingId);

        if (coupons.isEmpty()) {
            log.info("No coupons found for parent booking {}", parentBookingId);
            return;
        }

        // Check if any coupons were already used - this should have been checked before calling this method
        List<String> usedInBookingIds = new ArrayList<>();
        for (Coupon coupon : coupons) {
            if (Boolean.TRUE.equals(coupon.getIsUsed()) ||
                (coupon.getCurrentUsageCount() != null && coupon.getCurrentUsageCount() > 0)) {

                if (coupon.getUsedInBookingId() != null && !coupon.getUsedInBookingId().isEmpty()) {
                    usedInBookingIds.add(coupon.getUsedInBookingId());
                }
            }
        }

        if (!usedInBookingIds.isEmpty()) {
            throw new RuntimeException(
                "Cannot invalidate coupons - some coupons have already been used in bookings: " +
                String.join(", ", usedInBookingIds) +
                ". This should have been prevented by pre-cancellation validation."
            );
        }

        log.info("Invalidating {} coupon(s) for cancelled booking {}", coupons.size(), parentBookingId);

        for (Coupon coupon : coupons) {
            // Set expiry to past date to invalidate
            coupon.setExpiryTime(LocalDateTime.now().minusDays(1));
            coupon.setIsUsed(true); // Mark as used for backward compatibility

            // Update description to indicate cancellation
            String originalDesc = coupon.getDescription();
            coupon.setDescription("[CANCELLED] " + originalDesc + " - Parent booking was cancelled");

            couponDao.save(coupon);
            log.info("Invalidated coupon: {}", coupon.getCode());
        }

        log.info("Successfully invalidated all coupons for booking {}", parentBookingId);
    }

    /**
     * Extract item name from item data
     */
    private String getItemName(Item item) {
        if (item.getDynamicData() != null) {
            Object name = item.getDynamicData().get("restaurant_name");
            if (name != null) return name.toString();

            name = item.getDynamicData().get("name");
            if (name != null) return name.toString();

            name = item.getDynamicData().get("field_hall_name");
            if (name != null) return name.toString();
        }

        return item.getType();
    }
}
