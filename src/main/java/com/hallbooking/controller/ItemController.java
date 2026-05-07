package com.hallbooking.controller;

import com.hallbooking.model.Item;
import com.hallbooking.model.ItemSearchCriteria;
import com.hallbooking.service.ItemService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ItemController - Generic REST controller for all item types
 *
 * Handles create/read/update/delete operations for items across ALL categories.
 * This is category-agnostic and schema-driven - works for Hall, Catering, Decoration, etc.
 *
 * @author Hall Booking System
 * @version 1.0
 */
@RestController
@RequestMapping("/item")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ItemController {

    private static final Logger logger = LoggerFactory.getLogger(ItemController.class);

    @Autowired
    private ItemService itemService;

    /**
     * Create a new item (generic for all categories)
     *
     * POST /item/create
     *
     * Request body contains:
     * - vendorId: ID of the vendor creating the item
     * - categoryId: ID of the category (determines the form schema)
     * - type: Category name (Hall, Catering, etc.)
     * - dynamicData: Map of field values based on category's form schema
     * - details: Legacy structure (for backward compatibility)
     * - price: Pricing information
     *
     * @param item Item data from vendor
     * @return Created item
     */
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createItem(@RequestBody Item item) {
        try {
            logger.info("Creating item of type: {} for vendor: {}", item.getType(), item.getVendorId());

            Item createdItem = itemService.createItem(item);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Item created successfully");
            response.put("data", createdItem);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
            logger.error("Validation error creating item: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);

        } catch (Exception e) {
            logger.error("Error creating item", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to create item: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Fetch items with pagination and filtering by type
     *
     * POST /item/fetch?page=0&size=10&sortBy=createdOn
     *
     * Request body: { "type": "Hall" }
     *
     * @param item Contains filter criteria (primarily type)
     * @param page Page number (0-indexed)
     * @param size Page size
     * @param sortBy Sort field
     * @return Paginated list of items
     */
    @PostMapping("/fetch")
    public ResponseEntity<Map<String, Object>> fetchItems(
            @RequestBody Item item,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdOn") String sortBy) {

        try {
            logger.info("Fetching items of type: {} (page: {}, size: {})", item.getType(), page, size);

            Page<Item> itemsPage = itemService.fetchItems(item, page, size, sortBy);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", itemsPage.getContent());
            response.put("currentPage", itemsPage.getNumber());
            response.put("totalPages", itemsPage.getTotalPages());
            response.put("totalElements", itemsPage.getTotalElements());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error fetching items", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch items: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Filter items with advanced search criteria
     *
     * POST /item/filter
     *
     * Request body contains search criteria:
     * - type: Category type
     * - location: Location filter
     * - minPrice/maxPrice: Price range
     * - capacity: Capacity requirement
     * - etc. (schema-driven based on category)
     *
     * @param searchCriteria Advanced search filters
     * @return List of matching items
     */
    @PostMapping("/filter")
    public ResponseEntity<Map<String, Object>> filterItems(@RequestBody ItemSearchCriteria searchCriteria) {
        try {
            logger.info("Filtering items with criteria: {}", searchCriteria);

            List<Item> items = itemService.filterItems(searchCriteria);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", items);
            response.put("total", items.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error filtering items", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to filter items: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get single item details by ID
     *
     * GET /item/{itemId}
     *
     * @param itemId Item ID
     * @return Item details
     */
    @GetMapping("/{itemId}")
    public ResponseEntity<Map<String, Object>> getItemDetails(@PathVariable String itemId) {
        try {
            logger.info("Fetching item details for ID: {}", itemId);

            Item item = itemService.getItemById(itemId);

            if (item == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Item not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", item);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error fetching item details", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch item: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Update an existing item
     *
     * PUT /item/{itemId}
     *
     * @param itemId Item ID
     * @param item Updated item data
     * @return Updated item
     */
    @PutMapping("/{itemId}")
    public ResponseEntity<Map<String, Object>> updateItem(
            @PathVariable String itemId,
            @RequestBody Item item) {

        try {
            logger.info("Updating item: {}", itemId);

            item.setId(itemId);
            Item updatedItem = itemService.updateItem(item);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Item updated successfully");
            response.put("data", updatedItem);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.error("Validation error updating item: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);

        } catch (Exception e) {
            logger.error("Error updating item", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to update item: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Delete an item
     * - If no bookings exist: Permanently delete
     * - If bookings exist: Returns error with suggestion to deactivate
     *
     * DELETE /item/{itemId}
     *
     * @param itemId Item ID
     * @return Success message or error if bookings exist
     */
    @DeleteMapping("/{itemId}")
    public ResponseEntity<Map<String, Object>> deleteItem(@PathVariable String itemId) {
        try {
            logger.info("Deleting item: {}", itemId);

            itemService.deleteItem(itemId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Item deleted successfully");

            return ResponseEntity.ok(response);

        } catch (IllegalStateException e) {
            // Item has bookings - cannot delete
            logger.warn("Cannot delete item {}: {}", itemId, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("hasBookings", true);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);

        } catch (IllegalArgumentException e) {
            logger.error("Validation error deleting item: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);

        } catch (Exception e) {
            logger.error("Error deleting item", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to delete item: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Deactivate an item (soft delete - sets status to inactive)
     * Use this when item has existing bookings
     *
     * PUT /item/{itemId}/deactivate
     *
     * @param itemId Item ID
     * @return Updated item
     */
    @PutMapping("/{itemId}/deactivate")
    public ResponseEntity<Map<String, Object>> deactivateItem(@PathVariable String itemId) {
        try {
            logger.info("Deactivating item: {}", itemId);

            Item deactivatedItem = itemService.deactivateItem(itemId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Item deactivated successfully. It will no longer accept new bookings.");
            response.put("data", deactivatedItem);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error deactivating item", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to deactivate item: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get all items for a specific vendor
     *
     * GET /item/vendor/{vendorId}?categoryId=xxx
     *
     * @param vendorId Vendor ID
     * @param categoryId Optional category ID filter
     * @return List of vendor's items
     */
    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<Map<String, Object>> getVendorItems(
            @PathVariable String vendorId,
            @RequestParam(required = false) String categoryId) {
        try {
            logger.info("Fetching items for vendor: {} (categoryId: {})", vendorId, categoryId);

            List<Item> items = itemService.getItemsByVendorAndCategory(vendorId, categoryId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", items);
            response.put("total", items.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error fetching vendor items", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch vendor items: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
