package com.hallbooking.service;

import com.hallbooking.dto.request.LoginRequest;
import com.hallbooking.dto.request.RegisterRequest;
import com.hallbooking.dto.response.AuthResponse;
import com.hallbooking.dto.response.UserResponse;
import com.hallbooking.entity.Role;
import com.hallbooking.entity.User;
import com.hallbooking.dao.impl.UserRepository;
import com.hallbooking.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private OtpService otpService;

    // Temporary storage for pending registrations
    private final Map<String, RegisterRequest> pendingRegistrations = new ConcurrentHashMap<>();

    public String initiateRegistration(RegisterRequest request) {
        // Validate unique fields
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use");
        }

        if (userRepository.findByPhoneNumber(request.getPhoneNumber()).isPresent()) {
            throw new RuntimeException("Phone number is already registered");
        }

        // Store registration request temporarily
        pendingRegistrations.put(request.getPhoneNumber(), request);

        // Generate and return OTP
        String otp = otpService.generateOtp(request.getPhoneNumber());

        return otp; // In production, this would be sent via SMS
    }

    public User completeRegistration(String phoneNumber, String otp) {
        // Verify OTP
        if (!otpService.verifyOtp(phoneNumber, otp)) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        // Get pending registration
        RegisterRequest request = pendingRegistrations.get(phoneNumber);
        if (request == null) {
            throw new RuntimeException("No pending registration found for this phone number");
        }

        // Create user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(Role.USER);
        user.setIsActive(true);
        user.setIsVerified(true);

        User savedUser = userRepository.save(user);

        // Clear pending registration
        pendingRegistrations.remove(phoneNumber);

        return savedUser;
    }

    public User register(RegisterRequest request) {
        // Legacy registration without OTP (kept for backward compatibility)
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(Role.USER);

        return userRepository.save(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsernameOrEmail())
                .or(() -> userRepository.findByEmail(request.getUsernameOrEmail()))
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getUsername(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        UserResponse userResponse = mapToUserResponse(user);
        return new AuthResponse(token, userResponse);
    }

    public UserResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToUserResponse(user);
    }

    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(
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
    }
}
