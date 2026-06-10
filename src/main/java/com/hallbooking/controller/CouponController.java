package com.hallbooking.controller;

import com.hallbooking.model.Coupon;
import com.hallbooking.service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/coupons")
@CrossOrigin(origins = "*")
public class CouponController {

    @Autowired
    private CouponService couponService;

    /**
     * GET /coupons/user/{userId}
     * Get all coupons for a user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getUserCoupons(@PathVariable String userId) {
        try {
            List<Coupon> coupons = couponService.getUserCoupons(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", coupons);
            response.put("total", coupons.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * GET /coupons/item/{itemId}/user/{userId}
     * Get valid coupons for a specific item and user
     */
    @GetMapping("/item/{itemId}/user/{userId}")
    public ResponseEntity<Map<String, Object>> getValidCouponsForItem(
            @PathVariable String itemId,
            @PathVariable String userId) {
        try {
            List<Coupon> coupons = couponService.getValidCouponsForItem(userId, itemId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", coupons);
            response.put("total", coupons.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * POST /coupons/validate
     * Validate a coupon code
     */
    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateCoupon(@RequestBody Map<String, String> request) {
        try {
            String code = request.get("code");
            String userId = request.get("userId");
            String itemId = request.get("itemId");
            String bookingDate = request.get("bookingDate"); // YYYY-MM-DD format

            Coupon coupon = couponService.validateAndGetCoupon(code, userId, itemId, bookingDate);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("valid", true);
            response.put("coupon", coupon);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("valid", false);
            response.put("message", e.getMessage());

            return ResponseEntity.ok(response); // Return 200 with valid=false instead of 400

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to validate coupon");

            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * GET /coupons/booking/{bookingId}
     * Get coupons generated from a booking
     */
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<Map<String, Object>> getCouponsByBooking(@PathVariable String bookingId) {
        try {
            List<Coupon> coupons = couponService.getCouponsByBooking(bookingId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", coupons);
            response.put("total", coupons.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * POST /coupons/create
     * Create a new coupon (vendor/admin only)
     */
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createCoupon(@RequestBody Coupon coupon) {
        try {
            Coupon createdCoupon = couponService.createCoupon(coupon);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", createdCoupon);
            response.put("message", "Coupon created successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * GET /coupons/public/item/{itemId}
     * Get valid public coupons for an item (available to all users)
     */
    @GetMapping("/public/item/{itemId}")
    public ResponseEntity<Map<String, Object>> getPublicCouponsForItem(@PathVariable String itemId) {
        try {
            List<Coupon> coupons = couponService.getPublicCouponsForItem(itemId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", coupons);
            response.put("total", coupons.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * GET /coupons/vendor/{vendorId}
     * Get all coupons created by a vendor
     */
    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<Map<String, Object>> getVendorCoupons(@PathVariable String vendorId) {
        try {
            List<Coupon> coupons = couponService.getVendorCoupons(vendorId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", coupons);
            response.put("total", coupons.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }
}
