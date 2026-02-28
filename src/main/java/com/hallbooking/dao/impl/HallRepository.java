package com.hallbooking.dao.impl;

import com.hallbooking.entity.Hall;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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

    List<Hall> findByIsActiveTrue();
}
