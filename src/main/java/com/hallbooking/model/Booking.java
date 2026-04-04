package com.hallbooking.model;

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
	private String vendorId;
	private LocalDateTime bookingFromDate;
	private LocalDateTime bookingToDate;
	private String status;
	private BookingDetails details;
	private Date createdOn;
	private String createdBy;
	private String lastUpdateUserId;
	private Date lastUpdateDate;
	@Transient
	private String authId;
	
}
