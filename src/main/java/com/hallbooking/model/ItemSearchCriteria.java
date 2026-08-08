package com.hallbooking.model;

import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ItemSearchCriteria implements Serializable{

	private String type;
	private String placeId;
	private String place;
	private LocalDateTime startDate;
	private LocalDateTime endDate;
	private List<Double> ratings;
	private List<String> priceRanges;
	private List<Integer> capacities;
	//For Auditorium
	private Integer seatingCapacity;
	private String tempControl;
	private String sortBy;
}
