package com.hallbooking.service;

import com.hallbooking.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * BookingValidationService - Validates booking requests against item's dynamic form fields
 *
 * This service enables validation of booking data against the item's category schema.
 * For example, it can validate that numberOfAttendees doesn't exceed the hall's capacity.
 *
 * @author Hall Booking System
 * @version 1.0
 */
@Service
public class BookingValidationService {

    private static final Logger logger = LoggerFactory.getLogger(BookingValidationService.class);

    @Autowired
    private CategoryService categoryService;

    /**
     * Validate a booking request against the item's form schema
     *
     * @param item The item being booked
     * @param numberOfAttendees Number of attendees from booking request
     * @throws RuntimeException if validation fails
     */
    public void validateBooking(Item item, Integer numberOfAttendees) {
        if (item == null) {
            throw new RuntimeException("Item not found");
        }

        // Skip validation if item has no category or no dynamic data
        if (item.getCategoryId() == null || item.getDynamicData() == null) {
            logger.info("Skipping dynamic validation - item has no category or dynamic data");
            return;
        }

        try {
            // Get the category to access form schema
            ItemType category = categoryService.getCategoryById(item.getCategoryId());
            if (category == null || category.getFormSchema() == null) {
                logger.warn("Category or form schema not found for item: {}", item.getId());
                return;
            }

            // Validate against each field that has booking validation rules
            List<String> errors = new ArrayList<>();
            for (FormField field : category.getFormSchema().getFields()) {
                if (field.getBookingValidationRules() != null &&
                    Boolean.TRUE.equals(field.getBookingValidationRules().getValidateOnBooking())) {

                    String error = validateField(field, item.getDynamicData(), numberOfAttendees);
                    if (error != null) {
                        errors.add(error);
                    }
                }
            }

            // Throw exception if there are validation errors
            if (!errors.isEmpty()) {
                throw new RuntimeException(String.join("; ", errors));
            }

        } catch (Exception e) {
            if (e instanceof RuntimeException) {
                throw (RuntimeException) e;
            }
            logger.error("Error during booking validation", e);
            throw new RuntimeException("Validation error: " + e.getMessage());
        }
    }

    /**
     * Validate a single field against booking data
     */
    private String validateField(FormField field, Map<String, Object> itemData, Integer numberOfAttendees) {
        BookingValidationRules rules = field.getBookingValidationRules();

        // Get the item's value for this field
        Object itemValue = itemData.get(field.getId());
        if (itemValue == null) {
            logger.debug("Field {} has no value in item data", field.getId());
            return null;
        }

        // Get the booking field value based on the mapping
        Object bookingValue = getBookingFieldValue(rules.getBookingFieldName(), numberOfAttendees);
        if (bookingValue == null) {
            logger.debug("No booking value provided for field: {}", rules.getBookingFieldName());
            return null;
        }

        // Perform validation based on type
        String validationType = rules.getValidationType();
        if ("MAX_VALUE".equals(validationType)) {
            return validateMaxValue(field, itemValue, bookingValue, rules.getErrorMessage());
        } else if ("MIN_VALUE".equals(validationType)) {
            return validateMinValue(field, itemValue, bookingValue, rules.getErrorMessage());
        }

        return null;
    }

    /**
     * Get booking field value by name
     */
    private Object getBookingFieldValue(String fieldName, Integer numberOfAttendees) {
        if ("numberOfAttendees".equals(fieldName)) {
            return numberOfAttendees;
        }
        // Add more booking fields as needed
        return null;
    }

    /**
     * Validate that booking value doesn't exceed item's maximum value
     */
    private String validateMaxValue(FormField field, Object itemValue, Object bookingValue, String errorMessage) {
        try {
            Integer maxValue = convertToInteger(itemValue);
            Integer actualValue = convertToInteger(bookingValue);

            if (maxValue != null && actualValue != null && actualValue > maxValue) {
                String message = errorMessage != null ? errorMessage :
                        String.format("%s (%d) exceeds maximum allowed (%d)", field.getLabel(), actualValue, maxValue);
                logger.warn("Validation failed: {}", message);
                return message;
            }
        } catch (Exception e) {
            logger.error("Error validating max value for field: {}", field.getId(), e);
        }
        return null;
    }

    /**
     * Validate that booking value meets minimum requirement
     */
    private String validateMinValue(FormField field, Object itemValue, Object bookingValue, String errorMessage) {
        try {
            Integer minValue = convertToInteger(itemValue);
            Integer actualValue = convertToInteger(bookingValue);

            if (minValue != null && actualValue != null && actualValue < minValue) {
                String message = errorMessage != null ? errorMessage :
                        String.format("%s (%d) is below minimum required (%d)", field.getLabel(), actualValue, minValue);
                logger.warn("Validation failed: {}", message);
                return message;
            }
        } catch (Exception e) {
            logger.error("Error validating min value for field: {}", field.getId(), e);
        }
        return null;
    }

    /**
     * Convert object to integer safely
     */
    private Integer convertToInteger(Object value) {
        if (value == null) return null;
        if (value instanceof Integer) return (Integer) value;
        if (value instanceof Number) return ((Number) value).intValue();
        if (value instanceof String) {
            try {
                return Integer.parseInt((String) value);
            } catch (NumberFormatException e) {
                logger.warn("Could not convert string to integer: {}", value);
                return null;
            }
        }
        return null;
    }
}
