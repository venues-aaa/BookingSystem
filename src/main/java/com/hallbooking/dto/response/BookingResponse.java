package com.hallbooking.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.hallbooking.model.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private String id;
    private String userId;
    private String username;

    // Generic item fields (replaces hallId/hallName)
    private String itemId;
    private String itemName;

    // Legacy fields for backward compatibility
    @Deprecated
    private String hallId;
    @Deprecated
    private String hallName;

    /**
     * Booking start date/time
     * @JsonFormat ensures consistent ISO string serialization for frontend
     */
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime bookingFromDate;

    /**
     * Booking end date/time
     * @JsonFormat ensures consistent ISO string serialization for frontend
     */
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime bookingToDate;

    // Legacy fields for backward compatibility
    @Deprecated
    private Date startDateTime;
    @Deprecated
    private Date endDateTime;

    private String bookingStatus;
    private String paymentStatus;

    private BigDecimal totalPrice;
    private String purpose;
    private Integer numberOfAttendees;
    private Date createdAt;

    // Coupon discount fields
    private Double discountApplied; // Percentage discount from coupon (e.g., 100 for 100% off)
    private String discountReason; // Human-readable reason (e.g., "Coupon: BUNDLE-ABC123")
}
