package com.hallbooking.controller;

import com.hallbooking.dto.request.LoginRequest;
import com.hallbooking.dto.request.RegisterRequest;
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

    @Autowired
    private UserDetailsProcessor userDetailsProcessor;

    @PostMapping(value = "/create", consumes = "application/json")
    public ResponseEntity<Map<String, Object>> createUser(@RequestBody RegisterRequest request) {
        com.hallbooking.model.User user = ObjectMapper.mapDtoToUser(request);
        userDetailsProcessor.createUser(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "User registered successfully");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /*@PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }*/

    @PostMapping(value = "/validateUser")
    public ResponseEntity<com.hallbooking.model.User> validateUser(@RequestBody com.hallbooking.model.User user) {

        User userDetails = userDetailsProcessor.validateUserDetails(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(userDetails);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        UserResponse user = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(user);
    }
}
