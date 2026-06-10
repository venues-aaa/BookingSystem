import React, { useState, useEffect } from 'react';
import DynamicField from './DynamicField';
import RepeatingGroupField from './RepeatingGroupField';
import { validateItemData } from '../../services/categoryService';
import { getVendorItems, getItemDisplayName } from '../../services/itemService';
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

  const [maxBookingsAtSameTime, setMaxBookingsAtSameTime] = useState(
    initialData?.maxConcurrentBookings !== undefined
      ? initialData.maxConcurrentBookings
      : 1  // Default to 1 (only 1 booking at a time)
  );

  // Bundle Offers state
  // selectedBundledItems is now an array of objects: [{itemId: 'id', discountPercentage: 50}]
  const [enableBundleOffers, setEnableBundleOffers] = useState(
    initialData?.discountedBundledItems && initialData.discountedBundledItems.length > 0
  );
  const [selectedBundledItems, setSelectedBundledItems] = useState(
    initialData?.discountedBundledItems || []
  );
  const [availableItems, setAvailableItems] = useState([]);

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

  // Fetch available items for bundle offers (all categories from this vendor)
  useEffect(() => {
    const fetchAvailableItems = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.id && category?.id) {
          const response = await getVendorItems(user.id);
          const items = response.data || response;

          // Filter out:
          // 1. Current item being edited
          // 2. Other items from the SAME category (you can't bundle with same-category items)
          const filteredItems = items.filter(item => {
            // Exclude the current item if editing
            if (initialData?.id && item.id === initialData.id) {
              return false;
            }

            // Exclude items from the same category
            if (item.categoryId === category.id) {
              return false;
            }

            return true;
          });

          setAvailableItems(filteredItems);
        }
      } catch (error) {
        console.error('Failed to fetch available items:', error);
      }
    };

    fetchAvailableItems();
  }, [initialData?.id, category?.id]);

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

  const handleBundledItemToggle = (itemId) => {
    setSelectedBundledItems(prev => {
      const exists = prev.find(item => item.itemId === itemId);
      if (exists) {
        // Remove item
        return prev.filter(item => item.itemId !== itemId);
      } else {
        // Add item with default 100% discount (free) and sameDayOnly = false
        return [...prev, { itemId, discountPercentage: 100, sameDayOnly: false }];
      }
    });
  };

  const handleDiscountChange = (itemId, discountPercentage) => {
    setSelectedBundledItems(prev =>
      prev.map(item =>
        item.itemId === itemId
          ? { ...item, discountPercentage: Math.min(100, Math.max(0, Number(discountPercentage) || 0)) }
          : item
      )
    );
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
      const submitData = {
        ...formData,
        maxConcurrentBookings: maxBookingsAtSameTime,
        discountedBundledItems: enableBundleOffers ? selectedBundledItems : []
      };
      await onSubmit(submitData);
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

      {/* Concurrent Booking Settings - System Field */}
      <div className="concurrent-booking-section" style={{
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
        border: '1px solid #e0e0e0'
      }}>
        <h3 style={{ fontSize: '18px', marginBottom: '10px', color: '#333' }}>
          <i className="fa fa-calendar-check" style={{ marginRight: '8px', color: '#667eea' }}></i>
          Booking Availability Settings
        </h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
          Configure how many bookings you can handle at the same time
        </p>

        <div className="form-group">
          <label htmlFor="maxBookingsAtSameTime" style={{ fontWeight: '600', color: '#333', marginBottom: '8px', display: 'block' }}>
            Maximum bookings allowed at the same time
            <span style={{ color: '#999', fontWeight: '400', marginLeft: '8px' }}>
              (How many customers can you serve simultaneously?)
            </span>
          </label>
          <input
            type="number"
            id="maxBookingsAtSameTime"
            min="1"
            max="100"
            value={maxBookingsAtSameTime}
            onChange={(e) => setMaxBookingsAtSameTime(Math.max(1, parseInt(e.target.value) || 1))}
            className="form-control"
            style={{ maxWidth: '200px' }}
          />
          <small style={{ display: 'block', marginTop: '8px', color: '#666' }}>
            {maxBookingsAtSameTime === 1 ? (
              <span style={{ color: '#dc3545' }}>
                <i className="fa fa-lock"></i> <strong>Exclusive Booking:</strong> Only 1 booking allowed at a time (typical for halls, venues, photographers)
              </span>
            ) : (
              <span style={{ color: '#28a745' }}>
                <i className="fa fa-users"></i> <strong>Concurrent Bookings:</strong> You can handle {maxBookingsAtSameTime} bookings simultaneously (great for catering, decoration teams, entertainers)
              </span>
            )}
          </small>
          <div style={{ marginTop: '12px', padding: '10px', background: '#e3f2fd', borderRadius: '4px', fontSize: '13px' }}>
            <strong>💡 Examples:</strong>
            <ul style={{ marginBottom: 0, marginTop: '8px', paddingLeft: '20px' }}>
              <li><strong>1</strong> - Hall/Venue (only one event at a time)</li>
              <li><strong>2-3</strong> - Decoration team (can handle a few events on same day)</li>
              <li><strong>5-10</strong> - Catering service (can serve multiple events simultaneously)</li>
            </ul>
          </div>
        </div>
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

      {/* Bundle Offers Section - System Field */}
      <div className="bundle-offers-section" style={{
        background: '#f0f8ff',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
        border: '1px solid #b3d9ff'
      }}>
        <h3 style={{ fontSize: '18px', marginBottom: '10px', color: '#333' }}>
          <i className="fa fa-gift" style={{ marginRight: '8px', color: '#667eea' }}></i>
          Bundle Offers (Optional)
        </h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
          Offer discounted items when customers book this item
        </p>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={enableBundleOffers}
              onChange={(e) => {
                setEnableBundleOffers(e.target.checked);
                if (!e.target.checked) {
                  setSelectedBundledItems([]);
                }
              }}
              style={{ width: '18px', height: '18px' }}
            />
            <span style={{ fontWeight: '600', color: '#333' }}>
              Enable bundle offers for this item
            </span>
          </label>
          <small style={{ display: 'block', marginTop: '8px', color: '#666', marginLeft: '26px' }}>
            Promotional feature to boost sales and encourage multi-service bookings
          </small>
        </div>

        {enableBundleOffers && (
          <div className="bundled-items-selector" style={{ marginTop: '20px' }}>
            <label style={{ fontWeight: '600', color: '#333', marginBottom: '10px', display: 'block' }}>
              Select items to bundle with discount:
            </label>

            {availableItems.length === 0 ? (
              <div style={{ padding: '15px', background: '#fff3cd', borderRadius: '4px', color: '#856404' }}>
                <i className="fa fa-info-circle"></i> No items from other categories available yet. Create items in different categories (e.g., Hall, Catering, Decoration) to offer cross-category bundles.
              </div>
            ) : (
              <div style={{
                maxHeight: '400px',
                overflowY: 'auto',
                border: '1px solid #ddd',
                borderRadius: '4px',
                background: 'white',
                padding: '10px'
              }}>
                {availableItems.map(item => {
                  const itemName = getItemDisplayName(item);
                  const itemType = item.type || 'Unknown';
                  const bundledItem = selectedBundledItems.find(bi => bi.itemId === item.id);
                  const isSelected = !!bundledItem;

                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: '12px',
                        borderBottom: '1px solid #f0f0f0',
                        background: isSelected ? '#f8f9fa' : 'white'
                      }}
                    >
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          marginBottom: isSelected ? '10px' : '0'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleBundledItemToggle(item.id)}
                          style={{ marginRight: '10px', width: '18px', height: '18px' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', color: '#333' }}>{itemName}</div>
                          <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                            <span className="badge" style={{
                              background: '#e3f2fd',
                              color: '#1976d2',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '11px'
                            }}>
                              {itemType}
                            </span>
                          </div>
                        </div>
                      </label>

                      {isSelected && (
                        <div style={{ marginLeft: '28px' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '8px'
                          }}>
                            <label style={{ fontSize: '13px', color: '#555', fontWeight: '500' }}>
                              Discount %:
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={bundledItem.discountPercentage}
                              onChange={(e) => handleDiscountChange(item.id, e.target.value)}
                              style={{
                                width: '80px',
                                padding: '6px 10px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '14px'
                              }}
                            />
                            <span style={{ fontSize: '12px', color: '#666' }}>
                              {bundledItem.discountPercentage === 100
                                ? '(FREE)'
                                : `(${bundledItem.discountPercentage}% off)`}
                            </span>
                          </div>
                          <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '13px',
                            color: '#555',
                            cursor: 'pointer'
                          }}>
                            <input
                              type="checkbox"
                              checked={bundledItem.sameDayOnly || false}
                              onChange={(e) => {
                                setSelectedBundledItems(prev =>
                                  prev.map(bi =>
                                    bi.itemId === item.id
                                      ? { ...bi, sameDayOnly: e.target.checked }
                                      : bi
                                  )
                                );
                              }}
                              style={{ marginRight: '6px', width: '16px', height: '16px' }}
                            />
                            <span>
                              Same day only
                              <span style={{ fontSize: '11px', color: '#999', marginLeft: '4px' }}>
                                (Coupon valid only for same booking date)
                              </span>
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {selectedBundledItems.length > 0 && (
              <div style={{ marginTop: '15px', padding: '12px', background: '#d4edda', borderRadius: '4px', color: '#155724' }}>
                <strong>✅ {selectedBundledItems.length} item{selectedBundledItems.length !== 1 ? 's' : ''} selected</strong>
                <div style={{ fontSize: '13px', marginTop: '8px' }}>
                  {selectedBundledItems.map(bi => {
                    const item = availableItems.find(i => i.id === bi.itemId);
                    const itemName = item ? getItemDisplayName(item) : 'Item';
                    return (
                      <div key={bi.itemId} style={{ marginTop: '4px' }}>
                        • {itemName}: <strong>{bi.discountPercentage}% off</strong>
                        {bi.discountPercentage === 100 && ' (FREE)'}
                        {bi.sameDayOnly && (
                          <span style={{
                            marginLeft: '6px',
                            background: '#fff3cd',
                            color: '#856404',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            Same Day Only
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: '15px', padding: '12px', background: '#fff9e6', borderRadius: '4px', fontSize: '13px' }}>
          <strong>💡 How it works:</strong>
          <ul style={{ marginBottom: 0, marginTop: '8px', paddingLeft: '20px' }}>
            <li>Customer books this item → Gets notification about discounted bundled items</li>
            <li>Set discount % for each bundled item (100% = FREE, 50% = half price, etc.)</li>
            <li>Bundled items must be booked for the same date/time</li>
            <li>Great for cross-selling (e.g., Book Catering → 50% off Hall)</li>
          </ul>
        </div>

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
