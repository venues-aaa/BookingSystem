package com.hallbooking.dao;

import com.hallbooking.model.Booking;
import com.hallbooking.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BookingDao {

	public Booking createBooking(Booking bookingObj) throws Exception;
	
	public void updateBookingDetails(Booking bookingObj);
	
	public List<Booking> fetchAvailabilityBasedOn(Booking bookingObj);
	
	public boolean confirmItemAvailability(Booking bookingObj);

	int getNotificationCountForVendor(String vendorId);

	Page<Booking> retrieveUserBookedDetails(String userId, String status, Pageable pagable);

	Booking retrieveBookedDetailsBasedOn(String bookedId);

	List<Booking> retrieveVendorBookedDetails(String vendorId);

	List<Notification> getNotificationForVendor(String vendorId);

	boolean hasUserBookedItem(String userId, String itemId);
	
}
