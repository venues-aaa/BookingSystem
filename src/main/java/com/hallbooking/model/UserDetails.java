package com.hallbooking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDetails implements Serializable{

	private String firstName;
	private String lastName;
	private String address;
	private String[] contactNbr;

	public UserDetails(String firstName, String lastName) {
		this.firstName = firstName;
		this.lastName = lastName;
	}

}
