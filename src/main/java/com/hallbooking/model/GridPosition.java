package com.hallbooking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * GridPosition - Defines the position and size of a field in the form layout grid
 *
 * The form builder uses a 12-column grid system (like Bootstrap).
 * Fields can span multiple columns and rows.
 *
 * Example:
 * - Full width field: x=0, width=12
 * - Half width field: x=0, width=6
 * - Two fields side by side: x=0, width=6 and x=6, width=6
 *
 * @author Hall Booking System
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GridPosition implements Serializable {

    /**
     * Column position (0-based)
     * Valid range: 0 to (columns - 1)
     */
    private Integer x;

    /**
     * Row position (0-based)
     */
    private Integer y;

    /**
     * Number of columns to span
     * Valid range: 1 to (columns - x)
     */
    private Integer width;

    /**
     * Number of rows to span
     * Typically 1 for single-line fields, 2+ for textareas or groups
     */
    private Integer height;
}
