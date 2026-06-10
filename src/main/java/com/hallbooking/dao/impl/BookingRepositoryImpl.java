package com.hallbooking.dao.impl;

import com.hallbooking.dao.BookingDao;
import com.hallbooking.model.Booking;
import com.hallbooking.model.Item;
import com.hallbooking.model.Notification;
import com.hallbooking.utility.DBConstants;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import java.util.List;

@Component
public class BookingRepositoryImpl implements BookingDao {

	@Autowired
	MongoTemplate mongoTemplate;
	
	/**
	 * Method to fetch the items availability based on type, date and place
	 */
	//DFDate - Db FromDate, DTDate - Db ToDate, RFDate- Requested FromDate, RTD- Requested ToDate
	//(DFDate > RFDate && DFDate > RTDate) OR (DTDate < RFDate && DTDate < RTDate)
	public List<Booking> fetchAvailabilityBasedOn(Booking bookingObj) {
		Query query = new Query();
		Criteria x = Criteria.where(
				DBConstants.BOOKING_ITEM_TYPE).in(bookingObj.getDetails().getType())
				.and(DBConstants.BOOKING_PLACE_ID).is(bookingObj.getDetails().getPlace());
		
		Criteria y = new Criteria().andOperator(Criteria.where(DBConstants.BOOKING_FROM_DATE).gt(bookingObj.getBookingFromDate()),
		        Criteria.where(DBConstants.BOOKING_FROM_DATE).gt(bookingObj.getBookingToDate()));
		
		Criteria z = new Criteria().andOperator(Criteria.where(DBConstants.BOOKING_TO_DATE).lt(bookingObj.getBookingFromDate()),
		        Criteria.where(DBConstants.BOOKING_TO_DATE).lt(bookingObj.getBookingToDate()));
		
		Criteria a = x.orOperator(y,z);
		
		query.addCriteria(a);
		
		List<Booking> bookingObjList = mongoTemplate.find(query, Booking.class);

		return bookingObjList ;
	}

	public Booking getBookingById(String bookingId) throws Exception {
		Query query = new Query();
		Criteria w = Criteria.where(DBConstants.BOOKING_ID).is(bookingId);

		query.addCriteria(w);

		Booking bookingObj = mongoTemplate.findOne(query, Booking.class);
		if(null == bookingObj) {
			throw new Exception("Booking not found");
		}
		return bookingObj;
	}
	/**
	 * Method to confirm availability based on itemId and date
	 * Now supports concurrent bookings - checks maxConcurrentBookings from Item
	 */
	//DFDate - Db FromDate, DTDate - Db ToDate, RFDate- Requested FromDate, RTD- Requested ToDate
	//(DFDate >= RFDate && DTDate <= RTDate) OR (DFDate <= RFDate && DTDate >= RFDate) OR (DFDate <= RTDate && DTDate >= RTDate)
	public boolean confirmItemAvailability(Booking bookingObj) {
		System.out.println("=== AVAILABILITY CHECK DEBUG ===");
		System.out.println("Requested ItemId: " + bookingObj.getItemId());
		System.out.println("Requested From: " + bookingObj.getBookingFromDate());
		System.out.println("Requested To: " + bookingObj.getBookingToDate());

		// Fetch the item to check maxConcurrentBookings
		Query itemQuery = new Query(Criteria.where("id").is(bookingObj.getItemId()));
		Item item = mongoTemplate.findOne(itemQuery, Item.class);

		Integer maxConcurrent = (item != null && item.getMaxConcurrentBookings() != null)
			? item.getMaxConcurrentBookings()
			: 1;

		System.out.println("Max Concurrent Bookings Allowed: " + maxConcurrent);

		Query query = new Query();

		// Item must match
		Criteria itemCriteria = Criteria.where(DBConstants.BOOKING_ITEM_ID).is(bookingObj.getItemId());

		// Status must be CONFIRMED or BLOCKED (both block the slot)
		Criteria statusCriteria = Criteria.where(DBConstants.BOOKING_STATUS).in("CONFIRMED", "BLOCKED");

		// Overlap conditions - same logic as blocked dates
		// 1. Existing booking falls completely within requested range
		Criteria overlap1 = new Criteria().andOperator(
			Criteria.where(DBConstants.BOOKING_FROM_DATE).gte(bookingObj.getBookingFromDate()),
			Criteria.where(DBConstants.BOOKING_TO_DATE).lte(bookingObj.getBookingToDate())
		);

		// 2. Existing booking starts before requested range but ends within it
		Criteria overlap2 = new Criteria().andOperator(
			Criteria.where(DBConstants.BOOKING_FROM_DATE).lte(bookingObj.getBookingFromDate()),
			Criteria.where(DBConstants.BOOKING_TO_DATE).gte(bookingObj.getBookingFromDate())
		);

		// 3. Existing booking starts within requested range but ends after it
		Criteria overlap3 = new Criteria().andOperator(
			Criteria.where(DBConstants.BOOKING_FROM_DATE).lte(bookingObj.getBookingToDate()),
			Criteria.where(DBConstants.BOOKING_TO_DATE).gte(bookingObj.getBookingToDate())
		);

		// Combine: must match itemId AND status AND at least one overlap condition
		Criteria overlapCriteria = new Criteria().orOperator(overlap1, overlap2, overlap3);
		Criteria a = new Criteria().andOperator(itemCriteria, statusCriteria, overlapCriteria);
		query.addCriteria(a);

		System.out.println("Query: " + query.toString());

		List<Booking> bookingObjList = mongoTemplate.find(query, Booking.class);
		int overlappingCount = (bookingObjList != null) ? bookingObjList.size() : 0;

		System.out.println("Found overlapping bookings: " + overlappingCount);
		if(bookingObjList != null && !bookingObjList.isEmpty()) {
			for(Booking b : bookingObjList) {
				System.out.println("  - Booking ID: " + b.getId() + ", From: " + b.getBookingFromDate() + ", To: " + b.getBookingToDate() + ", Status: " + b.getStatus());
			}
		}

		// Check against concurrent booking limit
		if (maxConcurrent == 1) {
			// Exclusive booking - only 1 allowed, so no overlaps allowed
			boolean isAvailable = overlappingCount == 0;
			System.out.println("Exclusive Booking Mode (max: 1) - Result: " + (isAvailable ? "AVAILABLE" : "NOT AVAILABLE"));
			System.out.println("================================");
			return isAvailable;
		} else {
			// Multiple concurrent bookings allowed - check if limit is reached
			boolean isAvailable = overlappingCount < maxConcurrent;
			System.out.println("Concurrent Booking Mode (limit: " + maxConcurrent + ") - Current: " + overlappingCount + " - Result: " + (isAvailable ? "AVAILABLE" : "NOT AVAILABLE (limit reached)"));
			System.out.println("================================");
			return isAvailable;
		}
	}
	
	/**
	 * Method to Create a Booking
	 * @param bookingObj
	 * @return String
	 */
	public Booking createBooking(Booking bookingObj) throws Exception{
		String responseMsg;
		try {
			if(confirmItemAvailability(bookingObj)) {
				bookingObj = mongoTemplate.save(bookingObj);
				Notification notificationObj = new Notification();
				notificationObj.setMessage("Booking done from "+ bookingObj.getBookingFromDate() +" to "+
						bookingObj.getBookingToDate() +" for "+ bookingObj.getItemName());
				notificationObj.setRead(false);
				notificationObj.setVendorId(bookingObj.getVendorId());
				mongoTemplate.save(notificationObj);
				responseMsg = "success";
			} else {
				responseMsg ="notAvailabile";
			}
		} catch(Exception e) {
			responseMsg = "Error";
			throw new Exception("Exception while saving a booking");
		}
		
		return bookingObj;
	}
	
	/**
	 * Method to Cancel a booking
	 * @param
	 * @return String
	 */
	public String cancelBooking(Booking bookingObj) {
		String responseMsg;
		try {
			Query updateQuery = new Query();
			updateQuery.addCriteria(Criteria.where(DBConstants.BOOKING_ID).is(new ObjectId(bookingObj.getId())));

			Update update = new Update();

			update.set(DBConstants.BOOKING_STATUS, bookingObj.getStatus());
			update.set(DBConstants.BOOKING_LASTUPDATED_DATE, bookingObj.getLastUpdateDate());
			update.set(DBConstants.BOOKING_LASTUPDATED_USER, bookingObj.getLastUpdateUserId());
			update.set(DBConstants.BOOKING_LASTUPDATED_USER, bookingObj.getLastUpdateUserId());
			update.set(DBConstants.BOOKING_QTY_AVAILABLE, bookingObj.getDetails().getQtyAvailable());
			
			mongoTemplate.updateFirst(updateQuery, update, Booking.class);
			responseMsg = "success";
		} catch(Exception e) {
			responseMsg = "Error";
			System.out.println("Exception while cancelling a booking");
		}
		
		return responseMsg;
	}
	
	@Override
	public void updateBookingDetails(Booking bookingObj) {
		// TODO Auto-generated method stub
		
	}
	@Override
	public List<Booking> retrieveVendorBookedDetails(String vendorId) {
		Query query = new Query();
		query = Query.query(
				Criteria.where(DBConstants.BOOKING_VENDOR_ID).is( vendorId));
		query.with(Sort.by(Sort.Direction.DESC, DBConstants.BOOKING_FROM_DATE));
			
		List<Booking> bookingList = mongoTemplate.find(query, Booking.class);
		 
		return bookingList;
	}
	
	@Override
	public Page<Booking> retrieveUserBookedDetails(String userId, String status, Pageable pageable) {
		Query query = new Query();

		// Build criteria - filter by userId only if provided (null means get all bookings for admin)
		Criteria criteria = null;

		if(userId != null && !userId.isEmpty()) {
			criteria = Criteria.where(DBConstants.BOOKING_USER_ID).is(userId);
		}

		// Add status filter if provided
		if(status != null && !status.isEmpty()) {
			if(criteria != null) {
				criteria = criteria.and(DBConstants.BOOKING_STATUS).is(status);
			} else {
				criteria = Criteria.where(DBConstants.BOOKING_STATUS).is(status);
			}
		}

		// Add criteria to query only if we have any filters
		if(criteria != null) {
			query.addCriteria(criteria);
		}

		query.with(Sort.by(Sort.Direction.DESC, DBConstants.BOOKING_FROM_DATE));
		query.with(pageable);

		List<Booking> bookingList = mongoTemplate.find(query, Booking.class);

		// Count total results for full pagination metadata
		long count = mongoTemplate.count(Query.of(query).skip(-1).limit(-1), Booking.class);

		return PageableExecutionUtils.getPage(bookingList, pageable, () -> count);
	}
	 
	 @Override
	 public Booking retrieveBookedDetailsBasedOn(String bookedId) {
		 Query query = new Query();
		 query = Query.query(
					Criteria.where(DBConstants.BOOKING_ID).is( bookedId));
				
		List<Booking> bookingList = mongoTemplate.find(query, Booking.class);
		return bookingList.get(0);
	 }
	 
	 //---------------------------Notification 
	 @Override
	 public int getNotificationCountForVendor(String vendorId) {
		 Query query = new Query();
		 query = Query.query(
					Criteria.where(DBConstants.NOTIFICATION_VENDOR_ID).is(vendorId).andOperator(
							Criteria.where(DBConstants.NOTIFICATION_IS_READ).is(false)));
				
		List<Notification> notificationList = mongoTemplate.find(query, Notification.class); 
		
		if(notificationList != null && !notificationList.isEmpty()) {
			return notificationList.size();
		} else {
			return 0;
		}
	 }
	 
	 @Override
	 public List<Notification> getNotificationForVendor(String vendorId) {
		 Query query = new Query();
		 query = Query.query(
					Criteria.where(DBConstants.NOTIFICATION_VENDOR_ID).is(vendorId));
				
		List<Notification> notificationList = mongoTemplate.find(query, Notification.class);
		
		Query updateQuery = new Query();
		updateQuery.addCriteria(Criteria.where(DBConstants.NOTIFICATION_VENDOR_ID).is(vendorId).andOperator(
				Criteria.where(DBConstants.NOTIFICATION_IS_READ).is(false)));

		Update update = new Update();
		update.set(DBConstants.NOTIFICATION_IS_READ, true);
		mongoTemplate.updateMulti(updateQuery, update, Notification.class);
		
		return notificationList;
	 }

	/**
	 * Get offline payment bookings pending vendor confirmation
	 */
	public List<Booking> getOfflineBookingsPendingConfirmation(String vendorId) {
		// First, get all items owned by this vendor
		Query itemQuery = new Query();
		itemQuery.addCriteria(Criteria.where("vendorId").is(vendorId));
		List<Item> vendorItems = mongoTemplate.find(itemQuery, Item.class);

		// Extract item IDs
		List<String> itemIds = new java.util.ArrayList<>();
		for (Item item : vendorItems) {
			if (item.getId() != null) {
				itemIds.add(item.getId());
			}
		}

		if (itemIds.isEmpty()) {
			return new java.util.ArrayList<>();
		}

		// Query bookings for those items with offline payment pending confirmation
		Query bookingQuery = new Query();
		bookingQuery.addCriteria(
			Criteria.where("itemId").in(itemIds)
				.and("paymentOption").is("PAY_OFFLINE")
				.and("vendorConfirmationStatus").is("PENDING")
		);
		bookingQuery.with(Sort.by(Sort.Direction.DESC, "createdOn"));

		return mongoTemplate.find(bookingQuery, Booking.class);
	}

}
