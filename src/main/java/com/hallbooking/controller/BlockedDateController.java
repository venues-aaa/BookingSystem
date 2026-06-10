package com.hallbooking.controller;

import com.hallbooking.dto.request.BlockedDateRequest;
import com.hallbooking.dto.response.BlockedDateResponse;
import com.hallbooking.service.BlockedDateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class BlockedDateController {

    @Autowired
    private BlockedDateService blockedDateService;

    /**
     * Create a new blocked date range for vendor's item
     * POST /api/vendor/blocked-dates
     */
    @PostMapping("/vendor/blocked-dates")
    public ResponseEntity<?> createBlockedDate(
            @RequestBody BlockedDateRequest request,
            @RequestParam String vendorId) {
        try {
            BlockedDateResponse response = blockedDateService.createBlockedDate(request, vendorId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create blocked date: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get all blocked dates for a vendor
     * GET /api/vendor/blocked-dates?vendorId={vendorId}
     */
    @GetMapping("/vendor/blocked-dates")
    public ResponseEntity<?> getVendorBlockedDates(@RequestParam String vendorId) {
        try {
            List<BlockedDateResponse> blockedDates = blockedDateService.getBlockedDatesByVendorId(vendorId);
            return ResponseEntity.ok(blockedDates);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch blocked dates: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Delete a blocked date
     * DELETE /api/vendor/blocked-dates/{id}?vendorId={vendorId}
     */
    @DeleteMapping("/vendor/blocked-dates/{id}")
    public ResponseEntity<?> deleteBlockedDate(
            @PathVariable String id,
            @RequestParam String vendorId) {
        try {
            blockedDateService.deleteBlockedDate(id, vendorId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Blocked date deleted successfully");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete blocked date: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get all blocked dates for a specific item (public endpoint for users)
     * GET /api/items/{itemId}/blocked-dates
     */
    @GetMapping("/items/{itemId}/blocked-dates")
    public ResponseEntity<?> getItemBlockedDates(@PathVariable String itemId) {
        try {
            List<BlockedDateResponse> blockedDates = blockedDateService.getBlockedDatesByItemId(itemId);
            return ResponseEntity.ok(blockedDates);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch blocked dates: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Check if dates are available for an item
     * GET /api/items/{itemId}/availability?startDate={startDate}&endDate={endDate}
     */
    @GetMapping("/items/{itemId}/availability")
    public ResponseEntity<?> checkAvailability(
            @PathVariable String itemId,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDateTime start = LocalDateTime.parse(startDate);
            LocalDateTime end = LocalDateTime.parse(endDate);

            boolean available = blockedDateService.areDatesAvailable(itemId, start, end);
            List<BlockedDateResponse> overlapping = blockedDateService.getOverlappingBlockedDates(itemId, start, end);

            Map<String, Object> response = new HashMap<>();
            response.put("available", available);
            response.put("blockedDates", overlapping);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to check availability: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
