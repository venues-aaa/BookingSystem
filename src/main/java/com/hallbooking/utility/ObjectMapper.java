package com.hallbooking.utility;

import com.hallbooking.dto.request.RegisterRequest;
import com.hallbooking.model.User;
import com.hallbooking.model.UserDetails;

import java.util.Objects;

public class ObjectMapper {

    public static User mapDtoToUser(RegisterRequest registerRequest) {
        if (registerRequest == null) {
            throw new IllegalArgumentException("Source DTO cannot be null");
        }

        UserDetails userDetails = new UserDetails(
                Objects.requireNonNullElse(registerRequest.getFirstName(), ""),
                Objects.requireNonNullElse(registerRequest.getLastName(), "")
        );
        User user = new User(
                Objects.requireNonNullElse(registerRequest.getEmail(), ""),
                Objects.requireNonNullElse(registerRequest.getPassword(), ""),
                userDetails
        );
        return user;
    }
}
