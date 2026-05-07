import React from 'react';
import './FieldPropertiesPanel.css';

/**
 * FieldPropertiesPanel Component
 *
 * Panel for configuring field properties (label, validation, options, etc.)
 * Shown when a field is selected in the canvas.
 */
export default function FieldPropertiesPanel({ field, onFieldUpdate }) {

  if (!field) {
    return (
      <div className="properties-panel">
        <div className="properties-empty">
          <div className="properties-empty-icon">⚙️</div>
          <h4>No Field Selected</h4>
          <p>Click on a field in the canvas to configure its properties</p>
        </div>
      </div>
    );
  }

  const handleChange = (property, value) => {
    onFieldUpdate(field.id, {
      ...field,
      [property]: value
    });
  };

  const handleValidationChange = (rule, value) => {
    onFieldUpdate(field.id, {
      ...field,
      validation: {
        ...field.validation,
        [rule]: value === '' ? undefined : value
      }
    });
  };

  const handleBookingValidationChange = (rule, value) => {
    onFieldUpdate(field.id, {
      ...field,
      bookingValidationRules: {
        ...field.bookingValidationRules,
        [rule]: value === '' ? undefined : value
      }
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...(field.options || [])];
    newOptions[index] = value;
    handleChange('options', newOptions);
  };

  const addOption = () => {
    const newOptions = [...(field.options || []), 'New Option'];
    handleChange('options', newOptions);
  };

  const removeOption = (index) => {
    const newOptions = field.options.filter((_, i) => i !== index);
    handleChange('options', newOptions);
  };

  const handleNestedFieldChange = (index, property, value) => {
    const newNestedFields = [...(field.nestedFields || [])];
    newNestedFields[index] = {
      ...newNestedFields[index],
      [property]: value
    };
    handleChange('nestedFields', newNestedFields);
  };

  const addNestedField = () => {
    const newNestedFields = [...(field.nestedFields || []), {
      id: `nested_${Date.now()}`,
      type: 'text',
      label: 'New Field',
      required: false
    }];
    handleChange('nestedFields', newNestedFields);
  };

  const removeNestedField = (index) => {
    const newNestedFields = field.nestedFields.filter((_, i) => i !== index);
    handleChange('nestedFields', newNestedFields);
  };

  return (
    <div className="properties-panel">
      <h3 className="properties-title">Field Properties</h3>

      {/* Field Type (Read-only) */}
      <div className="property-group">
        <label className="property-label">Field Type</label>
        <input
          type="text"
          value={field.type}
          disabled
          className="property-input disabled"
        />
      </div>

      {/* Field ID (Read-only) */}
      <div className="property-group">
        <label className="property-label">Field ID</label>
        <input
          type="text"
          value={field.id}
          disabled
          className="property-input disabled"
        />
        <small className="property-help">Used to store data</small>
      </div>

      {/* Label */}
      <div className="property-group">
        <label className="property-label">Label *</label>
        <input
          type="text"
          value={field.label || ''}
          onChange={(e) => handleChange('label', e.target.value)}
          className="property-input"
          placeholder="Enter label"
        />
      </div>

      {/* Placeholder (for text/number fields) */}
      {['text', 'textarea', 'number'].includes(field.type) && (
        <div className="property-group">
          <label className="property-label">Placeholder</label>
          <input
            type="text"
            value={field.placeholder || ''}
            onChange={(e) => handleChange('placeholder', e.target.value)}
            className="property-input"
            placeholder="Enter placeholder text"
          />
        </div>
      )}

      {/* Help Text */}
      <div className="property-group">
        <label className="property-label">Help Text</label>
        <textarea
          value={field.helpText || ''}
          onChange={(e) => handleChange('helpText', e.target.value)}
          className="property-textarea"
          placeholder="Optional help text shown below the field"
          rows="2"
        />
      </div>

      {/* Required Checkbox */}
      <div className="property-group">
        <label className="property-checkbox-label">
          <input
            type="checkbox"
            checked={field.required || false}
            onChange={(e) => handleChange('required', e.target.checked)}
          />
          <span>Required Field</span>
        </label>
      </div>

      {/* Text Field Validation */}
      {field.type === 'text' && (
        <>
          <div className="property-section-title">Validation Rules</div>
          <div className="property-group">
            <label className="property-label">Minimum Length</label>
            <input
              type="number"
              value={field.validation?.minLength || ''}
              onChange={(e) => handleValidationChange('minLength', parseInt(e.target.value))}
              className="property-input"
              min="0"
            />
          </div>
          <div className="property-group">
            <label className="property-label">Maximum Length</label>
            <input
              type="number"
              value={field.validation?.maxLength || ''}
              onChange={(e) => handleValidationChange('maxLength', parseInt(e.target.value))}
              className="property-input"
              min="0"
            />
          </div>
        </>
      )}

      {/* Number Field Validation */}
      {field.type === 'number' && (
        <>
          <div className="property-section-title">Validation Rules</div>
          <div className="property-group">
            <label className="property-label">Minimum Value</label>
            <input
              type="number"
              value={field.validation?.min || ''}
              onChange={(e) => handleValidationChange('min', parseFloat(e.target.value))}
              className="property-input"
            />
          </div>
          <div className="property-group">
            <label className="property-label">Maximum Value</label>
            <input
              type="number"
              value={field.validation?.max || ''}
              onChange={(e) => handleValidationChange('max', parseFloat(e.target.value))}
              className="property-input"
            />
          </div>
        </>
      )}

      {/* Options (for select, radio, checkbox) */}
      {['select', 'radio', 'checkbox'].includes(field.type) && (
        <>
          <div className="property-section-title">Options</div>
          <div className="property-options">
            {(field.options || []).map((option, index) => (
              <div key={index} className="property-option-row">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="property-input"
                  placeholder={`Option ${index + 1}`}
                />
                <button
                  onClick={() => removeOption(index)}
                  className="property-button-remove"
                  title="Remove option"
                >
                  ×
                </button>
              </div>
            ))}
            <button onClick={addOption} className="property-button-add">
              + Add Option
            </button>
          </div>
        </>
      )}

      {/* Payment Terms Options */}
      {field.type === 'paymentTerms' && (
        <>
          <div className="property-section-title">Payment Options</div>
          <div className="property-options">
            {(field.options || []).map((option, index) => (
              <div key={index} className="property-option-row">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="property-input"
                  placeholder={`Payment option ${index + 1}`}
                />
                <button
                  onClick={() => removeOption(index)}
                  className="property-button-remove"
                  title="Remove option"
                >
                  ×
                </button>
              </div>
            ))}
            <button onClick={addOption} className="property-button-add">
              + Add Payment Option
            </button>
          </div>
          <div className="property-group">
            <label className="property-checkbox-label">
              <input
                type="checkbox"
                checked={field.allowCustom || false}
                onChange={(e) => handleChange('allowCustom', e.target.checked)}
              />
              <span>Allow Custom Terms</span>
            </label>
            <small className="property-help">
              If enabled, users can enter their own custom payment terms when "Custom Terms" is selected
            </small>
          </div>
        </>
      )}

      {/* Repeating Group */}
      {field.type === 'repeatingGroup' && (
        <>
          <div className="property-section-title">Repeating Group Settings</div>
          <div className="property-group">
            <label className="property-label">Minimum Items</label>
            <input
              type="number"
              value={field.minItems || 1}
              onChange={(e) => handleChange('minItems', parseInt(e.target.value))}
              className="property-input"
              min="0"
            />
          </div>
          <div className="property-group">
            <label className="property-label">Maximum Items</label>
            <input
              type="number"
              value={field.maxItems || 10}
              onChange={(e) => handleChange('maxItems', parseInt(e.target.value))}
              className="property-input"
              min="1"
            />
          </div>

          <div className="property-group">
            <label className="property-label">Nested Fields Layout</label>
            <select
              value={field.layoutDirection || 'vertical'}
              onChange={(e) => handleChange('layoutDirection', e.target.value)}
              className="property-input"
            >
              <option value="vertical">Vertical (stacked)</option>
              <option value="horizontal">Horizontal (side-by-side)</option>
            </select>
            <small className="property-help">
              How nested fields are arranged in each repeating item
            </small>
          </div>

          <div className="property-section-title">Nested Fields</div>
          <div className="property-nested-fields">
            {(field.nestedFields || []).map((nestedField, index) => (
              <div key={index} className="property-nested-field">
                <div className="property-nested-header">
                  <span>Field {index + 1}</span>
                  <button
                    onClick={() => removeNestedField(index)}
                    className="property-button-remove-small"
                  >
                    ×
                  </button>
                </div>
                <input
                  type="text"
                  value={nestedField.label}
                  onChange={(e) => handleNestedFieldChange(index, 'label', e.target.value)}
                  className="property-input property-input-sm"
                  placeholder="Field label"
                />
                <select
                  value={nestedField.type}
                  onChange={(e) => handleNestedFieldChange(index, 'type', e.target.value)}
                  className="property-input property-input-sm"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="select">Select</option>
                </select>
                <label className="property-checkbox-label-sm">
                  <input
                    type="checkbox"
                    checked={nestedField.required || false}
                    onChange={(e) => handleNestedFieldChange(index, 'required', e.target.checked)}
                  />
                  <span>Required</span>
                </label>
              </div>
            ))}
            <button onClick={addNestedField} className="property-button-add">
              + Add Nested Field
            </button>
          </div>
        </>
      )}

      {/* Time Range */}
      {field.type === 'timeRange' && (
        <>
          <div className="property-section-title">Time Range Settings</div>
          <div className="property-group">
            <label className="property-label">Minimum Duration (minutes)</label>
            <input
              type="number"
              value={field.validation?.minDuration || ''}
              onChange={(e) => handleValidationChange('minDuration', parseInt(e.target.value))}
              className="property-input"
              min="0"
            />
          </div>
        </>
      )}

      {/* Booking Validation Rules */}
      {field.type === 'number' && (
        <>
          <div className="property-section-title" style={{ marginTop: '24px', borderTop: '2px solid #e5e7eb', paddingTop: '20px' }}>
            🔒 Booking Validation Rules
            <small style={{ display: 'block', fontWeight: 'normal', fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              Validate user input during booking against this field's value
            </small>
          </div>

          <div className="property-group">
            <label className="property-checkbox-label">
              <input
                type="checkbox"
                checked={field.bookingValidationRules?.validateOnBooking || false}
                onChange={(e) => handleBookingValidationChange('validateOnBooking', e.target.checked)}
              />
              <span>Enable booking-time validation</span>
            </label>
            <small className="property-help">
              Validates user's booking data against this field when they make a booking
            </small>
          </div>

          {field.bookingValidationRules?.validateOnBooking && (
            <>
              <div className="property-group">
                <label className="property-label">Validation Type</label>
                <select
                  value={field.bookingValidationRules?.validationType || 'MAX_VALUE'}
                  onChange={(e) => handleBookingValidationChange('validationType', e.target.value)}
                  className="property-input"
                >
                  <option value="MAX_VALUE">Maximum Value (user input cannot exceed this)</option>
                  <option value="MIN_VALUE">Minimum Value (user input must meet minimum)</option>
                </select>
                <small className="property-help">
                  {field.bookingValidationRules?.validationType === 'MAX_VALUE'
                    ? 'Example: Capacity = 100, User can book max 100 attendees'
                    : 'Example: Min attendees = 10, User must book at least 10 people'}
                </small>
              </div>

              <div className="property-group">
                <label className="property-label">Booking Field to Validate</label>
                <select
                  value={field.bookingValidationRules?.bookingFieldName || 'numberOfAttendees'}
                  onChange={(e) => handleBookingValidationChange('bookingFieldName', e.target.value)}
                  className="property-input"
                >
                  <option value="numberOfAttendees">Number of Attendees</option>
                </select>
                <small className="property-help">
                  Which field in the booking form should be validated
                </small>
              </div>

              <div className="property-group">
                <label className="property-label">Error Message</label>
                <textarea
                  value={field.bookingValidationRules?.errorMessage || ''}
                  onChange={(e) => handleBookingValidationChange('errorMessage', e.target.value)}
                  className="property-textarea"
                  placeholder="e.g., Number of attendees cannot exceed hall capacity"
                  rows="2"
                />
                <small className="property-help">
                  Message shown to users when validation fails (optional, default message will be used if empty)
                </small>
              </div>

              <div className="property-info-box" style={{
                background: '#eff6ff',
                border: '1px solid #3b82f6',
                borderRadius: '6px',
                padding: '12px',
                marginTop: '12px'
              }}>
                <div style={{ fontSize: '13px', color: '#1e40af', marginBottom: '6px', fontWeight: '500' }}>
                  ℹ️ How it works:
                </div>
                <div style={{ fontSize: '12px', color: '#1e3a8a', lineHeight: '1.5' }}>
                  When a user books this item, the system will check that their <strong>{field.bookingValidationRules?.bookingFieldName || 'numberOfAttendees'}</strong> value {field.bookingValidationRules?.validationType === 'MIN_VALUE' ? 'is at least' : 'does not exceed'} the <strong>{field.label}</strong> value set by the vendor.
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
