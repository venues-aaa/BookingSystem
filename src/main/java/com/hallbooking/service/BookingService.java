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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class BookingService {

    @Autowired
    private com.hallbooking.dao.impl.BookingRepositoryImpl bookingRepositoryImpl;

    @Autowired
    private ItemProcessor itemProcessor;

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

    public void cancelBooking(String bookingId, User user, String cancelReason) {
        // Fetch the existing booking to check the date
        Booking existingBooking;
        try {
            existingBooking = bookingRepositoryImpl.getBookingById(bookingId);
        } catch (Exception e) {
            throw new RuntimeException("Booking not found with id: " + bookingId);
        }

        // Check if the booking is in the past
        LocalDateTime bookingEndDate = existingBooking.getBookingToDate();
        if (bookingEndDate != null && bookingEndDate.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot cancel a booking for a past event");
        }

        Booking bookingObj = new Booking();
        bookingObj.setId(bookingId);
        bookingObj.setLastUpdateUserId(user != null ? user.getEmailId() : "system");
        bookingObj.setLastUpdateDate(new Date());
        bookingObj.setStatus("Cancelled");
        BookingDetails details = new BookingDetails();
        details.setQtyAvailable(/*bookingObj.getDetails().getQtyAvailable() + */1);
        details.setBlockedReason(cancelReason); // Store cancel reason
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

    /**
     * Get list of supported slot types for a hall
     */
    private List<String> getSupportedSlotTypes(Item item) {
        List<String> supported = new ArrayList<>();
        if (item.getDetails() != null && item.getDetails().getAvailableSlotTypes() != null) {
            AvailableSlotTypes slotTypes = item.getDetails().getAvailableSlotTypes();
            if (slotTypes.isFullday()) supported.add("fullday");
            if (slotTypes.isMorning()) supported.add("morning");
            if (slotTypes.isEvening()) supported.add("evening");
        } else {
            // Default: all slot types supported
            supported.add("fullday");
            supported.add("morning");
            supported.add("evening");
        }
        return supported;
    }

    public Map<String, Object> checkAvailabilityWithSuggestions(String itemId, String bookingDateStr, String slotType) throws Exception {
        Map<String, Object> result = new HashMap<>();

        // Validate that the hall supports this slot type
        Item item = itemProcessor.getItemById(itemId);
        if (item != null && item.getDetails() != null && item.getDetails().getAvailableSlotTypes() != null) {
            if (!item.getDetails().getAvailableSlotTypes().isSlotTypeAvailable(slotType)) {
                result.put("available", false);
                result.put("error", "This hall does not offer " + slotType + " bookings");
                result.put("supportedSlotTypes", getSupportedSlotTypes(item));
                return result;
            }
        }

        // Parse the booking date
        LocalDate bookingDate = LocalDate.parse(bookingDateStr);
        LocalDateTime startDateTime, endDateTime;

        // Calculate start and end times based on slot type
        switch (slotType) {
            case "fullday":
                startDateTime = bookingDate.atStartOfDay();
                endDateTime = bookingDate.atTime(23, 59, 59, 999000000); // Include nanoseconds to match frontend
                break;
            case "morning":
                startDateTime = bookingDate.atStartOfDay();
                endDateTime = bookingDate.atTime(16, 0, 0, 0); // 4:00 PM
                break;
            case "evening":
                startDateTime = bookingDate.atTime(17, 0, 0, 0); // 5:00 PM
                endDateTime = bookingDate.atTime(22, 0, 0, 0); // 10:00 PM
                break;
            default:
                throw new IllegalArgumentException("Invalid slot type: " + slotType);
        }

        // Create booking object to check availability
        Booking bookingObj = new Booking();
        bookingObj.setItemId(itemId);
        bookingObj.setBookingFromDate(startDateTime);
        bookingObj.setBookingToDate(endDateTime);

        // Check if slot is available
        boolean isAvailable = confirmItemAvailability(bookingObj);
        result.put("available", isAvailable);

        // If not available, suggest alternative slots
        if (!isAvailable) {
            List<Map<String, String>> suggestedSlots = findAvailableSlots(itemId, bookingDate, slotType);
            result.put("suggestedSlots", suggestedSlots);
        }

        return result;
    }

    private List<Map<String, String>> findAvailableSlots(String itemId, LocalDate requestedDate, String slotType) throws Exception {
        List<Map<String, String>> suggestions = new ArrayList<>();
        LocalDate tomorrow = LocalDate.now().plusDays(1); // Minimum date for suggestions

        // Find up to 6 available slots starting from tomorrow (only future dates, no past or today)
        LocalDate checkDate = tomorrow;
        int found = 0;
        int maxDaysToCheck = 90; // Check up to 90 days ahead

        // Skip the requested date itself if it appears in the search
        for (int i = 0; i < maxDaysToCheck && found < 6; i++) {
            // Skip the requested date (it's already unavailable)
            if (!checkDate.equals(requestedDate) && isSlotAvailable(itemId, checkDate, slotType)) {
                Map<String, String> slot = new HashMap<>();
                slot.put("date", checkDate.toString());
                slot.put("slotType", slotType);
                suggestions.add(slot);
                found++;
            }
            checkDate = checkDate.plusDays(1);
        }

        return suggestions;
    }

    private boolean isSlotAvailable(String itemId, LocalDate date, String slotType) throws Exception {
        LocalDateTime startDateTime, endDateTime;

        switch (slotType) {
            case "fullday":
                startDateTime = date.atStartOfDay();
                endDateTime = date.atTime(23, 59, 59, 999000000); // Include nanoseconds to match frontend
                break;
            case "morning":
                startDateTime = date.atStartOfDay();
                endDateTime = date.atTime(16, 0, 0, 0);
                break;
            case "evening":
                startDateTime = date.atTime(17, 0, 0, 0);
                endDateTime = date.atTime(22, 0, 0, 0);
                break;
            default:
                return false;
        }

        Booking bookingObj = new Booking();
        bookingObj.setItemId(itemId);
        bookingObj.setBookingFromDate(startDateTime);
        bookingObj.setBookingToDate(endDateTime);

        return confirmItemAvailability(bookingObj);
    }

}
