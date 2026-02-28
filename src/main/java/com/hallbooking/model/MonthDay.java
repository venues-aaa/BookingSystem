package com.hallbooking.model;

import java.io.Serializable;
import java.util.Set;

public class MonthDay implements Serializable {

	private int month;
	private Set<Integer> days;
	
	public int getMonth() {
		return month;
	}
	public void setMonth(int month) {
		this.month = month;
	}
	public Set<Integer> getDays() {
		return days;
	}
	public void setDays(Set<Integer> days) {
		this.days = days;
	}
	

}
