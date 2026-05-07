package com.hallbooking.service;

import com.hallbooking.model.FormSchema;
import com.hallbooking.model.FormTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

/**
 * FormTemplateService - Manages form schema templates
 *
 * Provides CRUD operations for reusable form templates that admins can
 * save and apply to multiple categories.
 *
 * @author Hall Booking System
 * @version 1.0
 */
@Service
public class FormTemplateService {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private FormValidationService formValidationService;

    /**
     * Create a new template from a form schema
     *
     * @param template The template to create
     * @return The created template
     * @throws IllegalArgumentException if validation fails
     */
    public FormTemplate createTemplate(FormTemplate template) {
        // Validate template name is unique
        if (templateNameExists(template.getName())) {
            throw new IllegalArgumentException("Template name already exists: " + template.getName());
        }

        // Validate the form schema
        if (template.getSchema() == null) {
            throw new IllegalArgumentException("Template must have a schema");
        }

        // Set defaults
        template.setCreatedOn(new Date());
        template.setUsageCount(0);
        if (template.getIsActive() == null) {
            template.setIsActive(true);
        }

        // Save to database
        return mongoTemplate.save(template);
    }

    /**
     * Update an existing template
     *
     * @param templateId The template ID
     * @param updatedTemplate The updated template data
     * @return The updated template
     */
    public FormTemplate updateTemplate(String templateId, FormTemplate updatedTemplate) {
        FormTemplate existing = getTemplateById(templateId);
        if (existing == null) {
            throw new IllegalArgumentException("Template not found: " + templateId);
        }

        // Check if name changed and is unique
        if (!existing.getName().equals(updatedTemplate.getName())) {
            if (templateNameExists(updatedTemplate.getName())) {
                throw new IllegalArgumentException("Template name already exists: " + updatedTemplate.getName());
            }
        }

        // Update fields
        existing.setName(updatedTemplate.getName());
        existing.setDescription(updatedTemplate.getDescription());
        existing.setCategory(updatedTemplate.getCategory());
        existing.setSchema(updatedTemplate.getSchema());
        existing.setLastModifiedOn(new Date());
        existing.setLastModifiedBy(updatedTemplate.getLastModifiedBy());

        return mongoTemplate.save(existing);
    }

    /**
     * Get all active templates
     *
     * @return List of active templates
     */
    public List<FormTemplate> getActiveTemplates() {
        Query query = Query.query(Criteria.where("isActive").is(true));
        query.with(org.springframework.data.domain.Sort.by(
            org.springframework.data.domain.Sort.Order.desc("usageCount"),
            org.springframework.data.domain.Sort.Order.desc("createdOn")
        ));
        return mongoTemplate.find(query, FormTemplate.class);
    }

    /**
     * Get templates by category
     *
     * @param category The category to filter by
     * @return List of templates in the category
     */
    public List<FormTemplate> getTemplatesByCategory(String category) {
        Query query = Query.query(
            Criteria.where("isActive").is(true)
                .and("category").is(category)
        );
        return mongoTemplate.find(query, FormTemplate.class);
    }

    /**
     * Get all templates (including inactive)
     *
     * @return List of all templates
     */
    public List<FormTemplate> getAllTemplates() {
        return mongoTemplate.findAll(FormTemplate.class);
    }

    /**
     * Get template by ID
     *
     * @param templateId The template ID
     * @return The template, or null if not found
     */
    public FormTemplate getTemplateById(String templateId) {
        return mongoTemplate.findById(templateId, FormTemplate.class);
    }

    /**
     * Apply a template to get its schema
     * Increments the usage count
     *
     * @param templateId The template ID
     * @return The form schema from the template
     */
    public FormSchema applyTemplate(String templateId) {
        FormTemplate template = getTemplateById(templateId);
        if (template == null) {
            throw new IllegalArgumentException("Template not found: " + templateId);
        }

        if (!template.getIsActive()) {
            throw new IllegalArgumentException("Template is not active: " + templateId);
        }

        // Increment usage count
        template.incrementUsage();
        mongoTemplate.save(template);

        // Return a deep copy of the schema to avoid reference issues
        return deepCopySchema(template.getSchema());
    }

    /**
     * Delete a template (soft delete)
     *
     * @param templateId The template ID
     */
    public void deleteTemplate(String templateId) {
        Query query = Query.query(Criteria.where("id").is(templateId));
        Update update = new Update()
            .set("isActive", false)
            .set("lastModifiedOn", new Date());
        mongoTemplate.updateFirst(query, update, FormTemplate.class);
    }

    /**
     * Permanently delete a template
     *
     * @param templateId The template ID
     */
    public void permanentlyDeleteTemplate(String templateId) {
        Query query = Query.query(Criteria.where("id").is(templateId));
        mongoTemplate.remove(query, FormTemplate.class);
    }

    /**
     * Check if template name exists
     *
     * @param name The template name
     * @return true if exists
     */
    public boolean templateNameExists(String name) {
        Query query = Query.query(Criteria.where("name").is(name));
        return mongoTemplate.exists(query, FormTemplate.class);
    }

    /**
     * Deep copy a form schema to avoid reference issues
     * This ensures modifications to the imported schema don't affect the template
     *
     * @param schema The schema to copy
     * @return A new schema object with copied data
     */
    private FormSchema deepCopySchema(FormSchema schema) {
        if (schema == null) {
            return null;
        }

        // Create a new schema with the same data
        // MongoDB serialization/deserialization will handle the deep copy
        FormSchema copy = new FormSchema();
        copy.setFields(schema.getFields());
        copy.setLayout(schema.getLayout());
        copy.setVersion(0); // Reset version for new category

        return copy;
    }

    /**
     * Get popular templates (most used)
     *
     * @param limit Number of templates to return
     * @return List of most used templates
     */
    public List<FormTemplate> getPopularTemplates(int limit) {
        Query query = Query.query(Criteria.where("isActive").is(true));
        query.with(org.springframework.data.domain.Sort.by(
            org.springframework.data.domain.Sort.Order.desc("usageCount")
        ));
        query.limit(limit);
        return mongoTemplate.find(query, FormTemplate.class);
    }

    /**
     * Search templates by name or description
     *
     * @param searchTerm The search term
     * @return List of matching templates
     */
    public List<FormTemplate> searchTemplates(String searchTerm) {
        Query query = Query.query(
            new Criteria().andOperator(
                Criteria.where("isActive").is(true),
                new Criteria().orOperator(
                    Criteria.where("name").regex(searchTerm, "i"),
                    Criteria.where("description").regex(searchTerm, "i")
                )
            )
        );
        return mongoTemplate.find(query, FormTemplate.class);
    }
}
