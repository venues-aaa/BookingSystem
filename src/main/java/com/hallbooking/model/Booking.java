package com.hallbooking.model;

import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serializable;
import java.util.Date;

@Document(collection = "booking")
public class Booking implements Serializable{

	private String _id;
	private String itemId;
	private String itemName;
	private String userId;
	private String vendorId;
	private Date bookingFromDate;
	private Date bookingToDate;
	private String status;
	private BookingDetails details;
	private Date createdOn;
	private String createdBy;
	private String lastUpdateUserId;
	private Date lastUpdateDate;
	@Transient
	private String authId;
	
	public String get_id() {
		return _id;
	}
	public void set_id(String _id) {
		this._id = _id;
	}
	public String getItemId() {
		return itemId;
	}
	public void setItemId(String itemId) {
		this.itemId = itemId;
	}
	public String getItemName() {
		return itemName;
	}
	public void setItemName(String itemName) {
		this.itemName = itemName;
	}
	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}
	public String getVendorId() {
		return vendorId;
	}
	public void setVendorId(String vendorId) {
		this.vendorId = vendorId;
	}
	public Date getBookingFromDate() {
		return bookingFromDate;
	}
	public void setBookingFromDate(Date bookingFromDate) {
		this.bookingFromDate = bookingFromDate;
	}
	public Date getBookingToDate() {
		return bookingToDate;
	}
	public void setBookingToDate(Date bookingToDate) {
		this.bookingToDate = bookingToDate;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public BookingDetails getDetails() {
		return details;
	}
	public void setDetails(BookingDetails details) {
		this.details = details;
	}
	public Date getCreatedOn() {
		return createdOn;
	}
	public void setCreatedOn(Date createdOn) {
		this.createdOn = createdOn;
	}
	public String getCreatedBy() {
		return createdBy;
	}
	public void setCreatedBy(String createdBy) {
		this.createdBy = createdBy;
	}
	public String getLastUpdateUserId() {
		return lastUpdateUserId;
	}
	public void setLastUpdateUserId(String lastUpdateUserId) {
		this.lastUpdateUserId = lastUpdateUserId;
	}
	public Date getLastUpdateDate() {
		return lastUpdateDate;
	}
	public void setLastUpdateDate(Date lastUpdateDate) {
		this.lastUpdateDate = lastUpdateDate;
	}
	public String getAuthId() {
		return authId;
	}
	public void setAuthId(String authId) {
		this.authId = authId;
	}
	
}
