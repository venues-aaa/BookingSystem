package com.hallbooking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * LayoutConfig - Defines the grid layout configuration for the form
 *
 * The form uses a responsive grid system where fields are positioned
 * using column and row coordinates.
 *
 * @author Hall Booking System
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LayoutConfig implements Serializable {

    /**
     * Total number of columns in the grid
     * Default: 12 (like Bootstrap)
     */
    private Integer columns;

    /**
     * Height of each row in pixels
     * Default: 60
     */
    private Integer rowHeight;

    /**
     * Constructor with default values
     */
    public static LayoutConfig createDefault() {
        return new LayoutConfig(12, 60);
    }
}
