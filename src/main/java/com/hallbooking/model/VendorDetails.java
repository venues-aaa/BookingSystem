package com.hallbooking.model;

import java.io.Serializable;
import java.util.Date;

public class VendorDetails implements Serializable {

	private String name;
	private String address;
	private String[] contactNbr;
	private Date contractEndDate;
	
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
	public String[] getContactNbr() {
		return contactNbr;
	}
	public void setContactNbr(String[] contactNbr) {
		this.contactNbr = contactNbr;
	}
	public Date getContractEndDate() {
		return contractEndDate;
	}
	public void setContractEndDate(Date contractEndDate) {
		this.contractEndDate = contractEndDate;
	}
	
	
}
