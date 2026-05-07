package com.hallbooking.exception;

import java.util.Map;

/**
 * ValidationException - Thrown when form data validation fails
 *
 * This exception is thrown by FormValidationService when vendor-submitted
 * data does not conform to the category's form schema.
 *
 * @author Hall Booking System
 * @version 1.0
 */
public class ValidationException extends RuntimeException {

    private Map<String, String> errors;

    /**
     * Constructor with simple message
     *
     * @param message The error message
     */
    public ValidationException(String message) {
        super(message);
    }

    /**
     * Constructor with message and errors map
     *
     * @param message The error message
     * @param errors  Map of field errors (fieldId -> error message)
     */
    public ValidationException(String message, Map<String, String> errors) {
        super(message);
        this.errors = errors;
    }

    /**
     * Get the field-level errors
     *
     * @return Map of field errors
     */
    public Map<String, String> getErrors() {
        return errors;
    }

    /**
     * Set the field-level errors
     *
     * @param errors Map of field errors
     */
    public void setErrors(Map<String, String> errors) {
        this.errors = errors;
    }
}
