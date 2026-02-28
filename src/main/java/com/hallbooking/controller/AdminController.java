package com.hallbooking.controller;

import com.hallbooking.dto.request.CreateHallRequest;
import com.hallbooking.dto.request.UpdateHallRequest;
import com.hallbooking.dto.response.BookingResponse;
import com.hallbooking.dto.response.HallResponse;
import com.hallbooking.dto.response.UserResponse;
import com.hallbooking.entity.Booking;
import com.hallbooking.entity.BookingStatus;
import com.hallbooking.entity.Hall;
import com.hallbooking.entity.User;
import com.hallbooking.dao.impl.BookingRepository;
import com.hallbooking.dao.impl.UserRepository;
import com.hallbooking.service.HallService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private HallService hallService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/halls")
    public ResponseEntity<HallResponse> createHall(@Valid @RequestBody CreateHallRequest request) {
        Hall hall = hallService.createHall(request);
        HallResponse response = hallService.getHallById(hall.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/halls/{id}")
    public ResponseEntity<HallResponse> updateHall(
            @PathVariable Long id,
            @Valid @RequestBody UpdateHallRequest request) {
        Hall hall = hallService.updateHall(id, request);
        HallResponse response = hallService.getHallById(hall.getId());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/halls/{id}")
    public ResponseEntity<Map<String, String>> deleteHall(@PathVariable Long id) {
        hallService.deleteHall(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Hall deleted successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/bookings")
    public ResponseEntity<Map<String, Object>> getAllBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long hallId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) BookingStatus status) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Booking> bookings = bookingRepository.findAllWithFilters(hallId, userId, status, pageable);

        Page<BookingResponse> bookingResponses = bookings.map(booking -> new BookingResponse(
                booking.getId(),
                booking.getUser().getId(),
                booking.getUser().getUsername(),
                booking.getHall().getId(),
                booking.getHall().getName(),
                booking.getStartDateTime(),
                booking.getEndDateTime(),
                booking.getStatus(),
                booking.getTotalPrice(),
                booking.getPurpose(),
                booking.getNumberOfAttendees(),
                booking.getCreatedAt()
        ));

        Map<String, Object> response = new HashMap<>();
        response.put("bookings", bookingResponses.getContent());
        response.put("currentPage", bookingResponses.getNumber());
        response.put("totalPages", bookingResponses.getTotalPages());
        response.put("totalElements", bookingResponses.getTotalElements());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<User> users = userRepository.findAll(pageable);

        Page<UserResponse> userResponses = users.map(user -> new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole()
        ));

        Map<String, Object> response = new HashMap<>();
        response.put("users", userResponses.getContent());
        response.put("currentPage", userResponses.getNumber());
        response.put("totalPages", userResponses.getTotalPages());
        response.put("totalElements", userResponses.getTotalElements());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        long totalBookings = bookingRepository.count();
        long confirmedBookings = bookingRepository.findAllWithFilters(
                null, null, BookingStatus.CONFIRMED, Pageable.unpaged()
        ).getTotalElements();

        BigDecimal totalRevenue = bookingRepository.findAll().stream()
                .filter(booking -> booking.getStatus() == BookingStatus.CONFIRMED)
                .map(Booking::getTotalPrice)
                .filter(price -> price != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalUsers = userRepository.count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalBookings", totalBookings);
        stats.put("confirmedBookings", confirmedBookings);
        stats.put("totalRevenue", totalRevenue);
        stats.put("totalUsers", totalUsers);

        return ResponseEntity.ok(stats);
    }
}
