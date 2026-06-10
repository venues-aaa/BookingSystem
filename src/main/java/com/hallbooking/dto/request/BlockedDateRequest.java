package com.hallbooking.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BlockedDateRequest {
    private String itemId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String reason;
    private String notes;
}
