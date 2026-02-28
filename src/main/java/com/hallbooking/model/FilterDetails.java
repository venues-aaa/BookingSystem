package com.hallbooking.model;

import java.io.Serializable;

public class FilterDetails implements Serializable {

	private String seatingCapcity;
	private String tempControl;
	private double amount;

	public String getSeatingCapcity() {
		return seatingCapcity;
	}
	public void setSeatingCapcity(String seatingCapcity) {
		this.seatingCapcity = seatingCapcity;
	}
	public String getTempControl() {
		return tempControl;
	}
	public void setTempControl(String tempControl) {
		this.tempControl = tempControl;
	}
	public double getAmount() {
		return amount;
	}
	public void setAmount(double amount) {
		this.amount = amount;
	}
	
	
	
	
	
	
}
