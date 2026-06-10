package com.hallbooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BlockedDateResponse {
    private String id;
    private String itemId;
    private String itemName;
    private String vendorId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String reason;
    private String notes;
    private Date createdOn;
    private String createdBy;
}
