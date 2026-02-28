package com.hallbooking.service;

import com.hallbooking.dto.request.CreateHallRequest;
import com.hallbooking.dto.request.UpdateHallRequest;
import com.hallbooking.dto.response.HallResponse;
import com.hallbooking.entity.Hall;
import com.hallbooking.dao.impl.HallRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class HallService {

    @Autowired
    private HallRepository hallRepository;

    public Hall createHall(CreateHallRequest request) {
        Hall hall = new Hall();
        hall.setName(request.getName());
        hall.setDescription(request.getDescription());
        hall.setCapacity(request.getCapacity());
        hall.setLocation(request.getLocation());
        hall.setPricePerHour(request.getPricePerHour());
        hall.setAmenities(request.getAmenities());
        hall.setImageUrl(request.getImageUrl());
        hall.setIsActive(true);

        return hallRepository.save(hall);
    }

    public Hall updateHall(Long id, UpdateHallRequest request) {
        Hall hall = hallRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hall not found with id: " + id));

        if (request.getName() != null) hall.setName(request.getName());
        if (request.getDescription() != null) hall.setDescription(request.getDescription());
        if (request.getCapacity() != null) hall.setCapacity(request.getCapacity());
        if (request.getLocation() != null) hall.setLocation(request.getLocation());
        if (request.getPricePerHour() != null) hall.setPricePerHour(request.getPricePerHour());
        if (request.getAmenities() != null) hall.setAmenities(request.getAmenities());
        if (request.getImageUrl() != null) hall.setImageUrl(request.getImageUrl());
        if (request.getIsActive() != null) hall.setIsActive(request.getIsActive());

        return hallRepository.save(hall);
    }

    public void deleteHall(Long id) {
        Hall hall = hallRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hall not found with id: " + id));
        hallRepository.delete(hall);
    }

    public HallResponse getHallById(Long id) {
        Hall hall = hallRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hall not found with id: " + id));
        return mapToHallResponse(hall);
    }

    public Page<HallResponse> getAllHalls(Pageable pageable) {
        return hallRepository.findByIsActive(true, pageable)
                .map(this::mapToHallResponse);
    }

    public Page<HallResponse> searchHalls(Integer capacity, String location, String amenities, Pageable pageable) {
        return hallRepository.searchHalls(capacity, location, amenities, pageable)
                .map(this::mapToHallResponse);
    }

    private HallResponse mapToHallResponse(Hall hall) {
        return new HallResponse(
                hall.getId(),
                hall.getName(),
                hall.getDescription(),
                hall.getCapacity(),
                hall.getLocation(),
                hall.getPricePerHour(),
                hall.getAmenities(),
                hall.getImageUrl(),
                hall.getIsActive(),
                hall.getCreatedAt(),
                hall.getUpdatedAt()
        );
    }
}
