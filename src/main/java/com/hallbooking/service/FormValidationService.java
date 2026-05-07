package com.hallbooking.service;

import com.hallbooking.model.*;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.*;

/**
 * FormValidationService - Validates dynamic form data against form schemas
 *
 * This service performs server-side validation of vendor-submitted data
 * to ensure it conforms to the admin-designed form schema.
 *
 * @author Hall Booking System
 * @version 1.0
 */
@Service
public class FormValidationService {

    /**
     * Validate dynamic data against a form schema
     *
     * @param schema The form schema to validate against
     * @param data   The data submitted by the vendor
     * @return ValidationResult containing validation status and errors
     */
    public ValidationResult validate(FormSchema schema, Map<String, Object> data) {
        ValidationResult result = ValidationResult.valid();

        if (schema == null || schema.getFields() == null) {
            result.addError("schema", "Invalid form schema");
            return result;
        }

        if (data == null) {
            data = new HashMap<>();
        }

        // Validate each field in the schema
        for (FormField field : schema.getFields()) {
            validateField(field, data, result);
        }

        return result;
    }

    /**
     * Validate a single field
     */
    private void validateField(FormField field, Map<String, Object> data, ValidationResult result) {
        Object value = data.get(field.getId());

        // Check required fields
        if (Boolean.TRUE.equals(field.getRequired())) {
            if (value == null || (value instanceof String && ((String) value).trim().isEmpty())) {
                result.addError(field.getId(), field.getLabel() + " is required");
                return;
            }
        }

        // Skip further validation if value is null/empty and field is not required
        if (value == null) {
            return;
        }

        // Type-specific validation
        switch (field.getType()) {
            case "text":
            case "textarea":
                validateText(field, value, result);
                break;
            case "number":
                validateNumber(field, value, result);
                break;
            case "select":
            case "radio":
                validateSelect(field, value, result);
                break;
            case "checkbox":
                validateCheckbox(field, value, result);
                break;
            case "timingOption":
                validateTimingOption(field, value, result);
                break;
            case "timeRange":
                validateTimeRange(field, value, result);
                break;
            case "repeatingGroup":
                validateRepeatingGroup(field, value, result);
                break;
            case "paymentTerms":
                validatePaymentTerms(field, value, result);
                break;
            default:
                // Unknown field type - log but don't fail validation
                System.out.println("Unknown field type: " + field.getType());
                break;
        }
    }

    /**
     * Validate text fields
     */
    private void validateText(FormField field, Object value, ValidationResult result) {
        if (!(value instanceof String)) {
            result.addError(field.getId(), field.getLabel() + " must be text");
            return;
        }

        String text = (String) value;
        ValidationRules rules = field.getValidation();

        if (rules != null) {
            if (rules.getMinLength() != null && text.length() < rules.getMinLength()) {
                result.addError(field.getId(),
                    field.getLabel() + " must be at least " + rules.getMinLength() + " characters");
            }
            if (rules.getMaxLength() != null && text.length() > rules.getMaxLength()) {
                result.addError(field.getId(),
                    field.getLabel() + " must not exceed " + rules.getMaxLength() + " characters");
            }
            if (rules.getPattern() != null && !text.matches(rules.getPattern())) {
                String message = rules.getCustomMessage() != null ?
                    rules.getCustomMessage() : field.getLabel() + " format is invalid";
                result.addError(field.getId(), message);
            }
        }
    }

    /**
     * Validate number fields
     */
    private void validateNumber(FormField field, Object value, ValidationResult result) {
        Number number;

        if (value instanceof Number) {
            number = (Number) value;
        } else if (value instanceof String) {
            try {
                number = Double.parseDouble((String) value);
            } catch (NumberFormatException e) {
                result.addError(field.getId(), field.getLabel() + " must be a number");
                return;
            }
        } else {
            result.addError(field.getId(), field.getLabel() + " must be a number");
            return;
        }

        ValidationRules rules = field.getValidation();
        if (rules != null) {
            if (rules.getMin() != null && number.doubleValue() < rules.getMin()) {
                result.addError(field.getId(),
                    field.getLabel() + " must be at least " + rules.getMin());
            }
            if (rules.getMax() != null && number.doubleValue() > rules.getMax()) {
                result.addError(field.getId(),
                    field.getLabel() + " must not exceed " + rules.getMax());
            }
        }
    }

    /**
     * Validate select/radio fields
     */
    private void validateSelect(FormField field, Object value, ValidationResult result) {
        if (field.getOptions() == null || field.getOptions().isEmpty()) {
            return; // No validation if no options defined
        }

        String selectedValue = value.toString();
        if (!field.getOptions().contains(selectedValue)) {
            result.addError(field.getId(),
                field.getLabel() + " must be one of: " + String.join(", ", field.getOptions()));
        }
    }

    /**
     * Validate checkbox fields
     */
    @SuppressWarnings("unchecked")
    private void validateCheckbox(FormField field, Object value, ValidationResult result) {
        if (field.getOptions() == null || field.getOptions().isEmpty()) {
            return;
        }

        List<String> selectedValues;
        if (value instanceof List) {
            selectedValues = (List<String>) value;
        } else {
            result.addError(field.getId(), field.getLabel() + " must be a list");
            return;
        }

        for (String selected : selectedValues) {
            if (!field.getOptions().contains(selected)) {
                result.addError(field.getId(),
                    "Invalid option in " + field.getLabel() + ": " + selected);
                break;
            }
        }
    }

    /**
     * Validate timing option fields (Fullday, Morning, Evening)
     */
    @SuppressWarnings("unchecked")
    private void validateTimingOption(FormField field, Object value, ValidationResult result) {
        List<String> validOptions = Arrays.asList("Fullday", "Morning", "Evening");

        if (value instanceof List) {
            List<String> selected = (List<String>) value;
            for (String option : selected) {
                if (!validOptions.contains(option)) {
                    result.addError(field.getId(), "Invalid timing option: " + option);
                    break;
                }
            }
        } else {
            String selected = value.toString();
            if (!validOptions.contains(selected)) {
                result.addError(field.getId(), "Invalid timing option: " + selected);
            }
        }
    }

    /**
     * Validate time range fields
     */
    @SuppressWarnings("unchecked")
    private void validateTimeRange(FormField field, Object value, ValidationResult result) {
        if (!(value instanceof Map)) {
            result.addError(field.getId(), field.getLabel() + " must be a time range");
            return;
        }

        Map<String, String> timeRange = (Map<String, String>) value;
        // Support both formats: {from, to} and {startTime, endTime}
        String from = timeRange.get("from");
        String to = timeRange.get("to");

        if (from == null || to == null) {
            // Try alternate format
            from = timeRange.get("startTime");
            to = timeRange.get("endTime");
        }

        if (from == null || from.isEmpty() || to == null || to.isEmpty()) {
            result.addError(field.getId(), field.getLabel() + " requires both start and end time");
            return;
        }

        // Validate time format
        try {
            LocalTime fromTime = LocalTime.parse(from);
            LocalTime toTime = LocalTime.parse(to);

            // Check that 'to' is after 'from'
            if (!toTime.isAfter(fromTime)) {
                result.addError(field.getId(), field.getLabel() + " end time must be after start time");
                return;
            }

            // Check duration constraints if specified
            ValidationRules rules = field.getValidation();
            if (rules != null) {
                long durationMinutes = java.time.Duration.between(fromTime, toTime).toMinutes();

                if (rules.getMinDuration() != null && durationMinutes < rules.getMinDuration()) {
                    result.addError(field.getId(),
                        field.getLabel() + " must be at least " + rules.getMinDuration() + " minutes");
                }
                if (rules.getMaxDuration() != null && durationMinutes > rules.getMaxDuration()) {
                    result.addError(field.getId(),
                        field.getLabel() + " must not exceed " + rules.getMaxDuration() + " minutes");
                }
            }
        } catch (DateTimeParseException e) {
            result.addError(field.getId(), field.getLabel() + " has invalid time format");
        }
    }

    /**
     * Validate repeating group fields
     */
    @SuppressWarnings("unchecked")
    private void validateRepeatingGroup(FormField field, Object value, ValidationResult result) {
        if (!(value instanceof List)) {
            result.addError(field.getId(), field.getLabel() + " must be a list");
            return;
        }

        List<Map<String, Object>> items = (List<Map<String, Object>>) value;

        // Check min/max items
        if (field.getMinItems() != null && items.size() < field.getMinItems()) {
            result.addError(field.getId(),
                field.getLabel() + " must have at least " + field.getMinItems() + " item(s)");
            return;
        }
        if (field.getMaxItems() != null && items.size() > field.getMaxItems()) {
            result.addError(field.getId(),
                field.getLabel() + " must not exceed " + field.getMaxItems() + " item(s)");
            return;
        }

        // Validate each item in the repeating group
        if (field.getNestedFields() != null) {
            for (int i = 0; i < items.size(); i++) {
                Map<String, Object> itemData = items.get(i);
                for (FormField nestedField : field.getNestedFields()) {
                    // Create a unique field ID for error reporting
                    String nestedFieldId = field.getId() + "[" + i + "]." + nestedField.getId();

                    // Validate nested field
                    Object nestedValue = itemData.get(nestedField.getId());
                    ValidationResult nestedResult = ValidationResult.valid();
                    validateFieldValue(nestedField, nestedValue, nestedResult);

                    // Add nested errors to main result with proper field path
                    if (nestedResult.hasErrors()) {
                        for (Map.Entry<String, String> error : nestedResult.getErrors().entrySet()) {
                            result.addError(nestedFieldId, error.getValue());
                        }
                    }
                }
            }
        }
    }

    /**
     * Validate payment terms fields
     */
    @SuppressWarnings("unchecked")
    private void validatePaymentTerms(FormField field, Object value, ValidationResult result) {
        if (!(value instanceof Map)) {
            result.addError(field.getId(), field.getLabel() + " must be a payment terms object");
            return;
        }

        Map<String, Object> paymentTerms = (Map<String, Object>) value;
        String selectedOption = (String) paymentTerms.get("selectedOption");

        // Validate selectedOption exists and is in the options list
        if (selectedOption == null || selectedOption.trim().isEmpty()) {
            result.addError(field.getId(), field.getLabel() + " requires a payment option to be selected");
            return;
        }

        if (field.getOptions() != null && !field.getOptions().isEmpty()) {
            if (!field.getOptions().contains(selectedOption)) {
                result.addError(field.getId(),
                    field.getLabel() + " must be one of: " + String.join(", ", field.getOptions()));
                return;
            }
        }

        // If "Custom Terms" is selected and custom terms are required, validate custom text
        if ("Custom Terms".equals(selectedOption)) {
            String customTerms = (String) paymentTerms.get("customTerms");
            if (customTerms == null || customTerms.trim().isEmpty()) {
                result.addError(field.getId(),
                    field.getLabel() + " - custom terms must be specified when 'Custom Terms' is selected");
            }
        }
    }

    /**
     * Helper method to validate a field value without checking the data map
     */
    private void validateFieldValue(FormField field, Object value, ValidationResult result) {
        // Check required
        if (Boolean.TRUE.equals(field.getRequired())) {
            if (value == null || (value instanceof String && ((String) value).trim().isEmpty())) {
                result.addError(field.getId(), field.getLabel() + " is required");
                return;
            }
        }

        if (value == null) {
            return;
        }

        // Validate based on type
        switch (field.getType()) {
            case "text":
            case "textarea":
                validateText(field, value, result);
                break;
            case "number":
                validateNumber(field, value, result);
                break;
            case "select":
            case "radio":
                validateSelect(field, value, result);
                break;
        }
    }
}
