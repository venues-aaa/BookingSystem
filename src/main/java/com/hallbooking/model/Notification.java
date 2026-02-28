package com.hallbooking.model;

import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serializable;

@Document(collection="notification")
public class Notification implements Serializable {

	private String _id;
	private String vendorId;
	private String message;
	private boolean isRead;
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
	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}
	public boolean isRead() {
		return isRead;
	}
	public void setRead(boolean isRead) {
		this.isRead = isRead;
	}
	
	
}
