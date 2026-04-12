package com.hallbooking.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateBookingRequest {

    @NotNull(message = "Item ID is required")
    private String itemId;

    @NotNull(message = "Start date time is required")
    private LocalDateTime startDateTime;

    @NotNull(message = "End date time is required")
    private LocalDateTime endDateTime;

    private String functionType;

    private Integer numberOfAttendees;

    private String userId;
    private double amtCollected;
    private double taxCollected;
}
