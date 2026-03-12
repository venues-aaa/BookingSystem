package com.hallbooking.controller;

import com.hallbooking.dto.request.CreateHallRequest;
import com.hallbooking.dto.request.CreateUserRequest;
import com.hallbooking.dto.request.UpdateHallRequest;
import com.hallbooking.dto.request.UpdateUserRequest;
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
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/halls")
    public ResponseEntity<Map<String, Object>> getAllHallsAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer capacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Long createdById,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<HallResponse> halls = hallService.adminSearchHalls(name, capacity, location, createdById, isActive, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("halls", halls.getContent());
        response.put("currentPage", halls.getNumber());
        response.put("totalPages", halls.getTotalPages());
        response.put("totalElements", halls.getTotalElements());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/halls")
    public ResponseEntity<HallResponse> createHall(
            @Valid @RequestBody CreateHallRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User admin = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Hall hall = hallService.createHall(request, admin.getId());
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

    @PatchMapping("/halls/{id}/toggle-status")
    public ResponseEntity<Map<String, Object>> toggleHallStatus(@PathVariable Long id) {
        Hall hall = hallService.toggleHallStatus(id);
        HallResponse response = hallService.getHallById(hall.getId());

        Map<String, Object> result = new HashMap<>();
        result.put("message", hall.getIsActive() ? "Hall activated successfully" : "Hall deactivated successfully");
        result.put("hall", response);
        return ResponseEntity.ok(result);
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

    // ========== User Management Endpoints ==========

    @PostMapping("/users")
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody CreateUserRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        // Check if username already exists
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(request.getRole());
        user.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        user.setCreatedBy(currentUser);

        User savedUser = userRepository.save(user);

        UserResponse response = new UserResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getFirstName(),
                savedUser.getLastName(),
                savedUser.getRole(),
                savedUser.getIsActive(),
                savedUser.getCreatedBy() != null ? savedUser.getCreatedBy().getId() : null,
                savedUser.getCreatedBy() != null ? savedUser.getCreatedBy().getUsername() : null,
                savedUser.getCreatedAt()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        UserResponse response = new UserResponse(
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
        );

        return ResponseEntity.ok(response);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // Check if email is being changed and if it already exists
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("Email already exists");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }

        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }

        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        if (request.getIsActive() != null) {
            user.setIsActive(request.getIsActive());
        }

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

        return ResponseEntity.ok(response);
    }

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
