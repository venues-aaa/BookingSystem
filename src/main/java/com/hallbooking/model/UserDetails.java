package com.hallbooking.model;

import java.io.Serializable;

public class UserDetails implements Serializable{

	private String firstName;
	private String lastName;
	private String address;
	private String[] contactNbr;

	public UserDetails(String firstName, String lastName) {
		this.firstName = firstName;
		this.lastName = lastName;
	}

	public UserDetails(){}

	public String getFirstName() {
		return firstName;
	}
	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}
	public String getLastName() {
		return lastName;
	}
	public void setLastName(String lastName) {
		this.lastName = lastName;
	}
	public String getAddress() {
		return address;
	}
	public void setAddress(String address) {
		this.address = address;
	}
	public String[] getContactNbr() {
		return contactNbr;
	}
	public void setContactNbr(String[] contactNbr) {
		this.contactNbr = contactNbr;
	}
	
	
}
