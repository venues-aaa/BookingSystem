package com.hallbooking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

/**
 * ValidationResult - Contains the result of form data validation
 *
 * Used by FormValidationService to return validation status and errors.
 *
 * @author Hall Booking System
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidationResult implements Serializable {

    /**
     * Whether the validation passed
     */
    private Boolean valid;

    /**
     * Map of field errors
     * Key: Field ID
     * Value: Error message
     */
    private Map<String, String> errors;

    /**
     * Constructor that initializes with valid state
     */
    public static ValidationResult valid() {
        return new ValidationResult(true, new HashMap<>());
    }

    /**
     * Constructor that initializes with invalid state
     */
    public static ValidationResult invalid() {
        return new ValidationResult(false, new HashMap<>());
    }

    /**
     * Add a validation error for a field
     *
     * @param fieldId The ID of the field with the error
     * @param message The error message to display
     */
    public void addError(String fieldId, String message) {
        if (this.errors == null) {
            this.errors = new HashMap<>();
        }
        this.errors.put(fieldId, message);
        this.valid = false;
    }

    /**
     * Check if there are any errors
     *
     * @return true if there are validation errors
     */
    public boolean hasErrors() {
        return this.errors != null && !this.errors.isEmpty();
    }

    /**
     * Get the number of errors
     *
     * @return Number of validation errors
     */
    public int getErrorCount() {
        return this.errors != null ? this.errors.size() : 0;
    }
}
