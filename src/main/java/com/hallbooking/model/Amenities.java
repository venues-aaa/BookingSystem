package com.hallbooking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Amenities implements Serializable{

	private String amenity1;
	private String amenity2;
	private String amenity3;
	private String amenity4;
	private String amenity5;
	private String amenity6;

}
