package com.hallbooking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemDetails implements Serializable{

	private String name;
	private String address;
	private String place;
	private List<String> contactNum;
	private String mailId;
	private List<String> amenities;
	private double rating;
	private long reviewCount;
	private String mainImageUrl;
	private String description;
	private int qtyAvailable;
	private List<String> gallery;
	private AvailableSlotTypes availableSlotTypes; // Which slot types this hall supports
}
