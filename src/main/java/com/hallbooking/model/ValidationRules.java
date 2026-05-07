package com.hallbooking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * ValidationRules - Defines validation constraints for form fields
 *
 * These rules are enforced both on the client-side (for UX) and
 * server-side (for security) when vendors submit items.
 *
 * @author Hall Booking System
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidationRules implements Serializable {

    /**
     * Minimum length for text fields
     */
    private Integer minLength;

    /**
     * Maximum length for text fields
     */
    private Integer maxLength;

    /**
     * Minimum value for number fields
     */
    private Integer min;

    /**
     * Maximum value for number fields
     */
    private Integer max;

    /**
     * Regular expression pattern for text validation
     * Example: "^[A-Za-z]+$" for alphabetic only
     */
    private String pattern;

    /**
     * Custom error message to display when validation fails
     */
    private String customMessage;

    /**
     * For time range fields: minimum duration in minutes
     */
    private Integer minDuration;

    /**
     * For time range fields: maximum duration in minutes
     */
    private Integer maxDuration;
}
