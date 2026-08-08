package com.hallbooking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Featured implements Serializable{

    private boolean featured = false;
    private String featuredTier; // e.g. "gold", "silver"
    private Integer featuredPriority; // lower = higher priority for display/sort
    private Date featuredUntil; // optional expiry of featured status
    private String promotionId;

}
