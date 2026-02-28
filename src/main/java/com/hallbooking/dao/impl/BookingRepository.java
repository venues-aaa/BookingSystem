package com.hallbooking.dao.impl;

import com.hallbooking.entity.Booking;
import com.hallbooking.entity.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    Page<Booking> findByUserId(Long userId, Pageable pageable);

    Page<Booking> findByUserIdAndStatus(Long userId, BookingStatus status, Pageable pageable);

    List<Booking> findByHallId(Long hallId);

    Page<Booking> findByHallId(Long hallId, Pageable pageable);

    @Query("SELECT b FROM Booking b WHERE b.hall.id = :hallId " +
           "AND b.status = 'CONFIRMED' " +
           "AND ((b.startDateTime < :endDateTime AND b.endDateTime > :startDateTime))")
    List<Booking> findOverlappingBookings(
        @Param("hallId") Long hallId,
        @Param("startDateTime") LocalDateTime startDateTime,
        @Param("endDateTime") LocalDateTime endDateTime
    );

    @Query("SELECT b FROM Booking b WHERE " +
           "(:hallId IS NULL OR b.hall.id = :hallId) AND " +
           "(:userId IS NULL OR b.user.id = :userId) AND " +
           "(:status IS NULL OR b.status = :status)")
    Page<Booking> findAllWithFilters(
        @Param("hallId") Long hallId,
        @Param("userId") Long userId,
        @Param("status") BookingStatus status,
        Pageable pageable
    );
}
