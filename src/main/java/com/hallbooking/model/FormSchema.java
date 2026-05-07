package com.hallbooking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

/**
 * FormSchema - Defines the structure of a dynamic form for a category
 *
 * This class represents the complete form design created by admins using
 * the drag-and-drop form builder. It contains all field definitions and
 * layout configuration.
 *
 * @author Hall Booking System
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FormSchema implements Serializable {

    /**
     * List of all fields in the form
     */
    private List<FormField> fields;

    /**
     * Layout configuration for the form grid
     */
    private LayoutConfig layout;

    /**
     * Schema version number for tracking changes
     * Incremented each time the admin modifies the form
     */
    private Integer version;
}
