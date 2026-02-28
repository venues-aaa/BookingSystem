package com.hallbooking.controller;

import com.hallbooking.dto.response.HallResponse;
import com.hallbooking.service.HallService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/halls")
@CrossOrigin(origins = "*", maxAge = 3600)
public class HallController {

    @Autowired
    private HallService hallService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllHalls(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer capacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String amenities,
            @RequestParam(defaultValue = "id") String sortBy) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).ascending());
        Page<HallResponse> halls;

        if (capacity != null || location != null || amenities != null) {
            halls = hallService.searchHalls(capacity, location, amenities, pageable);
        } else {
            halls = hallService.getAllHalls(pageable);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("halls", halls.getContent());
        response.put("currentPage", halls.getNumber());
        response.put("totalPages", halls.getTotalPages());
        response.put("totalElements", halls.getTotalElements());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<HallResponse> getHallById(@PathVariable Long id) {
        HallResponse hall = hallService.getHallById(id);
        return ResponseEntity.ok(hall);
    }
}
