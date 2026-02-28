package com.hallbooking.model;

public class Invoice {

	private User user;
	private Booking bookingObj;
	private Item itemDetails;
	public User getUser() {
		return user;
	}
	public void setUser(User user) {
		this.user = user;
	}
	public Booking getBookingObj() {
		return bookingObj;
	}
	public void setBookingObj(Booking bookingObj) {
		this.bookingObj = bookingObj;
	}
	public Item getItemDetails() {
		return itemDetails;
	}
	public void setItemDetails(Item itemDetails) {
		this.itemDetails = itemDetails;
	}
	
	
}
