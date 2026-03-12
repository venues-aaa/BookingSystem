package com.hallbooking.service;

import com.hallbooking.dao.UserDao;
import com.hallbooking.model.User;
import com.hallbooking.model.UserDetails;
import com.hallbooking.model.Vendor;
import com.hallbooking.utility.RandomPasswordGenerator;
import org.passay.PasswordUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;

//@Component  // Disabled temporarily - requires MongoDB
public class UserDetailsProcessor {

	@Autowired
	private UserDao userDetailsDao;
	@Autowired
	private RandomPasswordGenerator randomPasswordGenerator;
	@Autowired
	private UserPasswordMailProcessor userPasswordMailProcessor;

	@Autowired
	private PasswordEncoder passwordEncoder;
	
	/**
	 * Method to fetch Item details based on Item Id
	 * @param user
	 * @return Item
	 */
	public User validateUserDetails(User user) {
	  
		//call the dao for fetching the item details 
		User userDetails = userDetailsDao.retrieveUserDetails(user);
		
		if(userDetails != null) {
	        // Encrypted and Base64 encoded password read from database
	        boolean passwordMatch =true;//= PasswordUtils.verifyUserPassword(user.getPassword(), userDetails.getPassword());
	        
	        if(passwordMatch && userDetails.getWrongPasswordCount() <= 4) {
	        	if(!StringUtils.isEmpty(userDetails.getAuthId())) {
	        		 System.out.println("User already logged in another browser. "+userDetails.getEmailId());
	        		 return null;
	        	}
	            System.out.println("Provided user password is correct.");
	            String token = UUID.randomUUID().toString();
	            userDetails.setAuthId(token);
	            userDetailsDao.updateUserAuthId(user);
	            return userDetails; 
	        } else {
	            System.out.println("Provided password is incorrect");
	            if(userDetails.getWrongPasswordCount() <= 4 ) {
	            	userDetailsDao.incrementWrongPasswordCount(userDetails);
	            } else {
	            	userDetails = new User();
	            	userDetails.setWrongPasswordCount(5);
	            	return userDetails;
	            }
	        }
		}
		return null;
 	}
	
	public User retrieveUserDetails(User user) {
		User userDetails = userDetailsDao.retrieveUserDetails(user);
		
		return userDetails;
	}

	public List<User> retrieveAllUsers() {
		List<User> userList = userDetailsDao.retrieveAllUsers();

		return userList;
	}
	
	public User retrieveUser(String userId) {
		User userDetails = userDetailsDao.retrieveUser(userId);
		
		return userDetails;
	}
	
	public void createUser(User user) {
		   
		User userDetails = userDetailsDao.retrieveUserDetails(user);
		if(null == userDetails || userDetails.get_id() == null) {
	        // Protect user's password. The generated value can be stored in DB.
	        String mySecurePassword = passwordEncoder.encode(user.getPassword());
	        
	        // Print out protected password 
	        System.out.println("My secure password = " + mySecurePassword);
	        user.setPassword(mySecurePassword);
			userDetailsDao.createUser(user);
		} else {
			//TODO user already exists
		}
	}
	
	//------------------Vendor
	
	public void createVendor(Vendor vendor) {
		
		//call the dao for fetching the item details 
		Vendor vendorDetails = userDetailsDao.retrieveVendorDetails(vendor);
		if(null == vendorDetails || vendorDetails.get_id() == null) {		
			// Protect user's password. The generated value can be stored in DB.
	        String mySecurePassword = passwordEncoder.encode(vendor.getPassword());
	        
	        // Print out protected password 
	        System.out.println("My secure password = " + mySecurePassword);
	        vendor.setPassword(mySecurePassword);
			userDetailsDao.createVendor(vendor);
		} else {
			//TODO vendor already exists
		}
	}
	
	/**
	 * Method to fetch Item details based on Item Id
	 * @param vendor
	 * @return Item
	 */
	public Vendor validateVendorDetails(Vendor vendor) {
	  
		//call the dao for fetching the item details 
		Vendor vendorDetails = userDetailsDao.retrieveVendorDetails(vendor);
		
		if(vendorDetails != null) {
			
	        // Encrypted and Base64 encoded password read from database
	        boolean passwordMatch = true;//PasswordUtils.verifyUserPassword(vendor.getPassword(), vendorDetails.getPassword());
	        
	        if(passwordMatch && vendorDetails.getWrongPasswordCount() <= 4) {
	        	/*if(!StringUtils.isEmpty(vendorDetails.getAuthId())) {
	        		 System.out.println("User already logged in another browser. "+vendor.getEmailId());
	        		 vendorDetails.set_id(null);
	        		 return vendorDetails;
	        	}*/
	            System.out.println("Provided Vendor password is correct. "+vendor.getEmailId());
	            String token = UUID.randomUUID().toString();
	            vendorDetails.setAuthId(token);
	            userDetailsDao.updateVendorAuthId(vendorDetails);
	            return vendorDetails; 
	        } else {
	        	System.out.println("Provided Vendor password is incorrect." +vendor.getEmailId());
	            if(vendorDetails.getWrongPasswordCount() <= 4 ) {
	            	userDetailsDao.incrementWrongPasswordCount(vendorDetails);
	            } else {
	            	vendorDetails = new Vendor();
	            	vendorDetails.setWrongPasswordCount(5);
	            	return vendorDetails;
	            }
	           
	        }
		}
		 return null;
	}
	
	public User retrieveVendorDetails(User user) {
		User userDetails = userDetailsDao.retrieveUserDetails(user);
		
		return userDetails;
	}
	
	public Vendor retrieveVendor(String vendorId) {
		Vendor vendorDetails = userDetailsDao.retrieveVendor(vendorId);
		
		return vendorDetails;
	}
	
	/**
	 * Method to update user password
	 * @param user
	 */
	public boolean updateUserPassword(User user) {
		return userDetailsDao.updateUserPassword(user);
	}
	
	/**
	 * Method to update user password
	 * @param vendor
	 */
	public boolean updateVendorPassword(Vendor vendor) {
		return userDetailsDao.updateVendorPassword(vendor);
	}
	
	public boolean forgotPassword(String mailId, String type) {
		if(!StringUtils.isEmpty(mailId)) {
		
			String randomPassword = randomPasswordGenerator.generatePassayPassword();
			// Protect user's password. The generated value can be stored in DB.
	        String mySecurePassword = passwordEncoder.encode(randomPassword);
			boolean isUpdate = false;
	        
			if(type.equals("vendor")) {
				Vendor vendor = new Vendor();
				vendor.setEmailId(mailId);
				vendor.setPassword(mySecurePassword);
				vendor.setWrongPasswordCount(0);
				isUpdate = updateVendorPassword(vendor);
			} else {
				User user = new User();
				user.setEmailId(mailId);
				user.setPassword(mySecurePassword);
				user.setWrongPasswordCount(0);
				isUpdate = updateUserPassword(user);
			}
			if(isUpdate) {
				userPasswordMailProcessor.sendMail(mailId, randomPassword);
				return true;
			} 
			return false;
		} else {
			return false;
		}
	}
	
	public void signoutAndClearNotification(String vendorId) {
		Vendor vendor = new Vendor();
		vendor.set_id(vendorId);
		userDetailsDao.updateVendorAuthId(vendor);
		userDetailsDao.clearNotification(vendorId);
	 }
	
	public void userSignout(String userId) {
		User user = new User();
		user.set_id(userId);
		userDetailsDao.updateUserAuthId(user);
	}

	public void deleteAllUsers() {
		userDetailsDao.deleteAllUsers();
	}

}
