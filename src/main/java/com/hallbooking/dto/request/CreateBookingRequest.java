package com.hallbooking.dto.request;

import com.hallbooking.model.BookingDetails;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

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

    // Optional coupon code for bundle discount
    private String couponCode;

    // Booking status
    private String status;

    // Additional booking details (pricing, dates, custom fields, etc.)
    private Map<String, Object> details;
}
