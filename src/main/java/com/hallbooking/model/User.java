package com.hallbooking.model;

import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serializable;
import java.util.Date;

@Document(collection = "user")
@Data
public class User implements Serializable{

	private String _id;
	private String password;
	private String emailId;
	private String email;
	private String status;
	private UserDetails details;
	private Date lastLoginOn;
	private int wrongPasswordCount;
	private String authId;
	private Date lastModifiedDate;
	private String lastModifiedUser;
	private Date createdOn;
	private String createdUser;

	public User(String emailId, String password, UserDetails details) {
		this.emailId = emailId;
		this.password = password;
		this.details = details;
	}
	public User(){}

	/*public String get_id() {
		return _id;
	}
	public void set_id(String _id) {
		this._id = _id;
	}
	public UserDetails getDetails() {
		return details;
	}
	public void setDetails(UserDetails details) {
		this.details = details;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public String getEmailId() {
		return emailId;
	}
	public void setEmailId(String emailId) {
		this.emailId = emailId;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public Date getLastLoginOn() {
		return lastLoginOn;
	}
	public void setLastLoginOn(Date lastLoginOn) {
		this.lastLoginOn = lastLoginOn;
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
	public int getWrongPasswordCount() {
		return wrongPasswordCount;
	}
	public void setWrongPasswordCount(int wrongPasswordCount) {
		this.wrongPasswordCount = wrongPasswordCount;
	}
	public String getAuthId() {
		return authId;
	}
	public void setAuthId(String authId) {
		this.authId = authId;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}*/
	
}
