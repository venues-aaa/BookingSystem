package com.hallbooking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FilterDetails implements Serializable {

	private Integer seatingCapcity;
	private String tempControl;
	private double amount;

	
}
