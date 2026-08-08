package com.hallbooking.controller;

import com.hallbooking.dto.request.LoginRequest;
import com.hallbooking.dto.response.JwtResponse;
import com.hallbooking.dto.response.UserResponse;
import com.hallbooking.model.User;
import com.hallbooking.security.JwtTokenProvider;
import com.hallbooking.security.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.time.Duration;
import java.util.Date;
import java.util.Map;
import java.util.HashMap;

/**
 * AuthController - JWT-based authentication endpoints
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    /**
     * Login endpoint - returns JWT token
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            // Find user by email (support both email and usernameOrEmail fields)
            String email = loginRequest.getEmail() != null ? loginRequest.getEmail()
                    : loginRequest.getUsernameOrEmail();
            Query query = Query.query(Criteria.where("emailId").is(email));
            User user = mongoTemplate.findOne(query, User.class);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Invalid email or password"));
            }

            if (!user.getIsActive()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Account is inactive"));
            }

            Map<String, String> claims = new HashMap<>();
            claims.put("user", user.getId());

            // Authenticate
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            email,
                            loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Generate JWT token
            String jwt = jwtTokenProvider.generateToken(authentication, claims);

            // Update last login
            user.setLastLoginOn(new Date());
            mongoTemplate.save(user);

            // Create response
            UserResponse userResponse = new UserResponse();
            userResponse.setId(user.getId());
            userResponse.setEmail(user.getEmailId());
            userResponse.setFirstName(user.getDetails().getFirstName());
            userResponse.setLastName(user.getDetails().getLastName());
            userResponse.setRole(user.getDetails().getRole());
            userResponse.setAddress(user.getDetails().getAddress());
            userResponse.setPhone(user.getPhone());

            ResponseCookie cookie = ResponseCookie.from("authToken", jwt)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(Duration.ofDays(1))
                .sameSite("Lax")
                .build();

            JwtResponse jwtResponse = new JwtResponse(jwt, userResponse);

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(jwtResponse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Invalid email or password"));
        }
    }

    /**
     * Get current authenticated user
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Not authenticated"));
        }

        String email = authentication.getName();
        Query query = Query.query(Criteria.where("emailId").is(email));
        User user = mongoTemplate.findOne(query, User.class);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("User not found"));
        }

        UserResponse userResponse = new UserResponse();
        userResponse.setId(user.getId());
        userResponse.setEmail(user.getEmailId());
        userResponse.setFirstName(user.getDetails().getFirstName());
        userResponse.setLastName(user.getDetails().getLastName());
        userResponse.setRole(user.getDetails().getRole());

        return ResponseEntity.ok(userResponse);
    }

    /**
     * Register new user
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            // Check if email already exists
            Query query = Query.query(Criteria.where("emailId").is(user.getEmailId()));
            if (mongoTemplate.exists(query, User.class)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("Email already registered"));
            }

            // Hash password
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            user.setIsActive(true);
            user.setCreatedOn(new Date());
            user.setStatus("Active");

            // Set default role if not provided
            if (user.getDetails() == null || user.getDetails().getRole() == null) {
                if (user.getDetails() == null) {
                    user.setDetails(new com.hallbooking.model.UserDetails());
                }
                user.getDetails().setRole("USER");
            }

            mongoTemplate.save(user);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new SuccessResponse("User registered successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Registration failed: " + e.getMessage()));
        }
    }

    // Response classes
    static class ErrorResponse {
        private String message;

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

    static class SuccessResponse {
        private String message;

        public SuccessResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
