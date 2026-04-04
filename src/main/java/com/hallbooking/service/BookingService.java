package com.hallbooking.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.hallbooking.dto.request.CreateBookingRequest;
import com.hallbooking.dto.response.BookingResponse;
import com.hallbooking.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Service
public class BookingService {

    @Autowired
    private com.hallbooking.dao.impl.BookingRepositoryImpl bookingRepositoryImpl;

    @Transactional
    public Booking createBooking(Booking bookingObj,
                                 String username) throws Exception {
       /* User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));*/

        //Need to uncomment the below auth part
        /*boolean validateAuth = userDetailsDao.validateUserAuthId(bookingObj.getDetails().getUserDetails());
        if(!validateAuth) {
            responseMsg = "Authentication failed!!";
            return responseMsg;
        }*/

       // Item itemObj = bookingRepositoryImpl.findItemById(bookingObj.getItemId());

        validateTimeSlot(bookingObj.getBookingFromDate(), bookingObj.getBookingToDate());

        boolean confirmFlag = bookingRepositoryImpl.confirmItemAvailability(bookingObj);

        if (!confirmFlag) {
            throw new RuntimeException("Hall is already booked for this time slot");
        }

        /*Booking booking = new Booking();
        booking.setUser(user);
        booking.setHall(hall);
        booking.setStartDateTime(request.getStartDateTime());
        booking.setEndDateTime(request.getEndDateTime());
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setPurpose(request.getPurpose());
        booking.setNumberOfAttendees(request.getNumberOfAttendees());*/
        // Commenting price calculation for the time being. Considering day booking only
        /*if (hall.getPricePerHour() != null) {
            long hours = Duration.between(request.getStartDateTime(), request.getEndDateTime()).toHours();
            if (hours < 1) hours = 1;
            booking.setTotalPrice(hall.getPricePerHour().multiply(BigDecimal.valueOf(hours)));
        }*/

        return bookingRepositoryImpl.createBooking(bookingObj);
    }

    public void cancelBooking(String bookingId, User user) {

        Booking bookingObj = new Booking();
        bookingObj.setId(bookingId);
        bookingObj.setLastUpdateUserId(user.getEmailId());
        bookingObj.setLastUpdateDate(new Date());
        bookingObj.setStatus("Cancel");
        BookingDetails details = new BookingDetails();
        details.setQtyAvailable(/*bookingObj.getDetails().getQtyAvailable() + */1);
        bookingObj.setDetails(details);

        //Required::::commenting for now
        /*User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to cancel this booking");
        }*/

        bookingRepositoryImpl.cancelBooking(bookingObj);
    }

    public Booking getBookingById(String bookingId) throws Exception {
        return bookingRepositoryImpl.getBookingById(bookingId);
    }

   /* public Page<BookingResponse> getUserBookings(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return bookingRepository.findByUserId(user.getId(), pageable)
                .map(this::mapToBookingResponse);
    }*/

    public Page<Booking> retrieveUserBookedDetails(String userId, String status, Pageable pageable) {
        return bookingRepositoryImpl.retrieveUserBookedDetails(userId, status, pageable);
    }

    public List<Booking> retrieveVendorBookedDetails(String vendorId) {
        return bookingRepositoryImpl.retrieveVendorBookedDetails(vendorId);
    }


   /*public Page<BookingResponse> getUserBookingsByStatus(String username, BookingStatus status, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return bookingRepository.findByUserIdAndStatus(user.getId(), status, pageable)
                .map(this::mapToBookingResponse);
    }*/

    private void validateTimeSlot(LocalDateTime startDateTime, LocalDateTime endDateTime) {
        if (startDateTime.isAfter(endDateTime)) {
            throw new RuntimeException("End date time must be after start date time");
        }

        if (startDateTime.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot book with a past date");
        }
    }

    /*private BookingResponse mapToBookingResponse(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getUser().getId(),
                booking.getUser().getUsername(),
                booking.getHall().getId(),
                booking.getHall().getName(),
                booking.getStartDateTime(),
                booking.getEndDateTime(),
                booking.getStatus(),
                booking.getTotalPrice(),
                booking.getPurpose(),
                booking.getNumberOfAttendees(),
                booking.getCreatedAt()
        );
    }*/

    /**
     * Method to fetch availability based on the parameter passed
     * @param
     * @return
     */
    public List<Booking> fetchAvailabilityBasedOn(Booking bookingObj) {
        return bookingRepositoryImpl.fetchAvailabilityBasedOn(bookingObj);
    }

    public boolean confirmItemAvailability(Booking bookingObj) throws Exception {

        if(bookingObj != null && bookingObj.getBookingFromDate() != null && bookingObj.getBookingToDate() != null) {
            if(bookingObj.getBookingFromDate().isAfter(bookingObj.getBookingToDate())) {
                throw new Exception("From date cannot be greater than To Date");
            }
        } else {
            throw new Exception("From Date or To Date cannot be null or empty");
        }
        return bookingRepositoryImpl.confirmItemAvailability(bookingObj);
    }

    public void updateBooking(Booking bookingObj) throws JsonProcessingException {
        bookingRepositoryImpl.updateBookingDetails(bookingObj);
    }

    public int getNotificationCountForVendor(String vendorId) {
        int notificationCount = bookingRepositoryImpl.getNotificationCountForVendor(vendorId);
        return notificationCount;
    }

    public List<Notification> getNotificationForVendor(String vendorId) {
        return bookingRepositoryImpl.getNotificationForVendor(vendorId);
    }

}
