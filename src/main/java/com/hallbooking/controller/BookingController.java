package com.hallbooking.controller;

import com.hallbooking.dto.request.CreateBookingRequest;
import com.hallbooking.dto.response.BookingResponse;
import com.hallbooking.entity.Booking;
import com.hallbooking.entity.BookingStatus;
import com.hallbooking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*", maxAge = 3600)
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Booking booking = bookingService.createBooking(request, userDetails.getUsername());
        BookingResponse response = bookingService.getBookingById(booking.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<Map<String, Object>> getMyBookings(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) BookingStatus status) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<BookingResponse> bookings;

        if (status != null) {
            bookings = bookingService.getUserBookingsByStatus(userDetails.getUsername(), status, pageable);
        } else {
            bookings = bookingService.getUserBookings(userDetails.getUsername(), pageable);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("bookings", bookings.getContent());
        response.put("currentPage", bookings.getNumber());
        response.put("totalPages", bookings.getTotalPages());
        response.put("totalElements", bookings.getTotalElements());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<Map<String, Object>> getBookingHistory(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<BookingResponse> bookings = bookingService.getUserBookings(userDetails.getUsername(), pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("bookings", bookings.getContent());
        response.put("currentPage", bookings.getNumber());
        response.put("totalPages", bookings.getTotalPages());
        response.put("totalElements", bookings.getTotalElements());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        BookingResponse booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(booking);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        bookingService.cancelBooking(id, userDetails.getUsername());

        Map<String, String> response = new HashMap<>();
        response.put("message", "Booking cancelled successfully");

        return ResponseEntity.ok(response);
    }
}
