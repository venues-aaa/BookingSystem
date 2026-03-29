package com.hallbooking.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.hallbooking.dao.impl.ClickRepositoryImpl;
import com.hallbooking.model.Booking;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

@Component
public class AvailabilityProcessor {

	@Autowired
	private ClickRepositoryImpl availabilityDao;
	
	/**
	 * Method to fetch availability based on the parameter passed
	 * @param String - itemId
	 * @param String - fromDate
	 * @param String - toDate
	 * @return
	 */
	public List<Booking> fetchAvailabilityBasedOn(Booking bookingObj){
		
		//call the dao for fetching the non-availability details
		return  null;//availabilityDao.fetchAvailability(availabilityDetails);
	}
	
	/**
	 * Method to insert availability details - Limited to insert a whole month.
	 * @param AvailabilityDetails
	 * @return
	 * @throws JsonProcessingException
	 * @throws ParseException 
	 */
	public Booking createBooking(Booking bookingObj) throws JsonProcessingException, ParseException{
		
		/*
		 * String[] dateSplitted = Helper.splitDate(availabilityDetails.getFromDate());
		 * int year = Integer.valueOf(dateSplitted[2]); int month =
		 * Integer.valueOf(dateSplitted[0]); Set<Integer> availableDays =
		 * Helper.getDaysInaMonth(year, month);
		 * 
		 * List<MonthDay> monthDayList = new ArrayList<MonthDay>(); MonthDay
		 * monthDayDetails = new MonthDay(); monthDayDetails.setMonth(month);
		 * monthDayDetails.setDays(availableDays);
		 * 
		 * monthDayList.add(monthDayDetails); AvailDates availDates = new AvailDates();
		 * availDates.setYear(year); availDates.setMonthDays(monthDayList);
		 * 
		 * List<AvailDates> availDatesList = new ArrayList<AvailDates>();
		 * availDatesList.add(availDates);
		 * 
		 * availabilityDetails.setAvailDates(availDatesList);
		 * 
		 * DateFormat formatter = new SimpleDateFormat("dd-MMM-yyyy"); String dateNow =
		 * formatter.format(new Date());
		 * availabilityDetails.setLastUpdatedDate(dateNow);
		 * 
		 * //availabilityDao.saveOrUpdateAvailability(availabilityDetails);
		 * 
		 * return availabilityDetails;
		 */
		
		return null;
	}
	
	public void updateBooking(Booking bookingObj) throws JsonProcessingException {
		
		DateFormat formatter = new SimpleDateFormat("dd-MMM-yyyy");
		String dateNow = formatter.format(new Date());
	//	availabilityDetails.setLastUpdatedDate(dateNow);
		
	//	availabilityDao.saveOrUpdateAvailability(availabilityDetails);
	}
	
	
	
	
}
