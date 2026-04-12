package com.hallbooking.model;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ItemSearchCriteria implements Serializable{

	private String type;
	private String placeId;
	//For Auditorium
	private Integer seatingCapacity;
	private String tempControl;
	private String sortBy;

}
