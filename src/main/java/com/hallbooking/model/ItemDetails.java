package com.hallbooking.model;

import java.io.Serializable;

public class ItemDetails implements Serializable{

	private String name;
	private String address; 
	private String place;
	private String[] contactNum; 
	private String mailId;
	private Amenities amenities;
	private double rating;
	private String mainImageUrl;
	private String description;
	private int qtyAvailable;
	 
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getAddress() {
		return address;
	}
	public void setAddress(String address) {
		this.address = address;
	}
	public String getPlace() {
		return place;
	}
	public void setPlace(String place) {
		this.place = place;
	}
	public String[] getContactNum() {
		return contactNum;
	}
	public void setContactNum(String[] contactNum) {
		this.contactNum = contactNum;
	}
	public String getMailId() {
		return mailId;
	}
	public void setMailId(String mailId) {
		this.mailId = mailId;
	}
	public Amenities getAmenities() {
		return amenities;
	}
	public void setAmenities(Amenities amenities) {
		this.amenities = amenities;
	}
	public double getRating() {
		return rating;
	}
	public void setRating(double rating) {
		this.rating = rating;
	}
	public String getMainImageUrl() {
		return mainImageUrl;
	}
	public void setMainImageUrl(String mainImageUrl) {
		this.mainImageUrl = mainImageUrl;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public int getQtyAvailable() {
		return qtyAvailable;
	}
	public void setQtyAvailable(int qtyAvailable) {
		this.qtyAvailable = qtyAvailable;
	}
	
}
