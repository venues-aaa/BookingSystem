package com.hallbooking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serializable;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "vendor")
public class Vendor implements Serializable {

	private String _id;
	private String password;
	private String vendorId;
	private String[] itemIds;
	private String status;
	private String emailId;
	private VendorDetails details;
	private Date lastLoginOn;
	private int wrongPasswordCount;
	private String authId;
	private Date lastModifiedDate;
	private String lastModifiedUser;
	private Date createdOn;
	private String createdUser;

}
