package com.hallbooking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serializable;
import java.util.Date;

/**
 * ItemType - Represents a category with its dynamic form schema
 *
 * This model has been extended to support the dynamic form builder feature.
 * Admin can design custom forms for each category (Hall, Catering, Decoration, etc.)
 *
 * @author Hall Booking System
 * @version 2.0 - Extended with FormSchema support
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "itemType")
public class ItemType implements Serializable {

	/**
	 * Unique identifier for this category
	 */
	private String id;

	/**
	 * Internal category name (e.g., "Hall", "Catering", "Decoration")
	 * Used in code and database queries
	 */
	private String name;

	/**
	 * Display name shown to users (e.g., "Event Halls", "Catering Services")
	 */
	private String displayName;

	/**
	 * Description of this category
	 */
	private String description;

	/**
	 * Icon name or URL for this category
	 */
	private String icon;

	/**
	 * The dynamic form schema designed by admin for ITEM CREATION (Vendor side)
	 * Contains all field definitions and layout configuration
	 * Used when vendors create items in this category
	 */
	private FormSchema formSchema;

	/**
	 * The dynamic form schema designed by admin for BOOKING (Customer side)
	 * Contains all field definitions and layout configuration for the booking experience
	 * Used when customers book items in this category
	 *
	 * If null, the system falls back to default booking form (date, time, attendees)
	 */
	private FormSchema bookingFormSchema;

	/**
	 * Whether this category is active
	 * Inactive categories are not shown to vendors/users
	 */
	private Boolean isActive;

	/**
	 * When this category was created
	 */
	private Date createdOn;

	/**
	 * User who created this category
	 */
	private String createdBy;

	/**
	 * When this category was last modified
	 */
	private Date lastModifiedOn;

	/**
	 * User who last modified this category
	 */
	private String lastModifiedBy;
}
