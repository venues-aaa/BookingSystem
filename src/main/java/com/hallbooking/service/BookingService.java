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
    private ItemService itemService;

    @Autowired
    private BookingValidationService bookingValidationService;

    @Autowired
    private com.hallbooking.dao.impl.UserRepositoryImpl userRepository;

    @Autowired
    private BlockedDateService blockedDateService;

    @Autowired
    private CouponService couponService;

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

        // Get item details for validation
        // Item item = itemProcessor.retrieveItemDetails(bookingObj.getItemId());

        // Validate time slot
        validateTimeSlot(bookingObj.getBookingFromDate(), bookingObj.getBookingToDate());

        // Get item details
        Item item = itemService.getItemById(bookingObj.getItemId());
        if (item == null) {
            throw new RuntimeException("Item not found");
        }

        // Check if dates are blocked by vendor
        boolean datesAvailable = blockedDateService.areDatesAvailable(
            bookingObj.getItemId(),
            bookingObj.getBookingFromDate(),
            bookingObj.getBookingToDate()
        );

        if (!datesAvailable) {
            // Get the blocking information to show to user
            List<com.hallbooking.dto.response.BlockedDateResponse> blockedDates =
                blockedDateService.getOverlappingBlockedDates(
                    bookingObj.getItemId(),
                    bookingObj.getBookingFromDate(),
                    bookingObj.getBookingToDate()
                );

            String reason = blockedDates.isEmpty() ? "" : " Reason: " + blockedDates.get(0).getReason();
            throw new RuntimeException("This item is not available for the selected dates." + reason);
        }

        // Validate booking against item's dynamic form rules (e.g., capacity check)
        // BookingDetails details = bookingObj.getDetails();
        // Integer numberOfAttendees = (details != null && details.getNumberOfAttendees() > 0)
        //     ? details.getNumberOfAttendees()
        //     : null;

        // Perform dynamic validation
        // bookingValidationService.validateBooking(item, numberOfAttendees);

        // Check availability (BLOCKED or CONFIRMED bookings both block the slot)
        boolean confirmFlag = bookingRepositoryImpl.confirmItemAvailability(bookingObj);

        if (!confirmFlag) {
            throw new RuntimeException("This item is already booked for the selected time slot");
        }

        // Process payment workflow
        processPaymentWorkflow(bookingObj);

        // Fetch item details to populate itemName
        if (bookingObj.getItemId() != null && bookingObj.getItemName() == null) {
            try {
                // Reuse the item variable we already fetched above
                // Item item already declared at line 58
                if (item != null) {
                    // Extract item name from various possible fields
                    String itemName = null;

                    // Try dynamicData first (new items)
                    if (item.getDynamicData() != null) {
                        itemName = (String) item.getDynamicData().get("name");
                        if (itemName == null) {
                            itemName = (String) item.getDynamicData().get("restaurant_name");
                        }
                    }

                    // Try details (legacy halls)
                    if (itemName == null && item.getDetails() != null) {
                        itemName = item.getDetails().getName();
                    }

                    if (itemName != null) {
                        bookingObj.setItemName(itemName);
                    }
                }
            } catch (Exception e) {
                // Log but don't fail the booking if item fetch fails
                System.err.println("Failed to fetch item name for itemId: " + bookingObj.getItemId() + " - " + e.getMessage());
            }
        }

        // Fetch user details to populate userName and userEmail
        if (bookingObj.getUserId() != null && bookingObj.getUserName() == null) {
            try {
                User user = userRepository.retrieveUser(bookingObj.getUserId());
                if (user != null) {
                    // Build full name from firstName and lastName
                    String fullName = null;
                    if (user.getDetails() != null) {
                        String firstName = user.getDetails().getFirstName();
                        String lastName = user.getDetails().getLastName();
                        if (firstName != null && lastName != null) {
                            fullName = firstName + " " + lastName;
                        } else if (firstName != null) {
                            fullName = firstName;
                        } else if (lastName != null) {
                            fullName = lastName;
                        }
                    }

                    if (fullName != null) {
                        bookingObj.setUserName(fullName);
                    }

                    if (user.getEmailId() != null) {
                        bookingObj.setUserEmail(user.getEmailId());
                    }
                }
            } catch (Exception e) {
                // Log but don't fail the booking if user fetch fails
                System.err.println("Failed to fetch user details for userId: " + bookingObj.getUserId() + " - " + e.getMessage());
            }
        }

        Booking createdBooking = bookingRepositoryImpl.createBooking(bookingObj);

        // Generate bundle coupons if this item has bundle offers
        if (createdBooking != null && createdBooking.getId() != null) {
            try {
                couponService.generateBundleCoupons(
                    createdBooking.getId(),
                    createdBooking.getUserId(),
                    createdBooking.getItemId(),
                    createdBooking.getBookingFromDate()
                );
            } catch (Exception e) {
                // Log but don't fail the booking if coupon generation fails
                System.err.println("Failed to generate bundle coupons for booking " + createdBooking.getId() + ": " + e.getMessage());
                e.printStackTrace();
            }
        }

        return createdBooking;
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

        // Check if any bundle coupons from this booking have been used
        List<String> usedInBookingIds = couponService.checkUsedCoupons(bookingId);
        if (!usedInBookingIds.isEmpty()) {
            String bookingList = String.join(", ", usedInBookingIds);
            throw new RuntimeException(
                "Cannot cancel this booking because bundle coupons have already been used in other bookings (" +
                bookingList + "). Please cancel those bookings first, then retry cancelling this booking."
            );
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

        // Release any coupon that was used in this booking (mark as unused so it can be used again)
        try {
            couponService.releaseCouponUsedInBooking(bookingId);
        } catch (Exception e) {
            // Log but don't fail the cancellation
            System.err.println("Failed to release coupon for cancelled booking " + bookingId + ": " + e.getMessage());
        }

        // Invalidate all coupons generated from this booking
        try {
            couponService.invalidateCouponsByParentBooking(bookingId);
        } catch (Exception e) {
            // Log but don't fail the cancellation
            System.err.println("Failed to invalidate coupons for cancelled booking " + bookingId + ": " + e.getMessage());
        }
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
        // Item item = itemProcessor.getItemById(itemId);
        // if (item != null && item.getDetails() != null && item.getDetails().getAvailableSlotTypes() != null) {
        //     if (!item.getDetails().getAvailableSlotTypes().isSlotTypeAvailable(slotType)) {
        //         result.put("available", false);
        //         result.put("error", "This hall does not offer " + slotType + " bookings");
        //         result.put("supportedSlotTypes", getSupportedSlotTypes(item));
        //         return result;
        //     }
        // }

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

    /**
     * Process payment workflow based on customer's selected payment option
     */
    private void processPaymentWorkflow(Booking booking) throws Exception {
        String paymentOption = booking.getPaymentOption();
        if (paymentOption == null) {
            // Default to full payment if not specified
            paymentOption = "CONFIRM_FULL_PAYMENT";
            booking.setPaymentOption(paymentOption);
        }

        // Fetch item to get vendor's payment terms and pricing
        Item item = itemService.getItemById(booking.getItemId());
        if (item == null) {
            throw new RuntimeException("Item not found");
        }

        // Store vendor's payment terms in booking details
        if (booking.getDetails() == null) {
            booking.setDetails(new BookingDetails());
        }

        // Extract vendor's payment terms from item's dynamic data
        // Payment terms field has a dynamic ID (e.g., field_1777734787674_1zergd00j)
        // We need to search for it by checking if the value is a Map with "selectedOption" key
        Map<String, Object> vendorPaymentTerms = null;
        if (item.getDynamicData() != null) {
            // Try exact field name first
            Object paymentTermsObj = item.getDynamicData().get("payment_terms");
            if (paymentTermsObj instanceof Map) {
                vendorPaymentTerms = (Map<String, Object>) paymentTermsObj;
            }

            // If not found, search for payment terms field by checking structure
            if (vendorPaymentTerms == null) {
                for (Map.Entry<String, Object> entry : item.getDynamicData().entrySet()) {
                    if (entry.getValue() instanceof Map) {
                        Map<String, Object> fieldValue = (Map<String, Object>) entry.getValue();
                        // Payment terms field has "selectedOption" key
                        if (fieldValue.containsKey("selectedOption")) {
                            vendorPaymentTerms = fieldValue;
                            break;
                        }
                    }
                }
            }
        }
        booking.getDetails().setVendorPaymentTerms(vendorPaymentTerms);

        // Calculate total booking amount (this could be enhanced based on your pricing logic)
        Double totalAmount = calculateBookingAmount(item, booking);
        booking.getDetails().setTotalBookingAmount(totalAmount);

        // Process based on payment option
        switch (paymentOption) {
            case "BLOCK_DATE_PARTIAL":
                // Customer pays partial amount to block the date
                Integer percentage = extractPartialPaymentPercentage(vendorPaymentTerms);
                if (percentage == null) {
                    percentage = 30; // Default to 30% if vendor didn't specify
                }

                Double partialAmount = (totalAmount * percentage) / 100.0;
                booking.setPartialPaymentAmount(partialAmount);
                booking.setPartialPaymentPercentage(percentage);
                booking.setPaymentStatus("PARTIAL_PAID");
                booking.setStatus("BLOCKED"); // Date is blocked, not confirmed
                booking.setVendorConfirmationRequired(false);
                break;

            case "CONFIRM_FULL_PAYMENT":
                // Customer pays full amount to confirm booking
                booking.setPaymentStatus("FULLY_PAID");
                booking.setStatus("CONFIRMED");
                booking.setVendorConfirmationRequired(false);
                break;

            case "PAY_OFFLINE":
                // Customer will pay offline, vendor must confirm
                booking.setPaymentStatus("OFFLINE_PENDING");
                booking.setStatus("PENDING");
                booking.setVendorConfirmationRequired(true);
                booking.setVendorConfirmationStatus("PENDING");
                break;

            default:
                throw new IllegalArgumentException("Invalid payment option: " + paymentOption);
        }
    }

    /**
     * Extract partial payment percentage from vendor's payment terms
     */
    private Integer extractPartialPaymentPercentage(Map<String, Object> vendorPaymentTerms) {
        if (vendorPaymentTerms == null) {
            return null;
        }

        String selectedOption = (String) vendorPaymentTerms.get("selectedOption");
        if (selectedOption == null) {
            return null;
        }

        // Parse percentage from options like "30% Advance + 70% on Event"
        if (selectedOption.contains("%")) {
            String[] parts = selectedOption.split("%");
            if (parts.length > 0) {
                try {
                    return Integer.parseInt(parts[0].trim());
                } catch (NumberFormatException e) {
                    // If parsing fails, return null
                    return null;
                }
            }
        }

        return null;
    }

    /**
     * Calculate total booking amount based on item pricing and attendees
     */
    private Double calculateBookingAmount(Item item, Booking booking) {
        // Try to get price from item
        Double basePrice = 0.0;

        // Check price object
        if (item.getPrice() != null) {
            basePrice = item.getPrice().getBaseRate();
        } else if (item.getDynamicData() != null) {
            // Try various price field patterns
            Object priceObj = item.getDynamicData().get("price");
            if (priceObj == null) {
                priceObj = item.getDynamicData().get("price_per_person");
            }
            if (priceObj == null) {
                priceObj = item.getDynamicData().get("field_hall_price");
            }

            if (priceObj instanceof Number) {
                basePrice = ((Number) priceObj).doubleValue();
            }
        }

        // Multiply by number of attendees if applicable
        Integer attendees = 1;
        if (booking.getDetails() != null && booking.getDetails().getNumberOfAttendees() > 0) {
            attendees = booking.getDetails().getNumberOfAttendees();
        }

        return basePrice * attendees;
    }

    /**
     * Vendor confirms offline payment booking
     */
    public void confirmOfflineBooking(String bookingId, String vendorId) throws Exception {
        Booking booking = bookingRepositoryImpl.getBookingById(bookingId);
        if (booking == null) {
            throw new RuntimeException("Booking not found");
        }

        // Verify vendor owns this item
        Item item = itemService.getItemById(booking.getItemId());
        if (item == null || !item.getVendorId().equals(vendorId)) {
            throw new RuntimeException("Unauthorized: You do not own this item");
        }

        // Verify it's an offline payment booking
        if (!"PAY_OFFLINE".equals(booking.getPaymentOption())) {
            throw new RuntimeException("This booking is not an offline payment booking");
        }

        // Confirm the booking
        booking.setVendorConfirmationStatus("CONFIRMED");
        booking.setStatus("CONFIRMED");
        booking.setPaymentStatus("OFFLINE_CONFIRMED");
        booking.setLastUpdateDate(new Date());

        bookingRepositoryImpl.updateBookingDetails(booking);
    }

    /**
     * Vendor cancels offline payment booking
     */
    public void cancelOfflineBooking(String bookingId, String vendorId, String reason) throws Exception {
        Booking booking = bookingRepositoryImpl.getBookingById(bookingId);
        if (booking == null) {
            throw new RuntimeException("Booking not found");
        }

        // Verify vendor owns this item
        Item item = itemService.getItemById(booking.getItemId());
        if (item == null || !item.getVendorId().equals(vendorId)) {
            throw new RuntimeException("Unauthorized: You do not own this item");
        }

        // Verify it's an offline payment booking
        if (!"PAY_OFFLINE".equals(booking.getPaymentOption())) {
            throw new RuntimeException("This booking is not an offline payment booking");
        }

        // Cancel the booking
        booking.setVendorConfirmationStatus("CANCELLED");
        booking.setStatus("CANCELLED");
        booking.setVendorCancellationReason(reason);
        booking.setLastUpdateDate(new Date());

        bookingRepositoryImpl.updateBookingDetails(booking);
    }

    /**
     * Get offline payment bookings pending vendor confirmation
     */
    public List<Booking> getOfflineBookingsPendingConfirmation(String vendorId) {
        return bookingRepositoryImpl.getOfflineBookingsPendingConfirmation(vendorId);
    }

}
