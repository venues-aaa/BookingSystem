package com.hallbooking.controller;

import com.hallbooking.dto.request.CreateHallRequest;
import com.hallbooking.dto.request.UpdateHallRequest;
import com.hallbooking.dto.response.ItemResponse;
import com.hallbooking.model.User;
import com.hallbooking.model.Item;
import com.hallbooking.model.Vendor;
import com.hallbooking.service.ItemProcessor;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vendor")
@CrossOrigin(origins = "*", maxAge = 3600)
public class VendorController {

    @Autowired
    private ItemProcessor itemProcessor;

    @GetMapping("/items")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Map<String, Object>> fetchVendorItems(
            @AuthenticationPrincipal Vendor vendor,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).descending());
        //Page<ItemResponse> halls = hallService.getHallsByVendor(vendor.getId(), pageable);
        List<Item> item = itemProcessor.getItemsBasedOnVendorId(vendor.getVendorId(), pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("halls", item);
        /*response.put("currentPage", halls.getNumber());
        response.put("totalPages", halls.getTotalPages());
        response.put("totalElements", halls.getTotalElements());*/

        return ResponseEntity.ok(response);
    }

   /* @PostMapping("/halls")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ItemResponse> createHall(
            @Valid @RequestBody CreateHallRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User vendor = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Hall hall = hallService.createHall(request, vendor.getId());
        ItemResponse response = hallService.getHallById(hall.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }*/

   /* @PutMapping("/halls/{id}")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<?> updateHall(
            @PathVariable Long id,
            @Valid @RequestBody UpdateHallRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User vendor = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify the hall belongs to this vendor
        ItemResponse hall = hallService.getHallById(id);
        if (!vendor.getId().equals(hall.getCreatedById())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You can only update halls that you created"));
        }

        Hall updatedHall = hallService.updateHall(id, request);
        ItemResponse response = hallService.getHallById(updatedHall.getId());
        return ResponseEntity.ok(response);
    }*/

   /* @PatchMapping("/halls/{id}/toggle-status")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<?> toggleHallStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        User vendor = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify the hall belongs to this vendor
        ItemResponse hall = hallService.getHallById(id);
        if (!vendor.getId().equals(hall.getCreatedById())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You can only manage halls that you created"));
        }

        Hall updatedHall = hallService.toggleHallStatus(id);
        ItemResponse response = hallService.getHallById(updatedHall.getId());
        return ResponseEntity.ok(Map.of(
            "message", updatedHall.getIsActive() ? "Hall activated successfully" : "Hall deactivated successfully",
            "hall", response
        ));
    }*/


}
