package com.hallbooking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

import org.springframework.data.mongodb.core.index.Indexed;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FilterDetails implements Serializable {

	private Integer seatingCapcity;
	private String tempControl;
	private double amount;
	private String type;
	private double rating;
	private String city;
	@Indexed
    private boolean featured = false;

	
}
