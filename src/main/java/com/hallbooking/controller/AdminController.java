/*
package com.hallbooking.controller;

import com.hallbooking.dao.impl.BookingRepositoryImpl;
import com.hallbooking.dto.request.CreateHallRequest;
import com.hallbooking.dto.request.CreateUserRequest;
import com.hallbooking.dto.request.UpdateHallRequest;
import com.hallbooking.dto.request.UpdateUserRequest;
import com.hallbooking.dto.response.BookingResponse;
import com.hallbooking.dto.response.ItemResponse;
import com.hallbooking.dto.response.UserResponse;
import com.hallbooking.entity.Booking;
import com.hallbooking.entity.BookingStatus;
import com.hallbooking.entity.Hall;
import com.hallbooking.entity.User;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private BookingRepositoryImpl bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PatchMapping("/halls/{id}/toggle-status")
    public ResponseEntity<Map<String, Object>> toggleHallStatus(@PathVariable Long id) {
        Hall hall = hallService.toggleHallStatus(id);
        ItemResponse response = hallService.getHallById(hall.getId());

        Map<String, Object> result = new HashMap<>();
        result.put("message", hall.getIsActive() ? "Hall activated successfully" : "Hall deactivated successfully");
        result.put("hall", response);
        return ResponseEntity.ok(result);
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
                user.getRole(),
                user.getIsActive(),
                user.getCreatedBy() != null ? user.getCreatedBy().getId() : null,
                user.getCreatedBy() != null ? user.getCreatedBy().getUsername() : null,
                user.getCreatedAt()
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
        */
/*long totalBookings = bookingRepository.count();
        long confirmedBookings = bookingRepository.findAllWithFilters(
                null, null, BookingStatus.CONFIRMED, Pageable.unpaged()
        ).getTotalElements();

        BigDecimal totalRevenue = bookingRepository.findAll().stream()
                .filter(booking -> booking.getStatus() == BookingStatus.CONFIRMED)
                .map(Booking::getTotalPrice)
                .filter(price -> price != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalUsers = userRepository.count();*//*


        Map<String, Object> stats = new HashMap<>();
        stats.put("totalBookings", "51");
        stats.put("confirmedBookings", "42");
        stats.put("totalRevenue", "10000");
        stats.put("totalUsers", "100");

        return ResponseEntity.ok(stats);
    }

    // ========== User Management Endpoints ==========

    @PatchMapping("/users/{id}/toggle-status")
    public ResponseEntity<Map<String, Object>> toggleUserStatus(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        user.setIsActive(!user.getIsActive());
        User updatedUser = userRepository.save(user);

        UserResponse response = new UserResponse(
                updatedUser.getId(),
                updatedUser.getUsername(),
                updatedUser.getEmail(),
                updatedUser.getFirstName(),
                updatedUser.getLastName(),
                updatedUser.getRole(),
                updatedUser.getIsActive(),
                updatedUser.getCreatedBy() != null ? updatedUser.getCreatedBy().getId() : null,
                updatedUser.getCreatedBy() != null ? updatedUser.getCreatedBy().getUsername() : null,
                updatedUser.getCreatedAt()
        );

        Map<String, Object> result = new HashMap<>();
        result.put("message", updatedUser.getIsActive() ? "User activated successfully" : "User deactivated successfully");
        result.put("user", response);

        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // Prevent deletion of the last admin
        if (user.getRole() == com.hallbooking.entity.Role.ADMIN) {
            long adminCount = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == com.hallbooking.entity.Role.ADMIN)
                    .count();
            if (adminCount <= 1) {
                throw new RuntimeException("Cannot delete the last admin user");
            }
        }

        userRepository.delete(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "User deleted successfully");
        return ResponseEntity.ok(response);
    }
}
*/
