package com.hallbooking.dto.response;

import com.hallbooking.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private String id;  // MongoDB uses String IDs
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String address;
    private String role;  // Changed from Role enum to String for flexibility
    private Boolean isActive;
    private String createdById;
    private String createdByUsername;
    private LocalDateTime createdAt;
}
