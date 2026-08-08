package com.hallbooking.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.google.common.net.HttpHeaders;
import com.hallbooking.dto.request.CreateBookingRequest;
import com.hallbooking.dto.response.BookingResponse;
import com.hallbooking.mapper.BookingMapper;
import com.hallbooking.model.Booking;
import com.hallbooking.model.Coupon;
import com.hallbooking.model.Notification;
import com.hallbooking.model.ResponseModel;
import com.hallbooking.model.User;
import com.hallbooking.service.BookingService;
import com.hallbooking.service.CouponService;
import com.itextpdf.text.DocumentException;
import jakarta.validation.Valid;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.FileNotFoundException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.ParseException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bookings")
@CrossOrigin(origins = "*", maxAge = 3600)
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private CouponService couponService;

    @GetMapping("/")
    public ResponseEntity<String> heartbeat() {
        System.out.println("Inside heartbeat - BookingService");
        LocalDateTime currentDateTime = LocalDateTime.now();
        System.out.println("Current DateTime: " + currentDateTime);
        return ResponseEntity.status(HttpStatus.OK).body("Success - BookingController is Up and Running");
    }

    /**
     * Method to create Booking and send the response back with booking id
     * 
     * @param request
     * @param
     * @return
     * @throws Exception
     */
    @PostMapping("/create")
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody CreateBookingRequest request/*
                                                             * ,
                                                             * 
                                                             * @AuthenticationPrincipal UserDetails userDetails
                                                             */) throws Exception {

        Booking bookingObj = new Booking();
        BookingMapper.toBooking(request, bookingObj);

        // If coupon code is provided, validate and apply it
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            try {
                // Extract booking date for same-day validation
                // Normalize to YYYY-MM-DD format (ISO-8601 date)
                String bookingDate = null;
                if (request.getStartDateTime() != null) {
                    bookingDate = request.getStartDateTime().toLocalDate().toString();
                }

                System.out.println("=== COUPON VALIDATION IN BOOKING CREATION ===");
                System.out.println("Coupon code: " + request.getCouponCode());
                System.out.println("Request startDateTime: " + request.getStartDateTime());
                System.out.println("Extracted bookingDate: " + bookingDate);
                System.out.println("User ID: " + bookingObj.getUserId());
                System.out.println("Item ID: " + bookingObj.getItemId());
                System.out.println("===========================================");

                Coupon coupon = couponService.validateAndGetCoupon(
                        request.getCouponCode(),
                        bookingObj.getUserId(),
                        bookingObj.getItemId(),
                        bookingDate);

                // Apply coupon discount (with null check)
                Integer discountPercentage = coupon.getDiscountPercentage();
                if (discountPercentage == null) {
                    System.err.println("Coupon " + coupon.getCode() + " has null discount percentage");
                    throw new RuntimeException("Invalid coupon: discount percentage not set");
                }

                bookingObj.setDiscountApplied(Double.valueOf(discountPercentage));
                bookingObj.setDiscountReason("Coupon: " + coupon.getCode() + " (" + coupon.getDescription() + ")");

                // Mark coupon as used after booking is created
                // (will be done in a separate step after booking creation)

            } catch (RuntimeException e) {
                // Return error if coupon validation fails
                throw new RuntimeException("Coupon validation failed: " + e.getMessage());
            }
        }

        Booking booking = bookingService.createBooking(bookingObj, /* userDetails.getUsername() */"aaa");

        // Mark coupon as used if it was applied
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            try {
                couponService.markCouponAsUsed(request.getCouponCode(), booking.getId());
            } catch (Exception e) {
                // Log but don't fail the booking
                System.err.println("Failed to mark coupon as used: " + e.getMessage());
            }
        }

        BookingResponse bookingResponse = new BookingResponse();
        BeanUtils.copyProperties(booking, bookingResponse);

        return ResponseEntity.status(HttpStatus.CREATED).body(bookingResponse);
    }

    /*
     * @GetMapping("/my-bookings")
     * public ResponseEntity<Map<String, Object>> getMyBookings(
     * 
     * @AuthenticationPrincipal UserDetails userDetails,
     * 
     * @RequestParam(defaultValue = "0") int page,
     * 
     * @RequestParam(defaultValue = "10") int size,
     * 
     * @RequestParam(required = false) String status) {
     * 
     * Pageable pageable = PageRequest.of(page, size,
     * Sort.by("createdAt").descending());
     * Page<Booking> bookings;
     * 
     * if (status != null) {
     * bookings =
     * bookingService.retrieveUserBookedDetails(userDetails.getUsername(), status,
     * pageable);
     * } else {
     * bookings =
     * bookingService.retrieveUserBookedDetails(userDetails.getUsername(), null,
     * pageable);
     * }
     * 
     * Map<String, Object> response = new HashMap<>();
     * response.put("bookings", bookings.getContent());
     * response.put("currentPage", bookings.getNumber());
     * response.put("totalPages", bookings.getTotalPages());
     * response.put("totalElements", bookings.getTotalElements());
     * 
     * return ResponseEntity.ok(response);
     * }
     */

    @GetMapping("/history")
    public ResponseEntity<Map<String, Object>> getBookingHistory(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Booking> bookings = bookingService.retrieveUserBookedDetails(userDetails.getUsername(), status, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("bookings", bookings.getContent());
        response.put("currentPage", bookings.getNumber());
        response.put("totalPages", bookings.getTotalPages());
        response.put("totalElements", bookings.getTotalElements());

        return ResponseEntity.ok(response);
    }

    /**
     * Admin endpoint to get ALL bookings in the system
     * 
     * @param page
     * @param size
     * @param status Optional filter by status (Confirmed, Cancelled, etc.)
     * @return All bookings with pagination
     */
    @GetMapping("/admin/all")
    public ResponseEntity<Map<String, Object>> getAllBookingsForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Booking> bookings = bookingService.retrieveUserBookedDetails(null, status, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("availability", bookings.getContent());
        response.put("currentPage", bookings.getNumber());
        response.put("totalPages", bookings.getTotalPages());
        response.put("totalElements", bookings.getTotalElements());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/bookingById/{bookingId}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable("bookingId") String bookingId)
            throws Exception {

        BookingResponse bookingResponse = new BookingResponse();
        Booking booking = bookingService.getBookingById(bookingId);
        BeanUtils.copyProperties(booking, bookingResponse);
        return ResponseEntity.ok(bookingResponse);
    }

    @DeleteMapping("/{bookingId}")
    public ResponseEntity<Map<String, String>> cancelBooking(
            @PathVariable String bookingId,
            @RequestParam(required = false) String cancelReason) {

        bookingService.cancelBooking(bookingId, null, cancelReason);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Booking cancelled successfully");

        return ResponseEntity.ok(response);
    }

    /*---------------------------- Availability Details --------------------------------------------------------------------*/

    /**
     * Method to retrieve Item availability details based on ItemId, type and date.
     * For listing in the Item List Page
     * 
     * @param bookingObj
     * @return List<Booking>
     */
    @PostMapping("/avail/fetch")
    public ResponseEntity<Map<String, Object>> fetchAvailabilityBasedOn(@RequestBody Booking bookingObj) {

        List<Booking> availabilityDetailsList = bookingService.fetchAvailabilityBasedOn(bookingObj);
        Map<String, Object> response = new HashMap<>();
        response.put("availability", availabilityDetailsList);
        /*
         * response.put("currentPage", bookings.getNumber());
         * response.put("totalPages", bookings.getTotalPages());
         * response.put("totalElements", bookings.getTotalElements());
         */

        return ResponseEntity.ok(response);
    }

    /**
     * Method to confirm availability of an item based on itemId and date
     * 
     * @param bookingObj
     * @return Booking
     * @throws Exception
     */
    @PostMapping("/avail/confirm")
    public ResponseEntity<Boolean> confirmItemAvailability(@RequestBody Booking bookingObj) throws Exception {

        boolean availabilityFlag = bookingService.confirmItemAvailability(bookingObj);
        return ResponseEntity.ok(availabilityFlag);
    }

    /**
     * Method to check availability and suggest alternative slots
     * 
     * @param request
     * @return availability status and suggested slots
     * @throws Exception
     */
    @PostMapping("/check-availability")
    public ResponseEntity<Map<String, Object>> checkAvailabilityWithSuggestions(
            @RequestBody Map<String, Object> request) throws Exception {

        String itemId = (String) request.get("itemId");
        String bookingDate = (String) request.get("bookingDate");
        String slotType = (String) request.get("slotType");

        Map<String, Object> result = bookingService.checkAvailabilityWithSuggestions(itemId, bookingDate, slotType);
        return ResponseEntity.ok(result);
    }

    /**
     * Method to insert the availability details for a month
     * 
     * @param bookingObj
     * @return
     * @throws JsonProcessingException
     * @throws ParseException
     * @throws DocumentException
     * @throws FileNotFoundException
     */
    // Check----
    @PostMapping("/block/")
    public ResponseEntity<?> blockBooking(@RequestBody Booking bookingObj)
            throws JsonProcessingException, ParseException, FileNotFoundException, DocumentException {

        // String response = bookingService.blockBooking(bookingObj);
        ResponseModel responseModel = new ResponseModel();
        // responseModel.setResponseMsg(response);
        return ResponseEntity.ok(responseModel);
    }

    /**
     * Method to update availability based on cancel/refund
     * 
     * @param bookingObj
     * @return
     * @throws JsonProcessingException
     * @throws ParseException
     */
    @PutMapping("/update")
    public void updateBooking(@RequestBody Booking bookingObj) throws JsonProcessingException, ParseException {

        bookingService.updateBooking(bookingObj);

    }

    /**
     * Method to retrieve booked details for a user
     * 
     * @param userId
     * @return List<Booking>
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> retrieveUserBookedDetails(
            @PathVariable("userId") String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("bookingFromDate").descending());
        Page<Booking> bookings = bookingService.retrieveUserBookedDetails(userId, status, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("availability", bookings.getContent());
        response.put("currentPage", bookings.getNumber());
        response.put("totalPages", bookings.getTotalPages());
        response.put("totalElements", bookings.getTotalElements());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/user/hasBookedItem")
    public ResponseEntity<Map<String, Object>> retrieveUserBookedItemDetails(
            @RequestBody Booking bookingObj) {

        Map<String, Object> response = new HashMap<>();
        response.put("hasBooked", bookingService.hasUserBookedItem(bookingObj.getUserId(), bookingObj.getItemId()));

        return ResponseEntity.ok(response);
    }

    /**
     * Method to retrieve booked details based on vendorId
     * 
     * @param vendorId
     * @return List<Booking>
     */
    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<Map<String, Object>> retrieveVendorBookedDetails(@PathVariable("vendorId") String vendorId) {

        List<Booking> bookedDetails = bookingService.retrieveVendorBookedDetails(vendorId);
        Map<String, Object> response = new HashMap<>();
        response.put("availability", bookedDetails);
        /*
         * response.put("currentPage", bookings.getNumber());
         * response.put("totalPages", bookings.getTotalPages());
         * response.put("totalElements", bookings.getTotalElements());
         */
        return ResponseEntity.ok(response);
    }

    /**
     * Method to retrieve booked details based on vendorId
     * 
     * @param userId
     * @return List<Booking>
     */
    /*
     * @GetMapping("user/{userId}")
     * public ResponseEntity<Map<String, Object>>
     * retrieveUserBookedDetails(@PathVariable("userId") String userId) {
     * 
     * List<Booking> bookedDetails =
     * bookingProcessor.retrieveUserBookedDetails(userId);
     * 
     * return ResponseEntity.ok(bookedDetails);
     * }
     */

    /**
     * Method to retrieve booked details based on vendorId
     * 
     * @param bookedId
     * @return List<Booking>
     */
    /*
     * @GetMapping("/bookedDetails/{bookedId}")
     * public ResponseEntity<Map<String, Object>>
     * retrieveBookedDetailsBasedOn(@PathVariable("bookedId") String bookedId) {
     * 
     * Booking bookedDetails =
     * bookingService.retrieveBookedDetailsBasedOn(bookedId);
     * 
     * return ResponseEntity.ok(bookedDetails);
     * }
     */

    @GetMapping("/genrateInvoice/{bookedId}")
    public ResponseEntity<?> generateInvoice(@PathVariable("bookedId") String bookedId) {

        Path path = Paths.get("SimpleTable.pdf");
        Resource resource = null;
        try {
            resource = new UrlResource(path.toUri());
        } catch (MalformedURLException e) {
            e.printStackTrace();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/octet-stream"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\" SimpleTable.pdf + \"")
                .body(resource);
    }

    @GetMapping("/notificationCount/{vendorId}")
    public ResponseEntity<Integer> getNotificationCountForVendor(@PathVariable String vendorId) {
        int notificationCount = bookingService.getNotificationCountForVendor(vendorId);

        return ResponseEntity.ok(notificationCount);
    }

    /**
     * Method to retrieve booked details based on vendorId
     * 
     * @param vendorId
     * @return List<Booking>
     */
    @GetMapping("/notification/{vendorId}")
    public ResponseEntity<List<Notification>> getNotificationForVendor(@PathVariable("vendorId") String vendorId) {

        List<Notification> notificationList = bookingService.getNotificationForVendor(vendorId);

        return ResponseEntity.ok(notificationList);
    }

    /**
     * Get offline payment bookings pending vendor confirmation
     * 
     * @param vendorId
     * @return List<Booking>
     */
    @GetMapping("/vendor/{vendorId}/offline-pending")
    public ResponseEntity<Map<String, Object>> getOfflineBookingsPendingConfirmation(
            @PathVariable("vendorId") String vendorId) {
        List<Booking> bookings = bookingService.getOfflineBookingsPendingConfirmation(vendorId);

        Map<String, Object> response = new HashMap<>();
        response.put("bookings", bookings);
        response.put("count", bookings.size());

        return ResponseEntity.ok(response);
    }

    /**
     * Vendor confirms offline payment booking
     * 
     * @param bookingId
     * @param vendorId
     * @return ResponseEntity
     */
    @PostMapping("/{bookingId}/confirm-offline")
    public ResponseEntity<Map<String, Object>> confirmOfflineBooking(
            @PathVariable("bookingId") String bookingId,
            @RequestParam("vendorId") String vendorId) {

        try {
            bookingService.confirmOfflineBooking(bookingId, vendorId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Booking confirmed successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Vendor cancels offline payment booking
     * 
     * @param bookingId
     * @param vendorId
     * @param reason
     * @return ResponseEntity
     */
    @PostMapping("/{bookingId}/cancel-offline")
    public ResponseEntity<Map<String, Object>> cancelOfflineBooking(
            @PathVariable("bookingId") String bookingId,
            @RequestParam("vendorId") String vendorId,
            @RequestParam("reason") String reason) {

        try {
            bookingService.cancelOfflineBooking(bookingId, vendorId, reason);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Booking cancelled successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

}
