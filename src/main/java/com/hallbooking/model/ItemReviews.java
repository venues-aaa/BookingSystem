package com.hallbooking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemReviews implements Serializable{

	private String userName;
	private double rating;
	private String heading;
	private String comment;
	private Date date;
	private String status;

}
