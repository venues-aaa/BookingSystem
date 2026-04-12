package com.hallbooking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pricing implements Serializable{

	private double baseRate;
	private double tax;
	private double discount;
	private double subTotal;
	private double otherDiscount;

}
