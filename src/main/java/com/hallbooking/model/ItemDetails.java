package com.hallbooking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
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
	private AvailableSlotTypes availableSlotTypes; // Which slot types this hall supports
}
