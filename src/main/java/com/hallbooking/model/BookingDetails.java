package com.hallbooking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingDetails implements Serializable{

	private String bookedThrough;
	private double amtCollected;
	private double taxCollected;
	private boolean amtProcessedToVendor;
	private String amtProcessedToVendorThrough;
	private Date amtProcessedToVendorOn;
	private String type;
	private String place;
	private int qtyAvailable;
	private User userDetails;
	private String blockedBy;
	private String blockedReason;
	private BigDecimal totalPrice;
	private String functionType;
	private int numberOfAttendees;

	/**
	 * For Catering items: Selected menu items with quantities
	 * Structure: List of { itemName, quantity, pricePerPerson, subtotal }
	 */
	private List<Map<String, Object>> selectedMenuItems;

	/**
	 * For Catering items: Event timing (start and end time)
	 */
	private Map<String, String> eventTiming;

	/**
	 * For Catering items: Additional staff requested
	 */
	private Boolean additionalStaffRequested;

	/**
	 * For Catering items: Number of additional staff
	 */
	private Integer numberOfAdditionalStaff;

	/**
	 * Vendor's payment terms selected when creating the item
	 * Stored as-is from item.dynamicData payment terms field
	 */
	private Map<String, Object> vendorPaymentTerms;

	/**
	 * Total booking amount (calculated based on item price and attendees)
	 */
	private Double totalBookingAmount;

	/**
	 * Additional flexible data for booking details
	 * Used to store custom fields from dynamic booking forms
	 */
	private Map<String, Object> additionalDetails;

}
