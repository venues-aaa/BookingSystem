package com.hallbooking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateHallRequest {

    @NotBlank(message = "Hall name is required")
    private String name;

    private String description;

    @NotNull(message = "Capacity is required")
    private Integer capacity;

    private String location;

    private BigDecimal pricePerHour;

    private String amenities;

    private String imageUrl;
}
