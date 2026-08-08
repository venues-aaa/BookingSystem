package com.hallbooking.dao.impl;

import com.hallbooking.dao.UserDao;
import com.hallbooking.model.Notification;
import com.hallbooking.model.OtpRequest;
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
import org.apache.commons.lang3.StringUtils;

import java.util.List;
import java.util.Date;
import java.util.Random;
import org.bson.Document;

@Component
public class UserDaoImpl implements UserDao {

	@Autowired
	MongoTemplate mongoTemplate;

	private static final long OTP_EXPIRE_MS = 5 * 60 * 1000;
	
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
		return user.getId();
	}

	@Override
	public boolean updateUser(User user) {
		Query query = new Query(Criteria.where("id").is(user.getId()));
		Document userDocument = new Document();
		mongoTemplate.getConverter().write(user, userDocument);

		userDocument.remove("_id");
		userDocument.remove("_class");
		Update update = Update.fromDocument(userDocument);

		UpdateResult result = mongoTemplate.updateFirst(query, update, User.class);

		return result.getModifiedCount() > 0;
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
		query.addCriteria(Criteria.where(DBConstants.USER_ID).is(user.getId()));
		
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

	@Override
    public boolean validateOtp(String accountId, String inputOtp) {
        if (StringUtils.isBlank(accountId) || StringUtils.isBlank(inputOtp)) {
            return false;
        }

        // 1. Query OTP by accountId using MongoTemplate
        Query query = new Query(Criteria.where("accountId").is(accountId));
        OtpRequest otpRequest = mongoTemplate.findOne(query, OtpRequest.class);

        if (otpRequest == null || StringUtils.isBlank(otpRequest.getOtp())) {
            return false; // No OTP generated for this account
        }

        // 2. Check if OTP has expired (created more than 5 mins ago)
        long currentTime = new Date().getTime();
        long otpCreatedTime = otpRequest.getCreatedAt().getTime();

        if ((currentTime - otpCreatedTime) > OTP_EXPIRE_MS) {
            // Optional: Remove expired OTP document
            mongoTemplate.remove(query, OtpRequest.class);
            return false; // OTP Expired
        }

        // 3. Verify matching OTP
        boolean isValid = otpRequest.getOtp().equals(inputOtp);

        // 4. Clean up OTP after successful validation (one-time use)
        if (isValid) {
            mongoTemplate.remove(query, OtpRequest.class);
        }

        return isValid;
    }
	 
	@Override
	public boolean generateAndSendOtp(String accountId, String destination) {
        try {
            String otp = String.format("%06d", new Random().nextInt(900000) + 100000);
			
			Query query = new Query(Criteria.where("accountId").is(accountId));

            // 3. Prepare update using MongoTemplate
            Update update = new Update()
                    .set("destination", destination)
                    .set("otp", otp)
                    .set("createdAt", new Date());

            // 4. Save/Update in MongoDB (Upsert)
            mongoTemplate.upsert(query, update, OtpRequest.class);

            // 5. Simulate sending SMS/Email (Replace with Twilio / JavaMailSender)
            System.out.println("========================================");
            System.out.println("Sending OTP [" + otp + "] to: " + destination);
            System.out.println("========================================");

            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
