package com.hallbooking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * ConditionalRules - Defines conditional display logic for form fields
 *
 * Allows fields to be shown or hidden based on the value of another field.
 *
 * Example use case:
 * - Show "Number of Suppliers" field only if "Need Suppliers?" is "Yes"
 * - Show "Other (please specify)" text field only if "Other" is selected in a dropdown
 *
 * Supported operators:
 * - equals: Field value must equal the specified value
 * - notEquals: Field value must not equal the specified value
 * - contains: For arrays, the specified value must be in the array
 * - greaterThan: For numbers, value must be greater than specified
 * - lessThan: For numbers, value must be less than specified
 *
 * @author Hall Booking System
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConditionalRules implements Serializable {

    /**
     * ID of the field that this field depends on
     */
    private String fieldId;

    /**
     * Comparison operator
     * Valid values: "equals", "notEquals", "contains", "greaterThan", "lessThan"
     */
    private String operator;

    /**
     * Value to compare against
     * Type depends on the field being compared (String, Number, Boolean, etc.)
     */
    private Object value;
}
