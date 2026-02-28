package com.hallbooking.model;

import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

@Document(collection = "item")
public class Item implements Serializable{

	private String _id;
	private String vendorId;
	private String placeId;
	private String type;
	private ItemDetails details;
	private Pricing price;
	private FilterDetails filter; // this can be appended with any filter that is required
	private List<ItemReviews> reviews;
	private List<Image> images;
 	private String status;
 	private Date createdOn;
 	private String createdBy;
 	private Date lastUpdatedOn;
 	private String lastUpdatedBy;
// 	private Date dateSelected;
	 
	public String get_id() {
		return _id;
	}
	public void set_id(String _id) {
		this._id = _id;
	}
	public String getVendorId() {
		return vendorId;
	}
	public void setVendorId(String vendorId) {
		this.vendorId = vendorId;
	}
	public String getPlaceId() {
		return placeId;
	}
	public void setPlaceId(String placeId) {
		this.placeId = placeId;
	}
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public ItemDetails getDetails() {
		return details;
	}
	public void setDetails(ItemDetails details) {
		this.details = details;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public Pricing getPrice() {
		return price;
	}
	public void setPrice(Pricing price) {
		this.price = price;
	}
	public FilterDetails getFilter() {
		return filter;
	}
	public void setFilter(FilterDetails filter) {
		this.filter = filter;
	}
	public List<ItemReviews> getReviews() {
		return reviews;
	}
	public void setReviews(List<ItemReviews> reviews) {
		this.reviews = reviews;
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
	public Date getLastUpdatedOn() {
		return lastUpdatedOn;
	}
	public void setLastUpdatedOn(Date lastUpdatedOn) {
		this.lastUpdatedOn = lastUpdatedOn;
	}
	public String getLastUpdatedBy() {
		return lastUpdatedBy;
	}
	public void setLastUpdatedBy(String lastUpdatedBy) {
		this.lastUpdatedBy = lastUpdatedBy;
	}
	public List<Image> getImages() {
		return images;
	}
	public void setImages(List<Image> images) {
		this.images = images;
	}
	
}
