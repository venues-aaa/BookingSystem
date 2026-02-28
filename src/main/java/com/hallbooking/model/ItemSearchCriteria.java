package com.hallbooking.model;

import java.io.Serializable;

public class ItemSearchCriteria implements Serializable{

	private String type;
	private int placeId;
	//For Auditorium
	private int seatingCapacity;
	private String tempControl;
	
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public int getPlaceId() {
		return placeId;
	}
	public void setPlaceId(int placeId) {
		this.placeId = placeId;
	}
	public int getSeatingCapacity() {
		return seatingCapacity;
	}
	public void setSeatingCapacity(int seatingCapacity) {
		this.seatingCapacity = seatingCapacity;
	}
	public String getTempControl() {
		return tempControl;
	}
	public void setTempControl(String tempControl) {
		this.tempControl = tempControl;
	}
	
	
}
