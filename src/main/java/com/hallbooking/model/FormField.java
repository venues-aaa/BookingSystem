package com.hallbooking.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Field;

import java.io.Serializable;
import java.util.List;

/**
 * FormField - Represents a single field in a dynamic form
 *
 * Supported field types:
 * - text: Single-line text input
 * - number: Numeric input with min/max validation
 * - textarea: Multi-line text input
 * - select: Dropdown selection (single choice)
 * - radio: Radio button group (single choice)
 * - checkbox: Checkbox group (multiple choice)
 * - timingOption: Specialized timing slots (Fullday, Morning, Evening)
 * - file: File upload
 * - timeRange: Time range picker (from-to)
 * - repeatingGroup: Dynamic list of nested fields
 * - paymentTerms: Payment terms selector with custom option support
 *
 * @author Hall Booking System
 * @version 1.1
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FormField implements Serializable {

    /**
     * Unique identifier for this field
     * Used as the key in the dynamicData map
     *
     * NOTE: Using @Field annotation to prevent MongoDB from treating this as _id
     */
    @Field("id")
    @JsonProperty("id")
    private String id;

    /**
     * Field type (text, number, select, radio, checkbox, timingOption, etc.)
     */
    private String type;

    /**
     * Display label shown to users
     */
    private String label;

    /**
     * Placeholder text for input fields
     */
    private String placeholder;

    /**
     * Whether this field is required (cannot be empty)
     */
    private Boolean required;

    /**
     * Validation rules for this field
     */
    private ValidationRules validation;

    /**
     * Options for select, radio, and checkbox fields
     */
    private List<String> options;

    /**
     * Position and size in the grid layout
     */
    private GridPosition position;

    /**
     * Default value for the field
     */
    private String defaultValue;

    /**
     * Help text shown below the field
     */
    private String helpText;

    /**
     * Conditional display rules
     * Field is only shown if the condition is met
     */
    private ConditionalRules showIf;

    /**
     * For repeating groups: minimum number of items
     */
    private Integer minItems;

    /**
     * For repeating groups: maximum number of items
     */
    private Integer maxItems;

    /**
     * For repeating groups: nested field definitions
     */
    private List<FormField> nestedFields;

    /**
     * For time range fields: time format ("12h" or "24h")
     */
    private String timeFormat;

    /**
     * Booking-time validation rules
     * Defines how this field should be validated during booking
     *
     * Example for capacity validation:
     * {
     *   "validateOnBooking": true,
     *   "validationType": "MAX_VALUE",
     *   "errorMessage": "Number of attendees cannot exceed hall capacity"
     * }
     */
    private BookingValidationRules bookingValidationRules;
}
