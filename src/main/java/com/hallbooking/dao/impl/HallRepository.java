package com.hallbooking.dao.impl;

import com.hallbooking.entity.Hall;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HallRepository extends JpaRepository<Hall, Long> {

    Page<Hall> findByIsActive(Boolean isActive, Pageable pageable);

    @Query("SELECT h FROM Hall h WHERE h.isActive = true " +
           "AND (:capacity IS NULL OR h.capacity >= :capacity) " +
           "AND (:location IS NULL OR LOWER(h.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
           "AND (:amenities IS NULL OR LOWER(h.amenities) LIKE LOWER(CONCAT('%', :amenities, '%')))")
    Page<Hall> searchHalls(
        @Param("capacity") Integer capacity,
        @Param("location") String location,
        @Param("amenities") String amenities,
        Pageable pageable
    );

    @Query("SELECT DISTINCT h FROM Hall h WHERE h.isActive = true " +
           "AND (:capacity IS NULL OR h.capacity >= :capacity) " +
           "AND (:location IS NULL OR LOWER(h.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
           "AND (:amenities IS NULL OR LOWER(h.amenities) LIKE LOWER(CONCAT('%', :amenities, '%'))) " +
           "AND (:startDateTime IS NULL OR :endDateTime IS NULL OR " +
           "NOT EXISTS (SELECT b FROM Booking b WHERE b.hall.id = h.id " +
           "AND b.status = 'CONFIRMED' " +
           "AND b.startDateTime < :endDateTime AND b.endDateTime > :startDateTime))")
    Page<Hall> searchHallsWithAvailability(
        @Param("capacity") Integer capacity,
        @Param("location") String location,
        @Param("amenities") String amenities,
        @Param("startDateTime") LocalDateTime startDateTime,
        @Param("endDateTime") LocalDateTime endDateTime,
        Pageable pageable
    );

    List<Hall> findByIsActiveTrue();

    Page<Hall> findByCreatedById(Long createdById, Pageable pageable);

    @Query("SELECT h FROM Hall h WHERE " +
           "(:name IS NULL OR LOWER(h.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
           "AND (:capacity IS NULL OR h.capacity >= :capacity) " +
           "AND (:location IS NULL OR LOWER(h.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
           "AND (:createdById IS NULL OR h.createdBy.id = :createdById) " +
           "AND (:isActive IS NULL OR h.isActive = :isActive)")
    Page<Hall> adminSearchHalls(
        @Param("name") String name,
        @Param("capacity") Integer capacity,
        @Param("location") String location,
        @Param("createdById") Long createdById,
        @Param("isActive") Boolean isActive,
        Pageable pageable
    );
}
