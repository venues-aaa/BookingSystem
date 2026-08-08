package com.hallbooking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serializable;
import java.util.Date;
import java.util.Map;

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
	private String email;
	private String businessName;
	private String ownerName;
	private String phone;
	private String address;
	private String city;
	private String state;
	private String pincode;
	private String logo;
	private String accountHolder;
	private String bankName;
	private String accountNumber;
	private String ifsc;
	private String upiId;
	private String gstNumber;
	private String panNumber;
	private String businessLicense;
	private String verificationStatus;
	private Map<String, String> verificationDocuments;
	private Boolean emailNotifications;
	private Boolean smsNotifications;
	private Boolean bookingAlerts;
	private Boolean reviewAlerts;
	private Boolean paymentAlerts;
	private Boolean marketingEmails;
	private String subscriptionPlan;
	private Date subscriptionStartDate;
	private Date subscriptionEndDate;
	private Boolean renewalReminder;
	private Boolean autoRenewal;
	private Integer reminderDaysBeforeExpiry;
	private VendorDetails details;
	private Date lastLoginOn;
	private int wrongPasswordCount;
	private String authId;
	private Date lastModifiedDate;
	private String lastModifiedUser;
	private Date createdOn;
	private String createdUser;

}
