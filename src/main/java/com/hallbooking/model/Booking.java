package com.hallbooking.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "booking")
public class Booking implements Serializable{

	private String id;
	private String itemId;
	private String itemName;
	private String userId;
	private String userName;  // User's full name (firstName + lastName)
	private String userEmail; // User's email address
	private String vendorId;

	/**
	 * Booking start date/time
	 * @JsonFormat ensures consistent ISO string serialization for frontend
	 */
	@JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
	private LocalDateTime bookingFromDate;

	/**
	 * Booking end date/time
	 * @JsonFormat ensures consistent ISO string serialization for frontend
	 */
	@JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
	private LocalDateTime bookingToDate;

	private String status;
	private BookingDetails details;

	// Payment workflow fields
	private String paymentOption; // BLOCK_DATE_PARTIAL, CONFIRM_FULL_PAYMENT, PAY_OFFLINE
	private String paymentStatus; // PENDING, PARTIAL_PAID, FULLY_PAID, OFFLINE_PENDING, OFFLINE_CONFIRMED
	private Double partialPaymentAmount; // Amount paid for block date
	private Integer partialPaymentPercentage; // Percentage from vendor's payment terms
	private Boolean vendorConfirmationRequired; // True for PAY_OFFLINE option
	private String vendorConfirmationStatus; // PENDING, CONFIRMED, CANCELLED for offline payments
	private String vendorCancellationReason; // Reason if vendor cancels offline booking

	// Coupon discount fields (applied via coupon validation)
	private Double discountApplied; // Percentage discount from coupon (e.g., 50 for 50% off)
	private String discountReason; // Human-readable reason (e.g., "Coupon: BUNDLE-ABC123")

	private Date createdOn;
	private String createdBy;
	private String lastUpdateUserId;
	private Date lastUpdateDate;
	@Transient
	private String authId;
	
}
