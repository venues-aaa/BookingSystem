package com.hallbooking.controller;


import com.hallbooking.model.User;
import com.hallbooking.model.Vendor;
import com.hallbooking.service.UserDetailsProcessor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
//@CrossOrigin(origins="http://localhost:8081", maxAge=3600)
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/api/user")
public class UserService {

	public static final Logger logger = LoggerFactory.getLogger(UserService.class);
	
	@Autowired
	private UserDetailsProcessor userDetailsProcessor;

	//@RequestMapping(value = "/",  method = {RequestMethod.GET})
	@GetMapping(value = "/")
	public ResponseEntity<String> heartbeat() {
		System.out.println("Inside heartbeat - UserService");

		//return "Success - UserService";
		return ResponseEntity.status(HttpStatus.ACCEPTED).body("Success - UserService");
	}
	@PostMapping(value = "/validate", consumes = "application/json", produces = "application/json")
	//@RequestMapping(value ="/validate", consumes= {"application/json"}, produces= {"application/json"}, method = {RequestMethod.POST})
    @ResponseBody
	public ResponseEntity<User> validateUser(@RequestBody User userObj) {
    	
    	User userDetails = userDetailsProcessor.validateUserDetails(userObj);
      //  return userDetails;
		return ResponseEntity.status(HttpStatus.CREATED).body(userDetails);
    }

	@PostMapping(value = "/retrieve", consumes = "application/json", produces = "application/json")
	//@RequestMapping(value = "/retrieve", consumes= {"application/json"}, produces= {"application/json"}, method = {RequestMethod.POST})
	public ResponseEntity<User> retrieveUserDetails(@RequestBody User user) {
    	
		User userDetails = userDetailsProcessor.retrieveUserDetails(user);
		//return userDetails;
		return ResponseEntity.status(HttpStatus.ACCEPTED).body(userDetails);
    }

	@GetMapping(value = "/retrieveAll", produces = "application/json")
	//@RequestMapping(value = "/retrieveAll", produces= {"application/json"}, method = {RequestMethod.GET})
	@ResponseBody
	public ResponseEntity<List<User>> retrieveAllUsers() {

		List<User> userList = userDetailsProcessor.retrieveAllUsers();
		//return userList;
		return ResponseEntity.status(HttpStatus.ACCEPTED).body(userList);
	}

	@GetMapping(value = "/profile/{userId}", consumes = "application/json", produces = "application/json")
	//@RequestMapping(value = "/profile/{userId}", consumes= {"application/json"}, produces= {"application/json"}, method = {RequestMethod.GET})
	@ResponseBody
	public ResponseEntity<User> retrieveUser(@PathVariable String userId) {
    	
		User userDetails = userDetailsProcessor.retrieveUser(userId);
		//return userDetails;
		return ResponseEntity.status(HttpStatus.ACCEPTED).body(userDetails);
    }

	/*@PostMapping(value = "/create", consumes = "application/json")
	//@RequestMapping(value ="/create", consumes= {"application/json"}, method = {RequestMethod.POST})
    public void createUser(@RequestBody User user) {

		userDetailsProcessor.createUser(user);
	}*/
	
	@RequestMapping(value ="/update", consumes= {"application/json"}, method = {RequestMethod.PUT})
    public void updateUserDetails(@RequestBody User user) {
		
	}
	
	@RequestMapping(value ="/update/status", consumes= {"application/json"}, method = {RequestMethod.PUT})
    public void updateUserStatus(@RequestBody User user) {
	
	}
	
	@RequestMapping(value = "/forgotPassword", consumes= {"application/json"}, produces= {"application/json"}, method = {RequestMethod.POST})
	@ResponseBody
	public boolean forgotPassword(@RequestBody User user) {
     	
		boolean isMsgSend = userDetailsProcessor.forgotPassword(user.getEmailId(), "Customer");
		return isMsgSend;
    }

	//----------------vendor------------
	
	@RequestMapping(value ="/create/vendor", consumes= {"application/json"}, method = {RequestMethod.POST})
	@ResponseBody
    public Vendor createVendor(@RequestBody Vendor vendor) {
		userDetailsProcessor.createVendor(vendor);
		return vendor;
	}
	
	@RequestMapping(value ="/validate/vendor", consumes= {"application/json"}, produces= {"application/json"}, method = {RequestMethod.POST})
    @ResponseBody
	public Vendor validateVendor(@RequestBody Vendor vendorObj) {
    	
    	Vendor vendorDetails = userDetailsProcessor.validateVendorDetails(vendorObj);
        return vendorDetails;
    }
	
	@RequestMapping(value = "/vendorProfile/{vendorId}", consumes= {"application/json"}, produces= {"application/json"}, method = {RequestMethod.GET})
	@ResponseBody
	public Vendor retrieveVendor(@PathVariable String vendorId) {
    	
		Vendor vendorDetails = userDetailsProcessor.retrieveVendor(vendorId);
		return vendorDetails;
    }
	
	@RequestMapping(value = "/forgotPassword/vendor", consumes= {"application/json"}, produces= {"application/json"}, method = {RequestMethod.POST})
	@ResponseBody
	public boolean forgotPasswordVendor(@RequestBody Vendor vendor) {
     	
		boolean isMsgSend = userDetailsProcessor.forgotPassword(vendor.getEmailId(), "vendor");
		return isMsgSend;
    }
	
	@RequestMapping(value = "/signout/vendor", produces= {"application/json"},consumes=MediaType.APPLICATION_JSON_VALUE, method = RequestMethod.POST)
    @ResponseBody
    public void signoutAndClearNotification(@RequestBody String vendorId) {
		userDetailsProcessor.signoutAndClearNotification(vendorId);
    }
    
	@RequestMapping(value = "/signout", produces= {"application/json"},consumes=MediaType.APPLICATION_JSON_VALUE, method = RequestMethod.POST)
    @ResponseBody
    public void userSignout(@RequestBody String userId) {
		userDetailsProcessor.userSignout(userId);
    }

	/**
	 * To Remove all user details including vendors
	 */
	@DeleteMapping(value = "/deleteAllUsers")
	public void deleteAllUsers() {
	//	userDetailsProcessor.deleteAllUsers();
	}

}
