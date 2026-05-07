package com.hallbooking.service;

import com.hallbooking.model.Item;
import com.hallbooking.model.ItemSearchCriteria;
import com.hallbooking.model.ItemType;
import com.hallbooking.model.ValidationResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

/**
 * ItemService - Generic service for all item types
 *
 * Handles business logic for items across ALL categories.
 * Schema-driven and category-agnostic - works for Hall, Catering, Decoration, etc.
 *
 * Data validation is performed using the category's form schema via FormValidationService.
 *
 * @author Hall Booking System
 * @version 1.0
 */
@Service
public class ItemService {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private FormValidationService formValidationService;

    @Autowired
    private CategoryService categoryService;

    /**
     * Create a new item
     *
     * Validates the item data against its category's form schema before saving.
     *
     * @param item Item to create
     * @return Created item
     * @throws IllegalArgumentException if validation fails
     */
    public Item createItem(Item item) {
        // Validate required fields
        if (item.getVendorId() == null || item.getVendorId().trim().isEmpty()) {
            throw new IllegalArgumentException("Vendor ID is required");
        }

        if (item.getType() == null || item.getType().trim().isEmpty()) {
            throw new IllegalArgumentException("Item type is required");
        }

        // Get category to validate against its schema
        ItemType category = null;
        if (item.getCategoryId() != null && !item.getCategoryId().trim().isEmpty()) {
            category = categoryService.getCategoryById(item.getCategoryId());
        } else {
            // Fallback: find category by name (type)
            category = categoryService.getCategoryByName(item.getType());
        }

        if (category == null) {
            throw new IllegalArgumentException("Category not found: " + item.getType());
        }

        // Validate item data against category's form schema (if schema exists and has fields)
        if (category.getFormSchema() != null &&
            category.getFormSchema().getFields() != null &&
            !category.getFormSchema().getFields().isEmpty() &&
            item.getDynamicData() != null) {

            // Validate dynamicData against form schema
            ValidationResult validationResult =
                formValidationService.validate(category.getFormSchema(), item.getDynamicData());

            if (!validationResult.getValid()) {
                throw new IllegalArgumentException("Validation failed: " + validationResult.getErrors());
            }
        }

        // Set audit fields
        item.setCategoryId(category.getId());
        item.setCreatedOn(new Date());
        item.setLastUpdatedOn(new Date());

        // Set default status if not provided
        if (item.getStatus() == null || item.getStatus().trim().isEmpty()) {
            item.setStatus("PENDING"); // Pending admin approval
        }

        // Save to database
        return mongoTemplate.save(item);
    }

    /**
     * Fetch items with pagination and type filtering
     *
     * @param item Contains filter criteria (primarily type)
     * @param page Page number (0-indexed)
     * @param size Page size
     * @param sortBy Sort field name
     * @return Paginated list of items
     */
    public Page<Item> fetchItems(Item item, int page, int size, String sortBy) {
        Query query = new Query();

        // Filter by type if provided
        if (item.getType() != null && !item.getType().trim().isEmpty()) {
            query.addCriteria(Criteria.where("type").is(item.getType()));
        }

        // Filter by vendor if provided
        if (item.getVendorId() != null && !item.getVendorId().trim().isEmpty()) {
            query.addCriteria(Criteria.where("vendorId").is(item.getVendorId()));
        }

        // Filter by status if provided
        if (item.getStatus() != null && !item.getStatus().trim().isEmpty()) {
            query.addCriteria(Criteria.where("status").is(item.getStatus()));
        }

        // Count total matching documents
        long total = mongoTemplate.count(query, Item.class);

        // Apply pagination and sorting
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortBy));
        query.with(pageable);

        // Execute query
        List<Item> items = mongoTemplate.find(query, Item.class);

        // Return as Page
        return PageableExecutionUtils.getPage(items, pageable, () -> total);
    }

    /**
     * Filter items with advanced search criteria
     *
     * @param searchCriteria Advanced search filters
     * @return List of matching items
     */
    public List<Item> filterItems(ItemSearchCriteria searchCriteria) {
        // This method delegates to DAO implementation
        // The ItemDao interface already defines this method
        return mongoTemplate.find(buildSearchQuery(searchCriteria), Item.class);
    }

    /**
     * Build MongoDB query from search criteria
     */
    private Query buildSearchQuery(ItemSearchCriteria criteria) {
        Query query = new Query();

        if (criteria.getType() != null && !criteria.getType().trim().isEmpty()) {
            query.addCriteria(Criteria.where("type").is(criteria.getType()));
        }

        if (criteria.getPlaceId() != null && !criteria.getPlaceId().trim().isEmpty()) {
            query.addCriteria(Criteria.where("placeId").is(criteria.getPlaceId()));
        }

        // Add more criteria as needed based on ItemSearchCriteria fields

        return query;
    }

    /**
     * Get item by ID
     *
     * @param itemId Item ID
     * @return Item or null if not found
     */
    public Item getItemById(String itemId) {
        return mongoTemplate.findById(itemId, Item.class);
    }

    /**
     * Update an existing item
     *
     * @param item Item with updated data
     * @return Updated item
     * @throws IllegalArgumentException if validation fails
     */
    public Item updateItem(Item item) {
        if (item.getId() == null || item.getId().trim().isEmpty()) {
            throw new IllegalArgumentException("Item ID is required for update");
        }

        // Fetch existing item
        Item existingItem = getItemById(item.getId());
        if (existingItem == null) {
            throw new IllegalArgumentException("Item not found: " + item.getId());
        }

        // Get category for validation
        ItemType category = categoryService.getCategoryById(existingItem.getCategoryId());
        if (category == null) {
            throw new IllegalArgumentException("Category not found for item");
        }

        // Validate updated data against schema (if schema exists)
        if (category.getFormSchema() != null &&
            category.getFormSchema().getFields() != null &&
            !category.getFormSchema().getFields().isEmpty() &&
            item.getDynamicData() != null) {

            ValidationResult validationResult =
                formValidationService.validate(category.getFormSchema(), item.getDynamicData());

            if (!validationResult.getValid()) {
                throw new IllegalArgumentException("Validation failed: " + validationResult.getErrors());
            }
        }

        // CRITICAL: Preserve existing fields to prevent data loss
        // Only update fields that are explicitly provided in the request

        // Preserve required identification fields
        if (item.getVendorId() == null || item.getVendorId().trim().isEmpty()) {
            item.setVendorId(existingItem.getVendorId());
        }
        if (item.getType() == null || item.getType().trim().isEmpty()) {
            item.setType(existingItem.getType());
        }
        if (item.getPlaceId() == null || item.getPlaceId().trim().isEmpty()) {
            item.setPlaceId(existingItem.getPlaceId());
        }
        if (item.getCategoryId() == null || item.getCategoryId().trim().isEmpty()) {
            item.setCategoryId(existingItem.getCategoryId());
        }

        // Preserve creation fields
        item.setCreatedOn(existingItem.getCreatedOn());
        item.setCreatedBy(existingItem.getCreatedBy());

        // Preserve other fields if not provided
        if (item.getPrice() == null) {
            item.setPrice(existingItem.getPrice());
        }
        if (item.getFilter() == null) {
            item.setFilter(existingItem.getFilter());
        }
        if (item.getReviews() == null) {
            item.setReviews(existingItem.getReviews());
        }
        if (item.getImages() == null) {
            item.setImages(existingItem.getImages());
        }
        if (item.getDetails() == null) {
            item.setDetails(existingItem.getDetails());
        }

        // Update audit fields
        item.setLastUpdatedOn(new Date());
        item.setLastUpdatedBy(item.getLastUpdatedBy()); // Preserve if provided

        // Save updated item
        return mongoTemplate.save(item);
    }

    /**
     * Delete an item
     * - If no bookings exist: Permanently delete from database
     * - If bookings exist: Throw exception with message to use deactivate instead
     *
     * @param itemId Item ID
     * @throws IllegalStateException if bookings exist
     */
    public void deleteItem(String itemId) {
        Item item = getItemById(itemId);
        if (item == null) {
            throw new IllegalArgumentException("Item not found: " + itemId);
        }

        // Check if any bookings exist for this item
        Query bookingQuery = Query.query(Criteria.where("itemId").is(itemId));
        long bookingCount = mongoTemplate.count(bookingQuery, "booking");

        if (bookingCount > 0) {
            // Cannot delete - bookings exist
            throw new IllegalStateException(
                "Cannot delete this item because it has " + bookingCount +
                " booking(s) associated with it. You can deactivate it instead to prevent new bookings."
            );
        }

        // No bookings - safe to permanently delete
        mongoTemplate.remove(item);
    }

    /**
     * Deactivate an item (soft delete - sets status to inactive)
     * Use this when the item has existing bookings
     *
     * @param itemId Item ID
     * @return Updated item
     */
    public Item deactivateItem(String itemId) {
        Item item = getItemById(itemId);
        if (item == null) {
            throw new IllegalArgumentException("Item not found: " + itemId);
        }

        item.setStatus("INACTIVE");
        item.setLastUpdatedOn(new Date());
        return mongoTemplate.save(item);
    }

    /**
     * Get all items for a specific vendor
     *
     * @param vendorId Vendor ID
     * @return List of vendor's items
     */
    public List<Item> getItemsByVendor(String vendorId) {
        Query query = Query.query(Criteria.where("vendorId").is(vendorId));
        return mongoTemplate.find(query, Item.class);
    }

    /**
     * Get items for a specific vendor, optionally filtered by category
     *
     * @param vendorId Vendor ID
     * @param categoryId Optional category ID filter
     * @return List of vendor's items
     */
    public List<Item> getItemsByVendorAndCategory(String vendorId, String categoryId) {
        Query query = Query.query(Criteria.where("vendorId").is(vendorId));

        // Add category filter if provided
        if (categoryId != null && !categoryId.trim().isEmpty()) {
            query.addCriteria(Criteria.where("categoryId").is(categoryId));
        }

        return mongoTemplate.find(query, Item.class);
    }

    /**
     * Get all active items of a specific type
     *
     * @param type Item type (category name)
     * @return List of active items
     */
    public List<Item> getActiveItemsByType(String type) {
        Query query = Query.query(
            Criteria.where("type").is(type)
                .and("status").in("ACTIVE", "APPROVED")
        );
        return mongoTemplate.find(query, Item.class);
    }

    /**
     * Approve an item (change status to ACTIVE)
     *
     * @param itemId Item ID
     * @return Updated item
     */
    public Item approveItem(String itemId) {
        Item item = getItemById(itemId);
        if (item == null) {
            throw new IllegalArgumentException("Item not found: " + itemId);
        }

        item.setStatus("ACTIVE");
        item.setLastUpdatedOn(new Date());
        return mongoTemplate.save(item);
    }

    /**
     * Reject an item (change status to REJECTED)
     *
     * @param itemId Item ID
     * @return Updated item
     */
    public Item rejectItem(String itemId) {
        Item item = getItemById(itemId);
        if (item == null) {
            throw new IllegalArgumentException("Item not found: " + itemId);
        }

        item.setStatus("REJECTED");
        item.setLastUpdatedOn(new Date());
        return mongoTemplate.save(item);
    }
}
