package com.hallbooking.model;

import java.io.Serializable;
import java.util.Date;

public class BookingDetails implements Serializable{

	private String bookedThrough;
	private String bookingFromTime;
	private String bookingToTime;
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
	
	public String getBookedThrough() {
		return bookedThrough;
	}
	public void setBookedThrough(String bookedThrough) {
		this.bookedThrough = bookedThrough;
	}
	public String getBookingFromTime() {
		return bookingFromTime;
	}
	public void setBookingFromTime(String bookingFromTime) {
		this.bookingFromTime = bookingFromTime;
	}
	public String getBookingToTime() {
		return bookingToTime;
	}
	public void setBookingToTime(String bookingToTime) {
		this.bookingToTime = bookingToTime;
	}
	public double getAmtCollected() {
		return amtCollected;
	}
	public void setAmtCollected(double amtCollected) {
		this.amtCollected = amtCollected;
	}
	public double getTaxCollected() {
		return taxCollected;
	}
	public void setTaxCollected(double taxCollected) {
		this.taxCollected = taxCollected;
	}
	public boolean isAmtProcessedToVendor() {
		return amtProcessedToVendor;
	}
	public void setAmtProcessedToVendor(boolean amtProcessedToVendor) {
		this.amtProcessedToVendor = amtProcessedToVendor;
	}
	public String getAmtProcessedToVendorThrough() {
		return amtProcessedToVendorThrough;
	}
	public void setAmtProcessedToVendorThrough(String amtProcessedToVendorThrough) {
		this.amtProcessedToVendorThrough = amtProcessedToVendorThrough;
	}
	public Date getAmtProcessedToVendorOn() {
		return amtProcessedToVendorOn;
	}
	public void setAmtProcessedToVendorOn(Date amtProcessedToVendorOn) {
		this.amtProcessedToVendorOn = amtProcessedToVendorOn;
	}
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public String getPlace() {
		return place;
	}
	public void setPlace(String place) {
		this.place = place;
	}
	public int getQtyAvailable() {
		return qtyAvailable;
	}
	public void setQtyAvailable(int qtyAvailable) {
		this.qtyAvailable = qtyAvailable;
	}
	public User getUserDetails() {
		return userDetails;
	}
	public void setUserDetails(User userDetails) {
		this.userDetails = userDetails;
	}
	public String getBlockedBy() {
		return blockedBy;
	}
	public void setBlockedBy(String blockedBy) {
		this.blockedBy = blockedBy;
	}
	public String getBlockedReason() {
		return blockedReason;
	}
	public void setBlockedReason(String blockedReason) {
		this.blockedReason = blockedReason;
	}
	
}
