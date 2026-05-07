package com.hallbooking.controller;

import com.hallbooking.model.FormSchema;
import com.hallbooking.model.FormTemplate;
import com.hallbooking.model.ResponseModel;
import com.hallbooking.service.FormTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * FormTemplateController - REST endpoints for form template management
 *
 * Provides APIs for admins to save, retrieve, and apply form templates.
 *
 * @author Hall Booking System
 * @version 1.0
 */
@RestController
@RequestMapping("/api/form-templates")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FormTemplateController {

    @Autowired
    private FormTemplateService formTemplateService;

    /**
     * Get all active templates
     *
     * GET /api/form-templates
     */
    @GetMapping
    public ResponseEntity<ResponseModel<List<FormTemplate>>> getAllTemplates() {
        try {
            List<FormTemplate> templates = formTemplateService.getActiveTemplates();
            return ResponseEntity.ok(
                new ResponseModel<>("Templates retrieved successfully", templates)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseModel<>("Failed to retrieve templates: " + e.getMessage(), null));
        }
    }

    /**
     * Get templates by category
     *
     * GET /api/form-templates/category/{category}
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<ResponseModel<List<FormTemplate>>> getTemplatesByCategory(
            @PathVariable String category) {
        try {
            List<FormTemplate> templates = formTemplateService.getTemplatesByCategory(category);
            return ResponseEntity.ok(
                new ResponseModel<>("Templates retrieved successfully", templates)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseModel<>("Failed to retrieve templates: " + e.getMessage(), null));
        }
    }

    /**
     * Get popular templates
     *
     * GET /api/form-templates/popular?limit=5
     */
    @GetMapping("/popular")
    public ResponseEntity<ResponseModel<List<FormTemplate>>> getPopularTemplates(
            @RequestParam(defaultValue = "5") int limit) {
        try {
            List<FormTemplate> templates = formTemplateService.getPopularTemplates(limit);
            return ResponseEntity.ok(
                new ResponseModel<>("Popular templates retrieved successfully", templates)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseModel<>("Failed to retrieve templates: " + e.getMessage(), null));
        }
    }

    /**
     * Search templates
     *
     * GET /api/form-templates/search?q=event
     */
    @GetMapping("/search")
    public ResponseEntity<ResponseModel<List<FormTemplate>>> searchTemplates(
            @RequestParam String q) {
        try {
            List<FormTemplate> templates = formTemplateService.searchTemplates(q);
            return ResponseEntity.ok(
                new ResponseModel<>("Search results retrieved successfully", templates)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseModel<>("Failed to search templates: " + e.getMessage(), null));
        }
    }

    /**
     * Get template by ID
     *
     * GET /api/form-templates/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ResponseModel<FormTemplate>> getTemplateById(@PathVariable String id) {
        try {
            FormTemplate template = formTemplateService.getTemplateById(id);
            if (template == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseModel<>("Template not found", null));
            }
            return ResponseEntity.ok(
                new ResponseModel<>("Template retrieved successfully", template)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseModel<>("Failed to retrieve template: " + e.getMessage(), null));
        }
    }

    /**
     * Create a new template (Admin only)
     *
     * POST /api/form-templates
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseModel<FormTemplate>> createTemplate(
            @RequestBody FormTemplate template,
            Authentication authentication) {
        try {
            // Set creator info
            template.setCreatedBy(authentication.getName());
            template.setCreatedByUsername(authentication.getName());

            FormTemplate created = formTemplateService.createTemplate(template);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ResponseModel<>("Template created successfully", created));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseModel<>(e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseModel<>("Failed to create template: " + e.getMessage(), null));
        }
    }

    /**
     * Update an existing template (Admin only)
     *
     * PUT /api/form-templates/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseModel<FormTemplate>> updateTemplate(
            @PathVariable String id,
            @RequestBody FormTemplate template,
            Authentication authentication) {
        try {
            template.setLastModifiedBy(authentication.getName());
            FormTemplate updated = formTemplateService.updateTemplate(id, template);
            return ResponseEntity.ok(
                new ResponseModel<>("Template updated successfully", updated)
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseModel<>(e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseModel<>("Failed to update template: " + e.getMessage(), null));
        }
    }

    /**
     * Apply a template (get schema and increment usage count)
     *
     * POST /api/form-templates/{id}/apply
     */
    @PostMapping("/{id}/apply")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseModel<FormSchema>> applyTemplate(@PathVariable String id) {
        try {
            FormSchema schema = formTemplateService.applyTemplate(id);
            return ResponseEntity.ok(
                new ResponseModel<>("Template applied successfully", schema)
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseModel<>(e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseModel<>("Failed to apply template: " + e.getMessage(), null));
        }
    }

    /**
     * Delete a template (soft delete, Admin only)
     *
     * DELETE /api/form-templates/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseModel<Void>> deleteTemplate(@PathVariable String id) {
        try {
            formTemplateService.deleteTemplate(id);
            return ResponseEntity.ok(
                new ResponseModel<>("Template deleted successfully", null)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseModel<>("Failed to delete template: " + e.getMessage(), null));
        }
    }
}
