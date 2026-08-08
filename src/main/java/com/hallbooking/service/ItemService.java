package com.hallbooking.service;

import com.hallbooking.model.Booking;
import com.hallbooking.model.Item;
import com.hallbooking.model.ItemSearchCriteria;
import com.hallbooking.model.ItemType;
import com.hallbooking.model.ValidationResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.bson.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.aggregation.GroupOperation;
import org.springframework.data.mongodb.core.aggregation.LimitOperation;
import org.springframework.data.mongodb.core.aggregation.MatchOperation;
import org.springframework.data.mongodb.core.aggregation.SortOperation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    public Page<Item> fetchItems(Item item, int page, int size, String sortBy,String sortOrder) {
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

        if(item.getPromotions() != null && item.getPromotions().isFeatured()) {
            query.addCriteria(Criteria.where("promotions.featured").is(true));
        }

        // Count total matching documents
        long total = mongoTemplate.count(query, Item.class);

        // Apply pagination and sorting
        Sort.Direction direction = "desc".equalsIgnoreCase(sortOrder) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
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
     * Search items by type/place and availability for the requested date range.
     */
    public Page<Item> searchAvailableItems(ItemSearchCriteria criteria, int page, int size, String sortBy, String sortOrder) {
        if (criteria == null) {
            return PageableExecutionUtils.getPage(new ArrayList<>(), PageRequest.of(0, 10), () -> 0);
        }

        int safePage = Math.max(page, 0);
        int safeSize = size > 0 ? size : 10;
        Pageable pageable = PageRequest.of(safePage, safeSize);

        LocalDateTime startDate = criteria.getStartDate();
        LocalDateTime endDate = criteria.getEndDate();
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            return PageableExecutionUtils.getPage(new ArrayList<>(), pageable, () -> 0);
        }

        Query query = buildSearchQuery(criteria);

        Sort.Direction direction = "desc".equalsIgnoreCase(sortOrder) ? Sort.Direction.DESC : Sort.Direction.ASC;
        query.with(Sort.by(direction, sortBy));

        List<Item> matchingItems = mongoTemplate.find(query, Item.class);

        if (startDate == null || endDate == null) {
            return PageableExecutionUtils.getPage(matchingItems, pageable, () -> matchingItems.size());
        }

        List<Item> availableItems = new ArrayList<>();
        for (Item item : matchingItems) {
            if (item.getId() != null && isItemAvailable(item.getId(), startDate, endDate)) {
                availableItems.add(item);
            }
        }

        int fromIndex = Math.max(0, safePage * safeSize);
        int toIndex = Math.min(fromIndex + safeSize, availableItems.size());
        if (fromIndex >= availableItems.size()) {
            return PageableExecutionUtils.getPage(new ArrayList<>(), pageable, () -> availableItems.size());
        }

        return PageableExecutionUtils.getPage(availableItems.subList(fromIndex, toIndex), pageable, () -> availableItems.size());
    }

    /**
     * Build MongoDB query from search criteria
     */
    private Query buildSearchQuery(ItemSearchCriteria criteria) {
        Query query = new Query();
        List<Criteria> andCriteriaList = new ArrayList<>();

        if (criteria.getType() != null && !criteria.getType().trim().isEmpty()) {
            andCriteriaList.add(Criteria.where("type").is(criteria.getType().trim()));
        }

        if (criteria.getPlaceId() != null && !criteria.getPlaceId().trim().isEmpty()) {
            andCriteriaList.add(Criteria.where("placeId").is(criteria.getPlaceId().trim()));
        }

        if (criteria.getPlace() != null && !criteria.getPlace().trim().isEmpty()) {
            andCriteriaList.add(new Criteria().orOperator(
                Criteria.where("details.place").is(criteria.getPlace().trim()),
                Criteria.where("placeId").is(criteria.getPlace().trim())
            ));
        }

        if (criteria.getRatings() != null && !criteria.getRatings().isEmpty()) {
            List<Criteria> ratingCriteriaList = new ArrayList<>();
            for (Double rating : criteria.getRatings()) {
                if (rating != null) {
                    ratingCriteriaList.add(Criteria.where("details.rating").gte(rating));
                }
            }
            if (!ratingCriteriaList.isEmpty()) {
                andCriteriaList.add(new Criteria().orOperator(ratingCriteriaList.toArray(new Criteria[0])));
            }
        }

        if (criteria.getPriceRanges() != null && !criteria.getPriceRanges().isEmpty()) {
            List<Criteria> priceCriteriaList = new ArrayList<>();
            for (String priceRange : criteria.getPriceRanges()) {
                Double[] bounds = parsePriceRange(priceRange);
                if (bounds[0] == null && bounds[1] == null) {
                    continue;
                }

                Criteria priceCriteria;
                if (bounds[0] != null && bounds[1] != null) {
                    priceCriteria = Criteria.where("price.baseRate").gte(bounds[0]).lte(bounds[1]);
                } else if (bounds[0] != null) {
                    priceCriteria = Criteria.where("price.baseRate").gte(bounds[0]);
                } else {
                    priceCriteria = Criteria.where("price.baseRate").lte(bounds[1]);
                }
                priceCriteriaList.add(priceCriteria);
            }
            if (!priceCriteriaList.isEmpty()) {
                andCriteriaList.add(new Criteria().orOperator(priceCriteriaList.toArray(new Criteria[0])));
            }
        }

        if (criteria.getCapacities() != null && !criteria.getCapacities().isEmpty()) {
            List<Criteria> capacityCriteriaList = new ArrayList<>();
            for (Integer capacity : criteria.getCapacities()) {
                if (capacity == null) {
                    continue;
                }
                capacityCriteriaList.add(new Criteria().orOperator(
                    Criteria.where("dynamicData.capacity").lte(capacity),
                    Criteria.where("dynamicData.maximum_capacity").lte(capacity),
                    Criteria.where("dynamicData.field_hall_capacity").lte(capacity),
                    Criteria.where("dynamicData.seating_capacity").lte(capacity),
                    Criteria.where("details.capacity").lte(capacity)
                ));
            }
            if (!capacityCriteriaList.isEmpty()) {
                andCriteriaList.add(new Criteria().orOperator(capacityCriteriaList.toArray(new Criteria[0])));
            }
        }

        if (!andCriteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(andCriteriaList.toArray(new Criteria[0])));
        }

        return query;
    }

    static Double[] parsePriceRange(String priceRange) {
        if (priceRange == null || priceRange.trim().isEmpty()) {
            return new Double[]{null, null};
        }

        String normalized = priceRange.trim().toLowerCase();
        if (normalized.startsWith("below") || normalized.startsWith("less than") || normalized.startsWith("<")) {
            String value = normalized.replace("below", "")
                .replace("less than", "")
                .replace("<", "")
                .trim();
            return new Double[]{null, parseDoubleValue(value)};
        }

        if (normalized.startsWith("above") || normalized.startsWith("more than") || normalized.startsWith(">")) {
            String value = normalized.replace("above", "")
                .replace("more than", "")
                .replace(">", "")
                .trim();
            return new Double[]{parseDoubleValue(value), null};
        }

        String[] bounds = normalized.split("\\s*(to|or|-|–|—)\\s*");
        if (bounds.length == 2) {
            return new Double[]{parseDoubleValue(bounds[0].trim()), parseDoubleValue(bounds[1].trim())};
        }

        return new Double[]{null, null};
    }

    private static Double parseDoubleValue(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        try {
            return Double.parseDouble(value.replaceAll("[^0-9.-]", ""));
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private boolean isItemAvailable(String itemId, LocalDateTime startDate, LocalDateTime endDate) {
        Query bookingQuery = new Query();
        bookingQuery.addCriteria(Criteria.where("itemId").is(itemId));
        bookingQuery.addCriteria(Criteria.where("bookingFromDate").lt(endDate));
        bookingQuery.addCriteria(Criteria.where("bookingToDate").gt(startDate));
        bookingQuery.addCriteria(Criteria.where("status").nin("Cancelled", "CANCELLED", "INACTIVE", "inactive"));

        List<Booking> overlappingBookings = mongoTemplate.find(bookingQuery, Booking.class);
        return overlappingBookings.isEmpty();
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
        if (item.getPromotions() == null) {
            item.setPromotions(existingItem.getPromotions());
        }

        // Preserve bundle-related fields if not provided
        if (item.getDiscountedBundledItems() == null) {
            item.setDiscountedBundledItems(existingItem.getDiscountedBundledItems());
        }
        if (item.getRequiredPrerequisites() == null) {
            item.setRequiredPrerequisites(existingItem.getRequiredPrerequisites());
        }
        if (item.getMaxConcurrentBookings() == null) {
            item.setMaxConcurrentBookings(existingItem.getMaxConcurrentBookings());
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
     * Get the top places by item count.
     *
     * @param limit maximum number of places to return
     * @return List of place-count maps, sorted by count descending
     */
    public List<Map<String, Object>> getTopPlacesByItemCount(int limit) {
        MatchOperation matchValidPlace = Aggregation.match(
            Criteria.where("details.place").exists(true).ne("\"").ne(null)
        );
        GroupOperation groupByPlace = Aggregation.group("details.place").count().as("count");
        SortOperation sortByCountDesc = Aggregation.sort(Sort.Direction.DESC, "count");
        LimitOperation limitOperation = Aggregation.limit(limit);

        Aggregation aggregation = Aggregation.newAggregation(
            matchValidPlace,
            groupByPlace,
            sortByCountDesc,
            limitOperation
        );

        AggregationResults<Document> results = mongoTemplate.aggregate(aggregation, Item.class, Document.class);

        List<Map<String, Object>> places = new ArrayList<>();
        for (Document doc : results) {
            Object id = doc.get("_id");
            Object countValue = doc.get("count");
            if (id != null && countValue instanceof Number) {
                Map<String, Object> placeGroup = new HashMap<>();
                placeGroup.put("place", id.toString());
                placeGroup.put("count", ((Number) countValue).intValue());
                places.add(placeGroup);
            }
        }

        return places;
    }

    /**
     * Get all available locations from items.
     *
     * @return List of unique place names
     */
    public List<String> getAllAvailablePlaces() {
        MatchOperation matchValidPlace = Aggregation.match(
            Criteria.where("details.place").exists(true).ne("\"").ne(null)
        );
        GroupOperation groupByPlace = Aggregation.group("details.place");
        SortOperation sortByPlace = Aggregation.sort(Sort.Direction.ASC, "_id");

        Aggregation aggregation = Aggregation.newAggregation(
            matchValidPlace,
            groupByPlace,
            sortByPlace
        );

        AggregationResults<Document> results = mongoTemplate.aggregate(aggregation, Item.class, Document.class);

        List<String> places = new ArrayList<>();
        for (Document doc : results) {
            Object id = doc.get("_id");
            if (id != null) {
                places.add(id.toString());
            }
        }

        return places;
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
