package com.hallbooking.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Date;

/**
 * Represents a date range blocked by vendor for an item.
 * During blocked periods, users cannot create bookings for the item.
 *
 * Use cases:
 * - Maintenance periods
 * - Holidays/vacations
 * - Personal unavailability
 * - Venue renovations
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "blockedDate")
public class BlockedDate implements Serializable {

    @Id
    @Field("id")
    @JsonProperty("id")
    private String id;

    /**
     * ID of the item being blocked
     */
    private String itemId;

    /**
     * Name of the item (cached for display purposes)
     */
    private String itemName;

    /**
     * ID of the vendor who created this block
     */
    private String vendorId;

    /**
     * Start date/time of the blocked period (inclusive)
     */
    private LocalDateTime startDate;

    /**
     * End date/time of the blocked period (inclusive)
     */
    private LocalDateTime endDate;

    /**
     * Reason for blocking (e.g., "Maintenance", "Holiday", "Renovation")
     */
    private String reason;

    /**
     * Detailed notes about the block (optional)
     */
    private String notes;

    /**
     * Creation timestamp
     */
    private Date createdOn;

    /**
     * User ID who created this block
     */
    private String createdBy;

    /**
     * Last update timestamp
     */
    private Date lastUpdateDate;

    /**
     * User ID who last updated this block
     */
    private String lastUpdateUserId;
}
