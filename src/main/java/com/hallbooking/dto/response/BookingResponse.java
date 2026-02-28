package com.hallbooking.dto.response;

import com.hallbooking.entity.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private Long userId;
    private String username;
    private Long hallId;
    private String hallName;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private BookingStatus status;
    private BigDecimal totalPrice;
    private String purpose;
    private Integer numberOfAttendees;
    private LocalDateTime createdAt;
}
