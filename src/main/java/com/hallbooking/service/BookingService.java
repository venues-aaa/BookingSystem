package com.hallbooking.service;

import com.hallbooking.dto.request.CreateBookingRequest;
import com.hallbooking.dto.response.BookingResponse;
import com.hallbooking.entity.Booking;
import com.hallbooking.entity.BookingStatus;
import com.hallbooking.entity.Hall;
import com.hallbooking.entity.User;
import com.hallbooking.dao.impl.BookingRepository;
import com.hallbooking.dao.impl.HallRepository;
import com.hallbooking.dao.impl.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private HallRepository hallRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Booking createBooking(CreateBookingRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Hall hall = hallRepository.findById(request.getHallId())
                .orElseThrow(() -> new RuntimeException("Hall not found with id: " + request.getHallId()));

        validateTimeSlot(request.getStartDateTime(), request.getEndDateTime());

        List<Booking> conflicts = bookingRepository.findOverlappingBookings(
                request.getHallId(),
                request.getStartDateTime(),
                request.getEndDateTime()
        );

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Hall is already booked for this time slot");
        }

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setHall(hall);
        booking.setStartDateTime(request.getStartDateTime());
        booking.setEndDateTime(request.getEndDateTime());
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setPurpose(request.getPurpose());
        booking.setNumberOfAttendees(request.getNumberOfAttendees());

        if (hall.getPricePerHour() != null) {
            long hours = Duration.between(request.getStartDateTime(), request.getEndDateTime()).toHours();
            if (hours < 1) hours = 1;
            booking.setTotalPrice(hall.getPricePerHour().multiply(BigDecimal.valueOf(hours)));
        }

        return bookingRepository.save(booking);
    }

    public void cancelBooking(Long bookingId, String username) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to cancel this booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
        return mapToBookingResponse(booking);
    }

    public Page<BookingResponse> getUserBookings(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return bookingRepository.findByUserId(user.getId(), pageable)
                .map(this::mapToBookingResponse);
    }

    public Page<BookingResponse> getUserBookingsByStatus(String username, BookingStatus status, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return bookingRepository.findByUserIdAndStatus(user.getId(), status, pageable)
                .map(this::mapToBookingResponse);
    }

    private void validateTimeSlot(LocalDateTime startDateTime, LocalDateTime endDateTime) {
        if (startDateTime.isAfter(endDateTime)) {
            throw new RuntimeException("End date time must be after start date time");
        }

        if (startDateTime.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot book in the past");
        }
    }

    private BookingResponse mapToBookingResponse(Booking booking) {
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
    }
}
