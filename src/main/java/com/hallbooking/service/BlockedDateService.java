package com.hallbooking.service;

import com.hallbooking.dao.BlockedDateDao;
import com.hallbooking.dao.ItemDao;
import com.hallbooking.dto.request.BlockedDateRequest;
import com.hallbooking.dto.response.BlockedDateResponse;
import com.hallbooking.model.BlockedDate;
import com.hallbooking.model.Item;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BlockedDateService {

    @Autowired
    private BlockedDateDao blockedDateDao;

    @Autowired
    private ItemDao itemDao;

    /**
     * Create a new blocked date range for an item
     */
    public BlockedDateResponse createBlockedDate(BlockedDateRequest request, String vendorId) throws Exception {
        // Validate dates
        if (request.getStartDate() == null || request.getEndDate() == null) {
            throw new IllegalArgumentException("Start date and end date are required");
        }

        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new IllegalArgumentException("Start date must be before end date");
        }

        // Get item to verify it exists and belongs to vendor
        Item item = itemDao.fetchItemDetails(request.getItemId());
        if (item == null) {
            throw new IllegalArgumentException("Item not found");
        }

        if (!item.getVendorId().equals(vendorId)) {
            throw new IllegalArgumentException("You can only block dates for your own items");
        }

        // Extract item name from various possible fields
        String itemName = null;
        if (item.getDynamicData() != null) {
            itemName = (String) item.getDynamicData().get("name");
            if (itemName == null) {
                itemName = (String) item.getDynamicData().get("restaurant_name");
            }
            if (itemName == null) {
                itemName = (String) item.getDynamicData().get("service_name");
            }
        }
        if (itemName == null && item.getDetails() != null) {
            itemName = item.getDetails().getName();
        }
        if (itemName == null) {
            itemName = "Item " + item.getId();
        }

        // Create blocked date
        BlockedDate blockedDate = new BlockedDate();
        blockedDate.setItemId(request.getItemId());
        blockedDate.setItemName(itemName);
        blockedDate.setVendorId(vendorId);
        blockedDate.setStartDate(request.getStartDate());
        blockedDate.setEndDate(request.getEndDate());
        blockedDate.setReason(request.getReason());
        blockedDate.setNotes(request.getNotes());
        blockedDate.setCreatedBy(vendorId);
        blockedDate.setCreatedOn(new Date());
        blockedDate.setLastUpdateDate(new Date());

        BlockedDate saved = blockedDateDao.createBlockedDate(blockedDate);
        return convertToResponse(saved);
    }

    /**
     * Get all blocked dates for an item
     */
    public List<BlockedDateResponse> getBlockedDatesByItemId(String itemId) {
        List<BlockedDate> blockedDates = blockedDateDao.getBlockedDatesByItemId(itemId);
        return blockedDates.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all blocked dates for a vendor
     */
    public List<BlockedDateResponse> getBlockedDatesByVendorId(String vendorId) {
        List<BlockedDate> blockedDates = blockedDateDao.getBlockedDatesByVendorId(vendorId);
        return blockedDates.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Delete a blocked date
     */
    public void deleteBlockedDate(String id, String vendorId) {
        BlockedDate blockedDate = blockedDateDao.getBlockedDateById(id);

        if (blockedDate == null) {
            throw new IllegalArgumentException("Blocked date not found");
        }

        if (!blockedDate.getVendorId().equals(vendorId)) {
            throw new IllegalArgumentException("You can only delete your own blocked dates");
        }

        blockedDateDao.deleteBlockedDate(id);
    }

    /**
     * Check if dates are available for booking
     */
    public boolean areDatesAvailable(String itemId, LocalDateTime startDate, LocalDateTime endDate) {
        return blockedDateDao.areDatesAvailable(itemId, startDate, endDate);
    }

    /**
     * Get overlapping blocked dates for display to user
     */
    public List<BlockedDateResponse> getOverlappingBlockedDates(String itemId, LocalDateTime startDate, LocalDateTime endDate) {
        List<BlockedDate> blockedDates = blockedDateDao.findOverlappingBlockedDates(itemId, startDate, endDate);
        return blockedDates.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private BlockedDateResponse convertToResponse(BlockedDate blockedDate) {
        BlockedDateResponse response = new BlockedDateResponse();
        response.setId(blockedDate.getId());
        response.setItemId(blockedDate.getItemId());
        response.setItemName(blockedDate.getItemName());
        response.setVendorId(blockedDate.getVendorId());
        response.setStartDate(blockedDate.getStartDate());
        response.setEndDate(blockedDate.getEndDate());
        response.setReason(blockedDate.getReason());
        response.setNotes(blockedDate.getNotes());
        response.setCreatedOn(blockedDate.getCreatedOn());
        response.setCreatedBy(blockedDate.getCreatedBy());
        return response;
    }
}
