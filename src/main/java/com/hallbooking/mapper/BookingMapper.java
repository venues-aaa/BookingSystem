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
        booking.setStatus("Confirmed"); // Set default status

        // Date conversions
        booking.setBookingFromDate(request.getStartDateTime());
        booking.setBookingToDate(request.getEndDateTime());

        // Metadata (optional defaults)
        booking.setCreatedOn(new Date());
        booking.setCreatedBy(request.getUserId());

        // Nested object mapping
        BookingDetails details = toBookingDetails(request);
        if (details == null) {
            details = new BookingDetails(); // Ensure details is never null
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