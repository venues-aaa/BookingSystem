package com.hallbooking.mapper;

import com.hallbooking.dto.request.CreateBookingRequest;
import com.hallbooking.model.Booking;
import com.hallbooking.model.BookingDetails;

import java.time.ZoneId;
import java.util.Date;

public class BookingMapper {

    public static Booking toBooking(CreateBookingRequest request, Booking booking) {
        if (request == null) {
            return null;
        }

        // Direct mappings
        booking.setItemId(request.getItemId());
        booking.setUserId(request.getUserId());
        booking.setStatus(request.getStatus() != null ? request.getStatus() : "Confirmed"); // Use provided status or default

        // Date conversions
        System.out.println("=== BOOKING MAPPER DEBUG ===");
        System.out.println("Request startDateTime: " + request.getStartDateTime());
        System.out.println("Request endDateTime: " + request.getEndDateTime());

        booking.setBookingFromDate(request.getStartDateTime());
        booking.setBookingToDate(request.getEndDateTime());

        System.out.println("Booking bookingFromDate set to: " + booking.getBookingFromDate());
        System.out.println("Booking bookingToDate set to: " + booking.getBookingToDate());
        System.out.println("===========================");

        // Metadata (optional defaults)
        booking.setCreatedOn(new Date());
        booking.setCreatedBy(request.getUserId());

        // Nested object mapping
        BookingDetails details = toBookingDetails(request);
        if (details == null) {
            details = new BookingDetails(); // Ensure details is never null
        }

        // If request contains additional details map, merge it with the details object
        if (request.getDetails() != null) {
            details.setAdditionalDetails(request.getDetails());
        }

        booking.setDetails(details);

        return booking;
    }

    private static BookingDetails toBookingDetails(CreateBookingRequest request) {
        BookingDetails details = new BookingDetails();

        // Direct mappings
        details.setAmtCollected(request.getAmtCollected());
        details.setTaxCollected(request.getTaxCollected());
        details.setFunctionType(request.getFunctionType());
        details.setNumberOfAttendees(
                request.getNumberOfAttendees() != null ? request.getNumberOfAttendees() : 0
        );

        return details;
    }

    private static Date toDate(java.time.LocalDateTime localDateTime) {
        return localDateTime == null ? null :
                Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant());
    }
}