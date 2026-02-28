package com.hallbooking.dao.impl;

import com.hallbooking.dao.UserDao;
import com.hallbooking.model.Notification;
import com.hallbooking.model.User;
import com.hallbooking.model.Vendor;
import com.hallbooking.utility.DBConstants;
import com.mongodb.client.result.UpdateResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class UserDaoImpl implements UserDao {

	@Autowired
	MongoTemplate mongoTemplate;
	
	@Override
	public User retrieveUserDetails(User user) {
		List<User> userDetailsList = mongoTemplate.find(Query.query(
				Criteria.where(DBConstants.USER_EMAILID).in(user.getEmailId())), User.class);
		if(userDetailsList.size() > 0)
			return userDetailsList.get(0);
		else
			return null;
	}

	@Override
	public List<User> retrieveAllUsers() {
		List<User> userDetailsList = mongoTemplate.findAll(User.class);
		if(userDetailsList.size() > 0)
			return userDetailsList;
		else
			return null;
	}
	
	@Override
	public String createUser(User user) {
		mongoTemplate.save(user);
		return user.get_id();
	}
	
	@Override
	public User retrieveUser(String userId) {
		List<User> userDetailsList = mongoTemplate.find(Query.query(
				Criteria.where(DBConstants.USER_ID).in(userId)), User.class);
		if(userDetailsList.size() > 0)
			return userDetailsList.get(0);
		else
			return null;
	}
	
	public void incrementWrongPasswordCount(User user) {
		Query query = new Query();
		query.addCriteria(Criteria.where(DBConstants.USER_ID).is(user.get_id()));
		
		Update update = new Update();
		update.set("wrongPasswordCount", user.getWrongPasswordCount() + 1);
		
		mongoTemplate.updateFirst(query, update, User.class);
	}
	
	public void updateUserAuthId(User user) {
		Query query = new Query();
		query.addCriteria(Criteria.where(DBConstants.USER_EMAILID).is(user.getEmailId()));
		
		Update update = new Update();
		update.set("authId", user.getAuthId());
		
		mongoTemplate.updateFirst(query, update, User.class);
	}
	
	public Boolean validateUserAuthId(User user) {
		 Query query = new Query();
		 query = Query.query(
					Criteria.where(DBConstants.USER_EMAILID).is(user.getEmailId()).andOperator(
							Criteria.where(DBConstants.AUTH_ID).is(user.getAuthId())));
		 
		List<User> userDetailsList = mongoTemplate.find(query, User.class);
		if(userDetailsList.size() > 0)
			return true;
		else
			return false;
	}
	
	///----------------Vendor
	
	public void createVendor(Vendor vendor) {
		mongoTemplate.save(vendor);
	}
	
	public Vendor retrieveVendorDetails(Vendor vendor) {
		List<Vendor> vendorDetailsList = mongoTemplate.find(Query.query(
				Criteria.where(DBConstants.USER_EMAILID).in(vendor.getEmailId())), Vendor.class);
		if(vendorDetailsList.size() > 0)
			return vendorDetailsList.get(0);
		else
			return null;
	}
	
	@Override
	public Vendor retrieveVendor(String vendorId) {
		List<Vendor> vendorDetailsList = mongoTemplate.find(Query.query(
				Criteria.where(DBConstants.USER_ID).in(vendorId)), Vendor.class);
		if(vendorDetailsList.size() > 0)
			return vendorDetailsList.get(0);
		else
			return null;
	}
	
	public void incrementWrongPasswordCount(Vendor vendor) {
		Query query = new Query();
		query.addCriteria(Criteria.where(DBConstants.USER_ID).is(vendor.get_id()));
		
		Update update = new Update();
		update.set("wrongPasswordCount", vendor.getWrongPasswordCount() + 1);
		
		mongoTemplate.updateFirst(query, update, Vendor.class);
	}
	
	public void updateVendorAuthId(Vendor vendor) {
		Query query = new Query();
		query.addCriteria(Criteria.where(DBConstants.USER_ID).is(vendor.get_id()));
		
		Update update = new Update();
		update.set("authId", vendor.getAuthId());
		update.set("wrongPasswordCount", 0);
		
		mongoTemplate.updateFirst(query, update, Vendor.class);
	}
	
	public Boolean validateVendorAuthId(Vendor vendor) {
		 Query query = new Query();
		 query = Query.query(
					Criteria.where(DBConstants.USER_ID).is(vendor.get_id()).andOperator(
							Criteria.where(DBConstants.AUTH_ID).is(vendor.getAuthId())));
		 
		List<Vendor> vendorDetailsList = mongoTemplate.find(query, Vendor.class);
		if(vendorDetailsList.size() > 0)
			return true;
		else
			return false;
	}
	
	
	//---------------
	
	public boolean updateUserPassword(User user) {
		
		Query query = new Query();
		query.addCriteria(Criteria.where(DBConstants.USER_EMAILID).is(user.getEmailId()));
		
		Update update = new Update();
		update.set("password", user.getPassword());
		update.set("wrongPasswordCount", user.getWrongPasswordCount());
		
		UpdateResult resultDetails = mongoTemplate.updateFirst(query, update, User.class);
		return resultDetails.wasAcknowledged();
	}
	
	public boolean updateVendorPassword(Vendor vendor) {
		
		Query query = new Query();
		query.addCriteria(Criteria.where(DBConstants.USER_EMAILID).is(vendor.getEmailId()));
		
		Update update = new Update();
		update.set("password", vendor.getPassword());
		update.set("wrongPasswordCount", vendor.getWrongPasswordCount());

		UpdateResult resultDetails = mongoTemplate.updateFirst(query, update, Vendor.class);
		return resultDetails.wasAcknowledged();
	}
	
	@Override
	public void clearNotification(String vendorId) {
		Query query = new Query();
		query.addCriteria(Criteria.where("vendorId").is(vendorId)
				 .andOperator(Criteria.where("isRead").is(true)));
		mongoTemplate.remove(query, Notification.class);
	}

	@Override
	public void deleteAllUsers() {
		Query query = new Query();
		mongoTemplate.remove(query, User.class);
		mongoTemplate.remove(query, Vendor.class);
	}
	 

}
