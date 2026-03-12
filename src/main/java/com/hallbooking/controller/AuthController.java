package com.hallbooking.controller;

import com.hallbooking.dto.request.LoginRequest;
import com.hallbooking.dto.request.RegisterRequest;
import com.hallbooking.dto.request.VerifyOtpRequest;
import com.hallbooking.dto.response.AuthResponse;
import com.hallbooking.dto.response.UserResponse;
import com.hallbooking.model.User;
import com.hallbooking.service.AuthService;
import com.hallbooking.service.UserDetailsProcessor;
import com.hallbooking.utility.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthService authService;

    // @Autowired
    // private UserDetailsProcessor userDetailsProcessor;  // MongoDB-based - disabled

    @PostMapping(value = "/register", consumes = "application/json")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
        String otp = authService.initiateRegistration(request);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "OTP sent to your phone number");
        response.put("phoneNumber", request.getPhoneNumber());
        // For development only - remove in production
        response.put("otp", otp);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @PostMapping(value = "/verify-otp", consumes = "application/json")
    public ResponseEntity<Map<String, Object>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        authService.completeRegistration(request.getPhoneNumber(), request.getOtp());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Registration completed successfully. You can now login.");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/validateUser")
    public ResponseEntity<AuthResponse> validateUser(@RequestBody Map<String, String> credentials) {
        // Support old frontend format with "emailId" field
        String usernameOrEmail = credentials.getOrDefault("emailId", credentials.get("usernameOrEmail"));
        String password = credentials.get("password");

        LoginRequest request = new LoginRequest();
        request.setUsernameOrEmail(usernameOrEmail);
        request.setPassword(password);

        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        UserResponse user = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(user);
    }
}
