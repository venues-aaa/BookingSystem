/*
package com.hallbooking.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.hallbooking.dao.UserDetailsDao;
import com.hallbooking.dao.impl.BookingRepositoryImpl;
import com.hallbooking.model.*;
import com.hallbooking.utility.BookingInvoice_1;
import com.itextpdf.text.DocumentException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.text.ParseException;
import java.util.Date;
import java.util.List;

@Component
public class BookingProcessor {

	@Autowired
	private BookingRepositoryImpl bookingDao;
	@Autowired
	private BookingMailProcessor mailProcessor;
	@Autowired
	private BookingInvoice_1 bookingInvoice;
	@Autowired
	private UserDetailsDao userDetailsDao;
	@Autowired
	private ItemProcessor itemProcessor;
	
	
	*/
/**
	 * Method to fetch availability based on the parameter passed
	 * @param String - itemId
	 * @param String - fromDate
	 * @param String - toDate
	 * @return
	 *//*

	public List<Booking> fetchAvailabilityBasedOn(Booking bookingObj) {
		return bookingDao.fetchAvailabilityBasedOn(bookingObj);
	}
	
	public boolean confirmItemAvailability(Booking bookingObj) throws Exception {
		
		if(bookingObj != null && bookingObj.getBookingFromDate() != null && bookingObj.getBookingToDate() != null) {
			if(bookingObj.getBookingFromDate().after(bookingObj.getBookingToDate())) {
				throw new Exception("From date cannot be greater than To Date");
			}
		} else {
			throw new Exception("From Date or To Date cannot be null or empty");
		}
		return bookingDao.confirmItemAvailability(bookingObj);
	}
	
	*/
/**
	 * Method to create booking.
	 * @param Booking
	 * @return String
	 * @throws DocumentException 
	 * @throws FileNotFoundException
	 *
	 * Implemented
	 *//*

	public String createBooking(Booking bookingObj) throws FileNotFoundException, DocumentException {
		
		bookingObj.setCreatedBy(bookingObj.getUserId());
		bookingObj.setCreatedOn(new Date());
		bookingObj.setStatus("Confirmed");
		bookingObj.getDetails().setQtyAvailable(bookingObj.getDetails().getQtyAvailable() - 1);
		String responseMsg;
		User user = bookingObj.getDetails().getUserDetails();
		if(!StringUtils.isEmpty(bookingObj.getDetails().getBookedThrough()) && bookingObj.getDetails().getBookedThrough().equals("Direct")) {
			String userId = userDetailsDao.createUser(bookingObj.getDetails().getUserDetails());
			bookingObj.getDetails().setUserDetails(null);
			bookingObj.setUserId(userId);
		} else {
			boolean validateAuth = userDetailsDao.validateUserAuthId(bookingObj.getDetails().getUserDetails());
			if(!validateAuth) {
				responseMsg = "Authentication failed!!";
				return responseMsg;
			}
		}
		
		responseMsg = bookingDao.createBooking(bookingObj);
		try {
			Item item = itemProcessor.retrieveItemDetails(bookingObj.getItemId());
			Invoice invoice = transformData(user, item, bookingObj);
			//bookingInvoice.generateBookingInvoice(invoice);
			
		//	generateInvoice.geneateInvoice(invoice);
			mailProcessor.sendMail("ajithraj.in@gmail.com", "");
		} catch (Exception e) {
			e.printStackTrace();
			System.out.println("Exception while generating Invoice");
		}
		return responseMsg;
	}
	
	private Invoice transformData(User user, Item item, Booking bookingObj) {
		Invoice invoice = new Invoice();
		invoice.setUser(user);
		invoice.setBookingObj(bookingObj);
		invoice.setItemDetails(item);
		
		return invoice;
	}
	
	public void generateInvoice(String bookedId) throws IOException, DocumentException {
		
		Booking bookingObj = retrieveBookedDetailsBasedOn(bookedId);
		User user = bookingObj.getDetails().getUserDetails();
		Item item = itemProcessor.retrieveItemDetails(bookingObj.getItemId());
		Invoice invoice = transformData(user, item, bookingObj);
		bookingInvoice.generateBookingInvoice();
	}
	
	*/
/**
	 * Method to block availability.
	 * @param Booking
	 * @return String
	 * @throws DocumentException 
	 * @throws FileNotFoundException 
	 *//*

	public String blockBooking(Booking bookingObj) throws FileNotFoundException, DocumentException {
		  
		bookingObj.setCreatedBy(bookingObj.getUserId());
		bookingObj.setCreatedOn(new Date());
		bookingObj.setStatus("Blocked");
		bookingObj.getDetails().setQtyAvailable(bookingObj.getDetails().getQtyAvailable() - 1);
		String responseMsg;
		if(!StringUtils.isEmpty(bookingObj.getDetails().getBookedThrough()) && bookingObj.getDetails().getBookedThrough().equals("Direct")) {
			String userId = userDetailsDao.createUser(bookingObj.getDetails().getUserDetails());
			bookingObj.getDetails().setUserDetails(null);
			bookingObj.setUserId(userId);
		} else {
			boolean validateAuth = userDetailsDao.validateUserAuthId(bookingObj.getDetails().getUserDetails());
			if(!validateAuth) {
				responseMsg = "Authentication failed!!";
				return responseMsg;
			}
		}
		
		responseMsg = bookingDao.createBooking(bookingObj);
	*/
/*	try {
			bookingInvoice.generateBookingInvoice();
			mailProcessor.sendMail("", "");
		} catch (Exception e) {
			System.out.println("Exception while generating Invoice");
		}*//*

		return responseMsg;
	}
	
	*/
/**
	 * Method to cancel booking details - Limited to insert a whole month.
	 * @param AvailabilityDetails
	 * @return
	 * @throws DocumentException 
	 * @throws FileNotFoundException 
	 * @throws JsonProcessingException
	 * @throws ParseException 
	 *//*

	public String cancelBooking(Booking bookingObj) throws FileNotFoundException, DocumentException {
		
		bookingObj.setLastUpdateUserId(bookingObj.getUserId());
		bookingObj.setLastUpdateDate(new Date());
		bookingObj.setStatus("Cancel");
		BookingDetails details = new BookingDetails();
		details.setQtyAvailable(*/
/*bookingObj.getDetails().getQtyAvailable() + *//*
1);
		bookingObj.setDetails(details);
	
		Vendor vendor = new Vendor();
		vendor.set_id(bookingObj.getVendorId());
		vendor.setAuthId(bookingObj.getAuthId());
		boolean validateAuth = userDetailsDao.validateVendorAuthId(vendor);
		String responseMsg;
		if(!validateAuth) {
			responseMsg = "Authentication failed!!";
			return responseMsg;
		}
		bookingObj.setAuthId(null);
		responseMsg = bookingDao.cancelBooking(bookingObj);
		try {
	//		bookingInvoice.generateInvoice(bookingObj);
			mailProcessor.sendMail("", "");
		} catch (Exception e) {
			System.out.println("Exception while generating Invoice");
		}
		return responseMsg;
	}
	
	public void updateBooking(Booking bookingObj) throws JsonProcessingException {
		bookingDao.updateBookingDetails(bookingObj);
	}
	
	 public List<Booking> retrieveVendorBookedDetails(String vendorId) {
		return bookingDao.retrieveVendorBookedDetails(vendorId);
	 }
	 
	 public List<Booking> retrieveUserBookedDetails(String userId) {
		 return bookingDao.retrieveUserBookedDetails(userId);
	 }
	 
	 public Booking retrieveBookedDetailsBasedOn(String bookedId) {
		 return bookingDao.retrieveBookedDetailsBasedOn(bookedId);
	 }
	 
	 public int getNotificationCountForVendor(String vendorId) {
		 int notificationCount = bookingDao.getNotificationCountForVendor(vendorId);
		 return notificationCount;
	 }
	 
	 public List<Notification> getNotificationForVendor(String vendorId) {
		 return bookingDao.getNotificationForVendor(vendorId);
	 }
	 
	
}
*/
