package com.hallbooking.model;

import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serializable;
import java.util.Date;

@Document(collection = "user")
@Data
public class User implements Serializable{

	private String id;
	private String password;
	private String emailId;
//	private String email;
	private String status;
	private UserDetails details;
	private Date lastLoginOn;
	private int wrongPasswordCount;
	private String authId;
	private Date lastModifiedDate;
	private String lastModifiedUser;
	private Date createdOn;
	private String createdUser;
	private Boolean isActive = true;

	public User(String emailId, String password, UserDetails details) {
		this.emailId = emailId;
		this.password = password;
		this.details = details;
	}
	public User(){}

}
