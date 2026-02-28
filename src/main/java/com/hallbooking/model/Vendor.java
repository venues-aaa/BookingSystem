package com.hallbooking.model;

import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serializable;
import java.util.Date;

@Document(collection = "vendor")
public class Vendor implements Serializable {

	private String _id;
	private String password;
	private String vendorId;
	private String[] itemIds;
	private String status;
	private String emailId;
	private VendorDetails details;
	private Date lastLoginOn;
	private int wrongPasswordCount;
	private String authId;
	private Date lastModifiedDate;
	private String lastModifiedUser;
	private Date createdOn;
	private String createdUser;
	public String get_id() {
		return _id;
	}
	public void set_id(String _id) {
		this._id = _id;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public String getVendorId() {
		return vendorId;
	}
	public void setVendorId(String vendorId) {
		this.vendorId = vendorId;
	}
	public String[] getItemIds() {
		return itemIds;
	}
	public void setItemIds(String[] itemIds) {
		this.itemIds = itemIds;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public VendorDetails getDetails() {
		return details;
	}
	public void setDetails(VendorDetails details) {
		this.details = details;
	}
	public Date getLastLoginOn() {
		return lastLoginOn;
	}
	public void setLastLoginOn(Date lastLoginOn) {
		this.lastLoginOn = lastLoginOn;
	}
	public int getWrongPasswordCount() {
		return wrongPasswordCount;
	}
	public void setWrongPasswordCount(int wrongPasswordCount) {
		this.wrongPasswordCount = wrongPasswordCount;
	}
	public Date getLastModifiedDate() {
		return lastModifiedDate;
	}
	public void setLastModifiedDate(Date lastModifiedDate) {
		this.lastModifiedDate = lastModifiedDate;
	}
	public String getLastModifiedUser() {
		return lastModifiedUser;
	}
	public void setLastModifiedUser(String lastModifiedUser) {
		this.lastModifiedUser = lastModifiedUser;
	}
	public Date getCreatedOn() {
		return createdOn;
	}
	public void setCreatedOn(Date createdOn) {
		this.createdOn = createdOn;
	}
	public String getCreatedUser() {
		return createdUser;
	}
	public void setCreatedUser(String createdUser) {
		this.createdUser = createdUser;
	}
	public String getEmailId() {
		return emailId;
	}
	public void setEmailId(String emailId) {
		this.emailId = emailId;
	}
	public String getAuthId() {
		return authId;
	}
	public void setAuthId(String authId) {
		this.authId = authId;
	}
	
}
