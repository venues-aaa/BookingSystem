package com.hallbooking.dao;

import com.hallbooking.model.BlockedDate;

import java.time.LocalDateTime;
import java.util.List;

public interface BlockedDateDao {

    /**
     * Create a new blocked date range for an item
     */
    BlockedDate createBlockedDate(BlockedDate blockedDate) throws Exception;

    /**
     * Get all blocked dates for a specific item
     */
    List<BlockedDate> getBlockedDatesByItemId(String itemId);

    /**
     * Get all blocked dates for a specific vendor
     */
    List<BlockedDate> getBlockedDatesByVendorId(String vendorId);

    /**
     * Get a specific blocked date by ID
     */
    BlockedDate getBlockedDateById(String id);

    /**
     * Delete a blocked date range
     */
    void deleteBlockedDate(String id);

    /**
     * Check if a date range overlaps with any blocked dates for an item
     * Returns list of overlapping blocked date records
     */
    List<BlockedDate> findOverlappingBlockedDates(String itemId, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Check if specific dates are available (not blocked) for an item
     */
    boolean areDatesAvailable(String itemId, LocalDateTime startDate, LocalDateTime endDate);
}
