package com.hallbooking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VendorDetails implements Serializable {

	private String name;
	private String address;
	private String[] contactNbr;
	private Date contractEndDate;

}
