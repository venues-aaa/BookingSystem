package com.hallbooking.controller;

import com.hallbooking.model.Vendor;
import com.hallbooking.service.VendorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/api/vendor")
public class VendorController {

    private static final Logger logger = LoggerFactory.getLogger(VendorController.class);

    @Autowired
    private VendorService vendorService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createVendor(@RequestBody Vendor vendor) {
        try {
            Vendor createdVendor = vendorService.createVendor(vendor);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Vendor created successfully");
            response.put("data", createdVendor);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            logger.error("Error creating vendor", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(buildErrorResponse(e.getMessage()));
        }
    }

    @PutMapping("/{vendorId}")
    public ResponseEntity<Map<String, Object>> updateVendor(@PathVariable String vendorId, @RequestBody Vendor vendor) {
        try {
            Vendor updatedVendor = vendorService.updateVendor(vendorId, vendor);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Vendor updated successfully");
            response.put("data", updatedVendor);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error updating vendor", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(buildErrorResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{vendorId}")
    public ResponseEntity<Map<String, Object>> deleteVendor(@PathVariable String vendorId) {
        try {
            boolean deleted = vendorService.deleteVendor(vendorId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", deleted);
            response.put("message", deleted ? "Vendor deleted successfully" : "Vendor not found");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error deleting vendor", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(buildErrorResponse("Failed to delete vendor"));
        }
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllVendors() {
        try {
            List<Vendor> vendors = vendorService.getAllAvailableVendors();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", vendors);
            response.put("total", vendors.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching vendors", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(buildErrorResponse("Failed to fetch vendors"));
        }
    }

    @GetMapping("/{vendorId}")
    public ResponseEntity<Map<String, Object>> getVendorById(@PathVariable String vendorId) {
        try {
            Vendor vendor = vendorService.getVendorById(vendorId);
            if (vendor == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(buildErrorResponse("Vendor not found"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", vendor);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching vendor by id", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(buildErrorResponse("Failed to fetch vendor"));
        }
    }

    @GetMapping("/{vendorId}/banking")
    public ResponseEntity<Map<String, Object>> getVendorBankingDetails(@PathVariable String vendorId) {
        try {
            Map<String, Object> data = vendorService.getVendorBankingDetails(vendorId);
            if (data == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(buildErrorResponse("Vendor not found"));
            }
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", data);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching vendor banking details", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(buildErrorResponse("Failed to fetch banking details"));
        }
    }

    @PutMapping("/{vendorId}/banking")
    public ResponseEntity<Map<String, Object>> updateVendorBankingDetails(@PathVariable String vendorId, @RequestBody Map<String, Object> bankingDetails) {
        try {
            Vendor updatedVendor = vendorService.updateVendorBankingDetails(vendorId, bankingDetails);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Banking details updated successfully");
            response.put("data", updatedVendor);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error updating vendor banking details", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(buildErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/{vendorId}/notifications")
    public ResponseEntity<Map<String, Object>> getVendorNotificationSettings(@PathVariable String vendorId) {
        try {
            Map<String, Object> data = vendorService.getVendorNotificationSettings(vendorId);
            if (data == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(buildErrorResponse("Vendor not found"));
            }
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", data);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching vendor notification settings", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(buildErrorResponse("Failed to fetch notification settings"));
        }
    }

    @PutMapping("/{vendorId}/notifications")
    public ResponseEntity<Map<String, Object>> updateVendorNotificationSettings(@PathVariable String vendorId, @RequestBody Map<String, Object> notificationSettings) {
        try {
            Vendor updatedVendor = vendorService.updateVendorNotificationSettings(vendorId, notificationSettings);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Notification settings updated successfully");
            response.put("data", updatedVendor);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error updating vendor notification settings", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(buildErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/{vendorId}/subscription")
    public ResponseEntity<Map<String, Object>> getVendorSubscriptionDetails(@PathVariable String vendorId) {
        try {
            Map<String, Object> data = vendorService.getVendorSubscriptionDetails(vendorId);
            if (data == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(buildErrorResponse("Vendor not found"));
            }
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", data);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching vendor subscription details", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(buildErrorResponse("Failed to fetch subscription details"));
        }
    }

    @PutMapping("/{vendorId}/subscription")
    public ResponseEntity<Map<String, Object>> updateVendorSubscriptionDetails(@PathVariable String vendorId, @RequestBody Map<String, Object> subscriptionDetails) {
        try {
            Vendor updatedVendor = vendorService.updateVendorSubscriptionDetails(vendorId, subscriptionDetails);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Subscription details updated successfully");
            response.put("data", updatedVendor);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error updating vendor subscription details", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(buildErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/{vendorId}/verification")
    public ResponseEntity<Map<String, Object>> getVendorBusinessVerificationDetails(@PathVariable String vendorId) {
        try {
            Map<String, Object> data = vendorService.getVendorBusinessVerificationDetails(vendorId);
            if (data == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(buildErrorResponse("Vendor not found"));
            }
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", data);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching vendor verification details", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(buildErrorResponse("Failed to fetch verification details"));
        }
    }

    private Map<String, Object> buildErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }
}
