package com.hallbooking.controller;


import com.hallbooking.model.User;
import com.hallbooking.model.Vendor;
import com.hallbooking.service.UserDetailsProcessor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
//@CrossOrigin(origins="http://localhost:8081", maxAge=3600)
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/api/user")
public class UserController {

	public static final Logger logger = LoggerFactory.getLogger(UserController.class);
	
	@Autowired
	private UserDetailsProcessor userDetailsProcessor;

	@GetMapping(value = "/")
	@ResponseBody
	public ResponseEntity<String> heartbeat() {
		System.out.println("Inside heartbeat - UserService");

		return ResponseEntity.status(HttpStatus.ACCEPTED).body("Success - UserService");
	}

	@PostMapping("/validate")
    @ResponseBody
	public ResponseEntity<User> validateUser(@RequestBody User userObj) {
    	
    	User userDetails = userDetailsProcessor.validateUserDetails(userObj);
    	return ResponseEntity.status(HttpStatus.CREATED).body(userDetails);
    }

	@PostMapping("/retrieve")
	@ResponseBody
	public ResponseEntity<User> retrieveUserDetails(@RequestBody User user) {
    	
		User userDetails = userDetailsProcessor.retrieveUserDetails(user);
		return ResponseEntity.status(HttpStatus.ACCEPTED).body(userDetails);
    }

	@GetMapping(value = "/retrieveAll")
	@ResponseBody
	public ResponseEntity<List<User>> retrieveAllUsers() {

		List<User> userList = userDetailsProcessor.retrieveAllUsers();
		return ResponseEntity.status(HttpStatus.ACCEPTED).body(userList);
	}

	@GetMapping("/profile/{userId}")
	@ResponseBody
	public ResponseEntity<User> retrieveUser(@PathVariable String userId) {
    	
		User userDetails = userDetailsProcessor.retrieveUser(userId);
		return ResponseEntity.status(HttpStatus.ACCEPTED).body(userDetails);
    }

	@PostMapping("/create")
	@ResponseBody
	public void createUser(@RequestBody User user) {
		userDetailsProcessor.createUser(user);
	}
	
	@PutMapping("/update")
	@ResponseBody
    public void updateUserDetails(@RequestBody User user) {
		
	}
	
	@PutMapping("/update/status")
	@ResponseBody
    public void updateUserStatus(@RequestBody User user) {
	
	}
	
	@PostMapping("/forgotPassword")
	@ResponseBody
	public boolean forgotPassword(@RequestBody User user) {
     	
		boolean isMsgSend = userDetailsProcessor.forgotPassword(user.getEmailId(), "Customer");
		return isMsgSend;
    }

	//----------------vendor------------
	
	@PostMapping("/create/vendor")
	@ResponseBody
    public Vendor createVendor(@RequestBody Vendor vendor) {
		userDetailsProcessor.createVendor(vendor);
		return vendor;
	}
	
	@PostMapping("/validate/vendor")
	@ResponseBody
	public Vendor validateVendor(@RequestBody Vendor vendorObj) {
    	
    	Vendor vendorDetails = userDetailsProcessor.validateVendorDetails(vendorObj);
        return vendorDetails;
    }
	
	@GetMapping("/vendorProfile/{vendorId}")
	@ResponseBody
	public Vendor retrieveVendor(@PathVariable String vendorId) {
    	
		Vendor vendorDetails = userDetailsProcessor.retrieveVendor(vendorId);
		return vendorDetails;
    }
	
	@PostMapping("/forgotPassword/vendor")
	@ResponseBody
	public boolean forgotPasswordVendor(@RequestBody Vendor vendor) {
     	
		boolean isMsgSend = userDetailsProcessor.forgotPassword(vendor.getEmailId(), "vendor");
		return isMsgSend;
    }
	
	@PostMapping("/signout/vendor")
	@ResponseBody
    public void signoutAndClearNotification(@RequestBody String vendorId) {
		userDetailsProcessor.signoutAndClearNotification(vendorId);
    }
    
	@PostMapping("/signout")
	@ResponseBody
    public void userSignout(@RequestBody String userId) {
		userDetailsProcessor.userSignout(userId);
    }

	/**
	 * To Remove all user details including vendors
	 */
	@DeleteMapping(value = "/deleteAllUsers")
	@ResponseBody
	public void deleteAllUsers() {
	//	userDetailsProcessor.deleteAllUsers();
	}

	public void updateUserStatus() {

	}

}
