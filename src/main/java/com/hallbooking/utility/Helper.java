package com.hallbooking.utility;

import java.time.YearMonth;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.IntStream;

public class Helper {

	public static Set<Integer> getDaysInaMonth(int year, int month){
		Set<Integer> days = new HashSet<Integer>();
		
		YearMonth yearMonthObject = YearMonth.of(year, month);
		int daysInMonth = yearMonthObject.lengthOfMonth();
		
		IntStream.rangeClosed(1, daysInMonth).forEach(k -> 
			days.add(k)
		);
		
		return days;
	}
	
	public static String[] splitDate(String date) {
		String[] splitDates = date.split("/");
		
		return splitDates;
	}
	
}
