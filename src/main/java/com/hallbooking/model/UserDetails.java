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
	private String role;

	public UserDetails(String firstName, String lastName) {
		this.firstName = firstName;
		this.lastName = lastName;
	}

	public UserDetails(String firstName, String lastName, String role) {
		this.firstName = firstName;
		this.lastName = lastName;
		this.role = role;
	}

}
