package com.hallbooking.utility;

public class DBConstants {

	public static String ITEM_TYPE = "type";
	public static String ITEM_PLACE_ID = "placeId";
	public static String ITEM_ID = "_id";
	public static String ITEM_VENDOR_ID = "vendorId";
	public static String ITEM_DETAILS = "details";
	public static String ITEM_DETAILS_CONTACT_NUM = "details.contactNum";
	public static String ITEM_DETAILS_ADDRESS = "details.address";
	public static String ITEM_DETAILS_MAILID = "details.mailId";
	public static String ITEM_DETAILS_NAME = "details.name";
	public static String ITEM_DETAILS_AMOUNT = "details.amount";
	public static String ITEM_FILTER_SEATING_CAPCITY = "filter.seatingCapacity";
	public static String ITEM_FILTER_TEMP_CONTROL = "filter.tempControl";
	public static String ITEM_AMENITIES = "details.amenities";
	public static String ITEM_AMENITIES_AMENITY1 = "details.amenities.amenity1";
	public static String ITEM_AMENITIES_AMENITY2 = "details.amenities.amenity2";
	public static String ITEM_AMENITIES_AMENITY3 = "details.amenities.amenity3";
	public static String ITEM_AMENITIES_AMENITY4 = "details.amenities.amenity4";
	public static String ITEM_AMENITIES_AMENITY5 = "details.amenities.amenity5";
	public static String ITEM_AMENITIES_AMENITY6 = "details.amenities.amenity6";
	public static String ITEM_PRICE = "price";
	public static String ITEM_FILTER = "filter";
	public static String ITEM_REVIEWS = "reviews";
	public static String ITEM_LASTUPDATEDBY = "lastModifiedBy";
	public static String ITEM_LASTUPDATEDON = "lastModifiedOn";
	public static String ITEM_IMAGES = "images";
	//public static String ITEM_IMAGE_FILENAME = "images.$.fileName";
	
	//UserDetails
	public static String USER_ID = "_id";
	public static String USER_NAME = "name";
	public static String USER_PASSWORD = "password";
	public static String USER_EMAILID = "emailId";
	public static String AUTH_ID = "authId";
	
	//State
	public static String STATE_ID = "stateId";
	
	//City
	public static String CITY_ID = "cityId";
	
	//Place
	public static String PLACE_ID = "placeId";
		
	//Booking
	public static String BOOKING_ITEM_TYPE = "details.type";
	public static String BOOKING_PLACE_ID = "details.place";
	public static String BOOKING_QTY_AVAILABLE = "details.qtyAvailable";
	public static String BOOKING_ITEM_ID = "itemId";
	public static String BOOKING_FROM_DATE = "bookingFromDate";
	public static String BOOKING_TO_DATE = "bookingToDate";
	public static String BOOKING_VENDOR_ID = "vendorId";
	public static String BOOKING_USER_ID = "userId";
	public static String BOOKING_ID = "_id";
	public static String BOOKING_STATUS = "status";
	public static String BOOKING_LASTUPDATED_USER = "lastUpdateUserId";
	public static String BOOKING_LASTUPDATED_DATE = "lastUpdateDate";
	
	//Notification
	public static String NOTIFICATION_ID = "_id";
	public static String NOTIFICATION_VENDOR_ID = "vendorId";
	public static String NOTIFICATION_IS_READ = "isRead";
	
}
