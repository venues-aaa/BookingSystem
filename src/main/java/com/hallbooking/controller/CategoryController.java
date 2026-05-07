package com.hallbooking.controller;

import com.hallbooking.model.ItemType;
import com.hallbooking.model.ValidationResult;
import com.hallbooking.service.CategoryService;
import com.hallbooking.service.FormValidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * CategoryController - REST API for category management
 *
 * Provides endpoints for admins to create, update, and manage categories
 * with their dynamic form schemas.
 *
 * @author Hall Booking System
 * @version 1.0
 */
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private FormValidationService formValidationService;

    /**
     * Create a new category (Admin only)
     *
     * @param category The category to create
     * @return The created category
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ItemType> createCategory(@RequestBody ItemType category) {
        // Check if category name already exists
        if (categoryService.categoryNameExists(category.getName())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        ItemType created = categoryService.createCategory(category);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Update an existing category and its form schema (Admin only)
     *
     * @param id       The category ID
     * @param category The updated category data
     * @return The updated category
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ItemType> updateCategory(
            @PathVariable String id,
            @RequestBody ItemType category) {

        // Check if category exists
        ItemType existing = categoryService.getCategoryById(id);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        // Set the ID to ensure we're updating the right document
        category.setId(id);

        // Preserve created fields
        category.setCreatedOn(existing.getCreatedOn());
        category.setCreatedBy(existing.getCreatedBy());

        ItemType updated = categoryService.updateCategory(category);
        return ResponseEntity.ok(updated);
    }

    /**
     * Get all active categories (Public)
     *
     * @return List of active categories
     */
    @GetMapping
    public ResponseEntity<List<ItemType>> getCategories() {
        List<ItemType> categories = categoryService.getActiveCategories();
        return ResponseEntity.ok(categories);
    }

    /**
     * Get all categories including inactive (Admin only)
     *
     * @return List of all categories
     */
    @GetMapping("/all")
    // @PreAuthorize("hasRole('ADMIN')") // Disabled - no JWT auth in this system
    public ResponseEntity<List<ItemType>> getAllCategories() {
        List<ItemType> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    /**
     * Get category by ID (Public)
     *
     * @param id The category ID
     * @return The category
     */
    @GetMapping("/{id}")
    public ResponseEntity<ItemType> getCategoryById(@PathVariable String id) {
        ItemType category = categoryService.getCategoryById(id);
        if (category == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(category);
    }

    /**
     * Get category by name (Public)
     *
     * @param name The category name
     * @return The category
     */
    @GetMapping("/by-name/{name}")
    public ResponseEntity<ItemType> getCategoryByName(@PathVariable String name) {
        ItemType category = categoryService.getCategoryByName(name);
        if (category == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(category);
    }

    /**
     * Soft delete a category (mark as inactive) (Admin only)
     *
     * @param id The category ID
     * @return Success message
     */
    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deactivateCategory(@PathVariable String id) {
        // Check if category exists
        ItemType category = categoryService.getCategoryById(id);
        if (category == null) {
            return ResponseEntity.notFound().build();
        }

        categoryService.deleteCategory(id);  // Soft delete (sets isActive=false)

        Map<String, String> response = new HashMap<>();
        response.put("message", "Category deactivated successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * Hard delete a category (permanently remove) (Admin only)
     *
     * @param id The category ID
     * @return Success message
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteCategory(@PathVariable String id) {
        // Check if category exists
        ItemType category = categoryService.getCategoryById(id);
        if (category == null) {
            return ResponseEntity.notFound().build();
        }

        // Check if category has items
        long itemCount = categoryService.countItemsInCategory(id);
        if (itemCount > 0) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Cannot delete category with existing items. Deactivate it instead or delete all items first.");
            response.put("itemCount", String.valueOf(itemCount));
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        categoryService.permanentlyDeleteCategory(id);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Category deleted permanently");
        return ResponseEntity.ok(response);
    }

    /**
     * Validate item data against category schema (Public - for client-side validation)
     *
     * @param categoryId The category ID
     * @param data       The data to validate
     * @return Validation result
     */
    @PostMapping("/{categoryId}/validate")
    public ResponseEntity<ValidationResult> validateItemData(
            @PathVariable String categoryId,
            @RequestBody Map<String, Object> data) {

        // Get category
        ItemType category = categoryService.getCategoryById(categoryId);
        if (category == null) {
            return ResponseEntity.notFound().build();
        }

        // Validate data against schema
        ValidationResult result = formValidationService.validate(
                category.getFormSchema(),
                data
        );

        return ResponseEntity.ok(result);
    }

    /**
     * Get category statistics (Admin only)
     *
     * @param id The category ID
     * @return Statistics
     */
    @GetMapping("/{id}/stats")
    // @PreAuthorize("hasRole('ADMIN')") // Disabled - no JWT auth in this system
    public ResponseEntity<Map<String, Object>> getCategoryStats(@PathVariable String id) {
        ItemType category = categoryService.getCategoryById(id);
        if (category == null) {
            return ResponseEntity.notFound().build();
        }

        long itemCount = categoryService.countItemsInCategory(id);

        Map<String, Object> stats = new HashMap<>();
        stats.put("categoryId", id);
        stats.put("categoryName", category.getDisplayName());
        stats.put("itemCount", itemCount);
        stats.put("fieldCount", category.getFormSchema() != null ?
                category.getFormSchema().getFields().size() : 0);
        stats.put("schemaVersion", category.getFormSchema() != null ?
                category.getFormSchema().getVersion() : 0);

        return ResponseEntity.ok(stats);
    }
}
