package com.hallbooking.model;

import java.io.Serializable;

public class Pricing implements Serializable{

	private double baseRate;
	private double tax;
	private double discount;
	private double subTotal;
	private double otherDiscount;
	
	public double getTax() {
		return tax;
	}
	public void setTax(double tax) {
		this.tax = tax;
	}
	public double getBaseRate() {
		return baseRate;
	}
	public void setBaseRate(double baseRate) {
		this.baseRate = baseRate;
	}
	public double getDiscount() {
		return discount;
	}
	public void setDiscount(double discount) {
		this.discount = discount;
	}
	public double getSubTotal() {
		return subTotal;
	}
	public void setSubTotal(double subTotal) {
		this.subTotal = subTotal;
	}
	public double getOtherDiscount() {
		return otherDiscount;
	}
	public void setOtherDiscount(double otherDiscount) {
		this.otherDiscount = otherDiscount;
	}

}
