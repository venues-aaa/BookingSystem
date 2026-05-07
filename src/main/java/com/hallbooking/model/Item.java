package com.hallbooking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serializable;
import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * Item - Represents a bookable item (Hall, Catering, Decoration, etc.)
 *
 * This model has been extended to support dynamic categories with flexible field structures.
 * Items can now store data in two ways:
 * 1. Legacy: Fixed structure using 'details' field (for existing halls)
 * 2. Dynamic: Flexible structure using 'dynamicData' map (for new categories)
 *
 * @author Hall Booking System
 * @version 2.0 - Extended with dynamic data support
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "item")
public class Item implements Serializable{

	/**
	 * Unique identifier for this item
	 */
	private String id;

	/**
	 * Vendor who owns this item
	 */
	private String vendorId;

	/**
	 * Place/Location ID
	 */
	private String placeId;

	/**
	 * Item type/category (e.g., "Hall", "Catering", "Decoration")
	 * This is the category name, not the ID
	 */
	private String type;

	/**
	 * Reference to the ItemType (category) document
	 * Used to fetch the form schema for validation
	 */
	private String categoryId;

	/**
	 * LEGACY: Fixed structure for hall details
	 * Kept for backward compatibility with existing halls
	 * New items should use dynamicData instead
	 */
	private ItemDetails details;

	/**
	 * DYNAMIC: Flexible field storage for category-specific data
	 * Structure is defined by the category's formSchema
	 *
	 * Example for Catering:
	 * {
	 *   "menuItems": [
	 *     {"name": "Biryani", "quantity": 50, "pricePerItem": 250},
	 *     {"name": "Pulao", "quantity": 30, "pricePerItem": 180}
	 *   ],
	 *   "eventTiming": {"from": "19:00", "to": "21:00"},
	 *   "needSuppliers": "Yes",
	 *   "numberOfSuppliers": 3
	 * }
	 */
	private Map<String, Object> dynamicData;

	/**
	 * Pricing information
	 */
	private Pricing price;

	/**
	 * Filter details for search functionality
	 */
	private FilterDetails filter;

	/**
	 * Customer reviews
	 */
	private List<ItemReviews> reviews;

	/**
	 * Item images
	 */
	private List<Image> images;

	/**
	 * Item status (e.g., "PENDING", "APPROVED", "REJECTED", "ACTIVE")
	 */
 	private String status;

	/**
	 * When this item was created
	 */
 	private Date createdOn;

	/**
	 * User who created this item
	 */
 	private String createdBy;

	/**
	 * When this item was last updated
	 */
 	private Date lastUpdatedOn;

	/**
	 * User who last updated this item
	 */
 	private String lastUpdatedBy;
}
