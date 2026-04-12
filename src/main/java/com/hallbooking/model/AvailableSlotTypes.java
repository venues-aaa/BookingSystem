package com.hallbooking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailableSlotTypes implements Serializable {

    private boolean fullday = true;  // Default: all halls support full day
    private boolean morning = true;  // Default: all halls support morning
    private boolean evening = true;  // Default: all halls support evening

    // Helper method to check if a slot type is available
    public boolean isSlotTypeAvailable(String slotType) {
        if (slotType == null) return false;

        switch (slotType.toLowerCase()) {
            case "fullday":
                return fullday;
            case "morning":
                return morning;
            case "evening":
                return evening;
            default:
                return false;
        }
    }
}
