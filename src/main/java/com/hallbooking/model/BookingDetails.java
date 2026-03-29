package com.hallbooking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

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

}
