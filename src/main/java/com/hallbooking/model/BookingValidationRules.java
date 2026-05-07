package com.hallbooking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * BookingValidationRules - Defines validation rules applied during booking time
 *
 * This class enables dynamic validation logic for form fields when users make bookings.
 * For example, validating that numberOfAttendees doesn't exceed the hall's capacity field.
 *
 * Supported validation types:
 * - MAX_VALUE: Validates that booking input doesn't exceed the item's field value
 * - MIN_VALUE: Validates that booking input meets minimum requirements
 * - REQUIRED_IF_AVAILABLE: Makes booking field required if item has this field
 * - MATCH_OPTIONS: Validates booking selection against available options (for time slots)
 *
 * @author Hall Booking System
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingValidationRules implements Serializable {

    /**
     * Whether to validate this field during booking
     */
    private Boolean validateOnBooking;

    /**
     * Type of validation to perform
     * Values: "MAX_VALUE", "MIN_VALUE", "REQUIRED_IF_AVAILABLE", "MATCH_OPTIONS"
     */
    private String validationType;

    /**
     * Custom error message to display when validation fails
     */
    private String errorMessage;

    /**
     * The booking field name to validate against
     * Example: For capacity validation, this would be "numberOfAttendees"
     */
    private String bookingFieldName;
}
