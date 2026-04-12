package com.hallbooking.dto.request;

import com.hallbooking.model.AvailableSlotTypes;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateHallRequest {

    private String name;

    private String description;

    private Integer capacity;

    private String location;

    private BigDecimal pricePerHour;

    private String amenities;

    private String imageUrl;

    private Boolean isActive;

    private AvailableSlotTypes availableSlotTypes;
}
