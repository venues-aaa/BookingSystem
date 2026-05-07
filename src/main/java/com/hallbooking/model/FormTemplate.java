package com.hallbooking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serializable;
import java.util.Date;

/**
 * FormTemplate - Reusable form schema template
 *
 * Allows administrators to save form designs as templates and reuse them
 * across multiple categories/items, promoting consistency and saving time.
 *
 * @author Hall Booking System
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "formTemplates")
public class FormTemplate implements Serializable {

    /**
     * Unique identifier for the template
     */
    @Id
    private String id;

    /**
     * Template name (must be unique)
     */
    private String name;

    /**
     * Optional description of what this template is for
     */
    private String description;

    /**
     * The form schema that this template contains
     */
    private FormSchema schema;

    /**
     * Category/tags for organizing templates
     * Examples: "event", "venue", "equipment", "services"
     */
    private String category;

    /**
     * Whether this template is active and available for use
     */
    private Boolean isActive;

    /**
     * Number of times this template has been used
     */
    private Integer usageCount;

    /**
     * User ID of the creator
     */
    private String createdBy;

    /**
     * Username of the creator (for display)
     */
    private String createdByUsername;

    /**
     * When the template was created
     */
    private Date createdOn;

    /**
     * When the template was last modified
     */
    private Date lastModifiedOn;

    /**
     * User ID of last modifier
     */
    private String lastModifiedBy;

    /**
     * Helper method to increment usage count
     */
    public void incrementUsage() {
        if (this.usageCount == null) {
            this.usageCount = 0;
        }
        this.usageCount++;
    }
}
