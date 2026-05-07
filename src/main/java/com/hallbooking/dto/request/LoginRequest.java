package com.hallbooking.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Username or email is required")
    private String usernameOrEmail;

    // Alternative field name for compatibility
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}
