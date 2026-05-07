package com.hallbooking.service;

import com.hallbooking.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * CategoryService - Manages item categories and their form schemas
 *
 * Provides CRUD operations for categories and validates form schemas
 * designed by administrators.
 *
 * @author Hall Booking System
 * @version 1.0
 */
@Service
public class CategoryService {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private FormValidationService formValidationService;

    /**
     * Create a new category with form schema
     *
     * @param category The category to create
     * @return The created category
     * @throws IllegalArgumentException if schema validation fails
     */
    public ItemType createCategory(ItemType category) {
        // Validate form schema structure
        validateFormSchema(category.getFormSchema());

        // Set audit fields
        category.setCreatedOn(new Date());
        if (category.getIsActive() == null) {
            category.setIsActive(true);
        }

        // Save to database
        return mongoTemplate.save(category);
    }

    /**
     * Update an existing category and its form schema
     *
     * @param category The category with updated data
     * @return The updated category
     * @throws IllegalArgumentException if schema validation fails
     */
    public ItemType updateCategory(ItemType category) {
        // Validate form schema structure
        validateFormSchema(category.getFormSchema());

        // Set audit fields
        category.setLastModifiedOn(new Date());

        // Increment schema version
        if (category.getFormSchema() != null) {
            Integer currentVersion = category.getFormSchema().getVersion();
            if (currentVersion == null) {
                currentVersion = 0;
            }
            category.getFormSchema().setVersion(currentVersion + 1);
        }

        // Save to database
        return mongoTemplate.save(category);
    }

    /**
     * Get all active categories
     *
     * @return List of active categories
     */
    public List<ItemType> getActiveCategories() {
        Query query = Query.query(Criteria.where("isActive").is(true));
        return mongoTemplate.find(query, ItemType.class);
    }

    /**
     * Get all categories (including inactive)
     *
     * @return List of all categories
     */
    public List<ItemType> getAllCategories() {
        return mongoTemplate.findAll(ItemType.class);
    }

    /**
     * Get category by ID
     *
     * @param categoryId The category ID
     * @return The category, or null if not found
     */
    public ItemType getCategoryById(String categoryId) {
        return mongoTemplate.findById(categoryId, ItemType.class);
    }

    /**
     * Get category by name
     *
     * @param name The category name
     * @return The category, or null if not found
     */
    public ItemType getCategoryByName(String name) {
        Query query = Query.query(Criteria.where("name").is(name));
        return mongoTemplate.findOne(query, ItemType.class);
    }

    /**
     * Soft delete a category (set isActive to false)
     *
     * @param categoryId The category ID to delete
     */
    public void deleteCategory(String categoryId) {
        Query query = Query.query(Criteria.where("id").is(categoryId));
        Update update = new Update()
            .set("isActive", false)
            .set("lastModifiedOn", new Date());
        mongoTemplate.updateFirst(query, update, ItemType.class);
    }

    /**
     * Hard delete a category (permanently remove from database)
     * WARNING: This will break any items referencing this category!
     *
     * @param categoryId The category ID to delete
     */
    public void permanentlyDeleteCategory(String categoryId) {
        Query query = Query.query(Criteria.where("id").is(categoryId));
        mongoTemplate.remove(query, ItemType.class);
    }

    /**
     * Validate that a form schema is structurally correct
     *
     * @param schema The schema to validate
     * @throws IllegalArgumentException if validation fails
     */
    private void validateFormSchema(FormSchema schema) {
        if (schema == null) {
            throw new IllegalArgumentException("Form schema cannot be null");
        }

        // Allow empty fields on initial creation - they can be added later in form builder
        if (schema.getFields() == null) {
            throw new IllegalArgumentException("Form schema fields cannot be null");
        }

        // If no fields yet, skip validation - this is a new category
        if (schema.getFields().isEmpty()) {
            return;
        }

        // Validate field IDs are unique
        Set<String> fieldIds = new HashSet<>();
        for (FormField field : schema.getFields()) {
            if (field.getId() == null || field.getId().trim().isEmpty()) {
                throw new IllegalArgumentException("All fields must have an ID");
            }

            if (!fieldIds.add(field.getId())) {
                throw new IllegalArgumentException("Duplicate field ID: " + field.getId());
            }

            if (field.getType() == null || field.getType().trim().isEmpty()) {
                throw new IllegalArgumentException("Field must have a type: " + field.getId());
            }

            if (field.getLabel() == null || field.getLabel().trim().isEmpty()) {
                throw new IllegalArgumentException("Field must have a label: " + field.getId());
            }

            // Validate field type is supported
            validateFieldType(field);

            // Validate nested fields for repeating groups
            if ("repeatingGroup".equals(field.getType())) {
                if (field.getNestedFields() == null || field.getNestedFields().isEmpty()) {
                    throw new IllegalArgumentException(
                        "Repeating group field must have nested fields: " + field.getId());
                }
                validateNestedFields(field.getNestedFields());
            }

            // Validate select/radio/checkbox/paymentTerms have options
            if (Arrays.asList("select", "radio", "checkbox", "paymentTerms").contains(field.getType())) {
                if (field.getOptions() == null || field.getOptions().isEmpty()) {
                    throw new IllegalArgumentException(
                        "Field type '" + field.getType() + "' requires options: " + field.getId());
                }
            }
        }

        // Validate layout configuration
        if (schema.getLayout() == null) {
            // Set default layout
            schema.setLayout(LayoutConfig.createDefault());
        }
    }

    /**
     * Validate that a field type is supported
     */
    private void validateFieldType(FormField field) {
        List<String> supportedTypes = Arrays.asList(
            "text", "number", "textarea", "select", "radio", "checkbox",
            "timingOption", "file", "timeRange", "repeatingGroup", "paymentTerms"
        );

        if (!supportedTypes.contains(field.getType())) {
            throw new IllegalArgumentException(
                "Unsupported field type '" + field.getType() + "' for field: " + field.getId());
        }
    }

    /**
     * Validate nested fields in repeating groups
     */
    private void validateNestedFields(List<FormField> nestedFields) {
        Set<String> nestedFieldIds = new HashSet<>();

        for (FormField nestedField : nestedFields) {
            if (nestedField.getId() == null || nestedField.getId().trim().isEmpty()) {
                throw new IllegalArgumentException("All nested fields must have an ID");
            }

            if (!nestedFieldIds.add(nestedField.getId())) {
                throw new IllegalArgumentException("Duplicate nested field ID: " + nestedField.getId());
            }

            if (nestedField.getType() == null || nestedField.getType().trim().isEmpty()) {
                throw new IllegalArgumentException(
                    "Nested field must have a type: " + nestedField.getId());
            }

            // Nested fields cannot be repeating groups (no nesting repeating groups)
            if ("repeatingGroup".equals(nestedField.getType())) {
                throw new IllegalArgumentException(
                    "Repeating groups cannot contain nested repeating groups: " + nestedField.getId());
            }

            validateFieldType(nestedField);
        }
    }

    /**
     * Check if a category name already exists
     *
     * @param name The category name to check
     * @return true if the name exists
     */
    public boolean categoryNameExists(String name) {
        Query query = Query.query(Criteria.where("name").is(name));
        return mongoTemplate.exists(query, ItemType.class);
    }

    /**
     * Count items in a category
     *
     * @param categoryId The category ID
     * @return Number of items in the category
     */
    public long countItemsInCategory(String categoryId) {
        Query query = Query.query(Criteria.where("categoryId").is(categoryId));
        return mongoTemplate.count(query, Item.class);
    }
}
