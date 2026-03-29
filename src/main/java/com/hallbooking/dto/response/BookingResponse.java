package com.hallbooking.dto.response;

import com.hallbooking.model.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private String id;
    private String userId;
    private String username;
    private String hallId;
    private String hallName;
    private Date startDateTime;
    private Date endDateTime;
    private BookingStatus status;
    private BigDecimal totalPrice;
    private String purpose;
    private Integer numberOfAttendees;
    private Date createdAt;
}
