package com.hallbooking.dao;

import com.hallbooking.model.User;
import com.hallbooking.model.Vendor;

import java.util.List;

public interface UserDao {

	public User retrieveUserDetails(User user);

	public List<User> retrieveAllUsers();
	
	public String createUser(User user);

	public boolean updateUser(User user);
	
	public User retrieveUser(String userId);
	
	public void incrementWrongPasswordCount(User user);
	
	public void updateUserAuthId(User user);
	
	public Boolean validateUserAuthId(User user);
	
	//----Vendor
	
	public void createVendor(Vendor vendor);
	
	public Vendor retrieveVendorDetails(Vendor vendor);
	
	public Vendor retrieveVendor(String vendorId);
	
	public void incrementWrongPasswordCount(Vendor vendor);
	
	public void updateVendorAuthId(Vendor vendor);
	
	public Boolean validateVendorAuthId(Vendor vendor);

	public boolean generateAndSendOtp(String accountId, String destination);

	public boolean validateOtp(String accountId, String inputOtp);
	
	//---------
	
	public boolean updateUserPassword(User user);
	
	public boolean updateVendorPassword(Vendor vendor);
	
	public void clearNotification(String vendorId);
 
	public void deleteAllUsers();
}
