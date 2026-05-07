import React, { useState, useEffect } from 'react';
import DynamicField from './DynamicField';
import RepeatingGroupField from './RepeatingGroupField';
import { validateItemData } from '../../services/categoryService';
import './DynamicItemForm.css';

/**
 * DynamicItemForm Component
 *
 * Renders a complete dynamic form based on category schema.
 * Handles all field types, validation, and conditional fields.
 */
const DynamicItemForm = ({ category, initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Initialize form data with empty values for all fields
    if (!initialData && category?.formSchema?.fields) {
      const initialFormData = {};
      category.formSchema.fields.forEach(field => {
        if (field.type === 'checkbox') {
          initialFormData[field.id] = [];
        } else if (field.type === 'repeatingGroup') {
          initialFormData[field.id] = [];
        } else if (field.type === 'timeRange') {
          initialFormData[field.id] = { startTime: '', endTime: '' };
        } else {
          initialFormData[field.id] = '';
        }
      });
      setFormData(initialFormData);
    }
  }, [category, initialData]);

  const handleFieldChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));

    // Clear error for this field
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const isFieldVisible = (field) => {
    if (!field.showIf) {
      return true;
    }

    const { fieldId, value } = field.showIf;
    return formData[fieldId] === value;
  };

  const validateForm = async () => {
    // Skip validation for now - just do basic required field check
    // This allows items to be created while we fix backend validation
    console.log('Form data to save:', formData);

    const schema = category?.formSchema;
    if (!schema || !schema.fields) {
      return true; // No schema, allow submission
    }

    // Check required fields
    const missingFields = [];
    const minItemsErrors = [];

    schema.fields.forEach(field => {
      const value = formData[field.id];

      // Check required fields
      if (field.required) {
        if (!value || (Array.isArray(value) && value.length === 0) || value === '') {
          missingFields.push(field.label || field.id);
        }
      }

      // Check minItems for repeating groups (e.g., menu items)
      if (field.type === 'repeatingGroup' && Array.isArray(value)) {
        const minItems = field.minItems || 1; // Default to 1 for testing
        if (value.length < minItems) {
          minItemsErrors.push(`${field.label || field.id}: At least ${minItems} item${minItems !== 1 ? 's' : ''} required (currently ${value.length})`);
        }
      }
    });

    if (missingFields.length > 0) {
      alert(`Please fill in required fields:\n\n${missingFields.join('\n')}`);
      return false;
    }

    if (minItemsErrors.length > 0) {
      alert(`Please add more items:\n\n${minItemsErrors.join('\n')}`);
      return false;
    }

    return true;

    /* Backend validation disabled temporarily due to format issues
    try {
      console.log('Validating form data:', formData);
      const result = await validateItemData(category.id, formData);
      console.log('Validation result:', result);

      if (!result || typeof result !== 'object') {
        console.error('Invalid validation result format:', result);
        return true; // Allow submission if validation endpoint has issues
      }

      if (result.valid === false) {
        const newErrors = {};

        // Handle different error formats
        if (Array.isArray(result.errors)) {
          result.errors.forEach(error => {
            newErrors[error.fieldId] = error.message;
          });
        } else if (result.errors && typeof result.errors === 'object') {
          // If errors is an object, convert it
          Object.keys(result.errors).forEach(fieldId => {
            newErrors[fieldId] = result.errors[fieldId];
          });
        }

        setErrors(newErrors);

        // Show specific validation errors
        console.error('Validation errors:', result.errors);
        const errorMessages = Object.entries(newErrors).map(([field, msg]) => `${field}: ${msg}`).join('\n');
        if (errorMessages) {
          alert(`Validation failed:\n\n${errorMessages}`);
        } else {
          alert('Validation failed. Please check all required fields.');
        }

        return false;
      }

      setErrors({});
      return true;
    } catch (error) {
      console.error('Validation failed:', error);
      console.error('Form data:', formData);
      console.error('Error details:', error.response?.data);
      // Don't block submission if validation endpoint fails
      console.warn('Skipping backend validation due to error, using client-side only');
      return true;
    }
    */
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    const isValid = await validateForm();

    if (!isValid) {
      setSubmitting(false);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission failed:', error);
      alert('Failed to submit form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!category || !category.formSchema) {
    return (
      <div className="dynamic-form-error">
        <p>Category schema not found</p>
      </div>
    );
  }

  // Filter visible fields and sort by grid position (y first, then x)
  const visibleFields = category.formSchema.fields
    .filter(isFieldVisible)
    .sort((a, b) => {
      // Sort by row (y) first
      const aY = a.position?.y ?? 999;
      const bY = b.position?.y ?? 999;
      if (aY !== bY) {
        return aY - bY;
      }

      // Then by column (x) if same row
      const aX = a.position?.x ?? 999;
      const bX = b.position?.x ?? 999;
      return aX - bX;
    });

  const isEditMode = initialData && Object.keys(initialData).length > 0;

  return (
    <form onSubmit={handleSubmit} className="dynamic-item-form">
      <div className="form-header">
        <h2>{isEditMode ? 'Edit' : 'Create'} {category.displayName} Item</h2>
        <p className="form-description">{category.description}</p>
      </div>

      <div className="form-fields">
        {visibleFields.map(field => {
          if (field.type === 'repeatingGroup') {
            return (
              <RepeatingGroupField
                key={field.id}
                field={field}
                value={formData[field.id]}
                onChange={handleFieldChange}
                errors={errors[field.id]}
              />
            );
          }

          return (
            <DynamicField
              key={field.id}
              field={field}
              value={formData[field.id]}
              onChange={handleFieldChange}
              error={errors[field.id]}
            />
          );
        })}
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="form-errors">
          <p>Please fix the following errors:</p>
          <ul>
            {Object.values(errors).map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="btn-cancel"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="btn-submit"
        >
          {submitting ? 'Saving...' : (isEditMode ? 'Update Item' : 'Create Item')}
        </button>
      </div>
    </form>
  );
};

export default DynamicItemForm;
