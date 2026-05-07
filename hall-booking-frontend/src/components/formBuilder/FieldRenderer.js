import React from 'react';
import { FaTrash, FaGripVertical } from 'react-icons/fa';
import PropTypes from 'prop-types';
import './FieldRenderer.css';

/**
 * FieldRenderer Component
 *
 * Renders a field in the design canvas with controls for selection, deletion, and drag-to-reposition.
 * Provides realistic preview of how the field will appear to end users.
 *
 * Features:
 * - Visual selection state
 * - Drag handle for repositioning
 * - Delete button with confirmation
 * - Field type badge
 * - Real-time validation preview
 * - Accessible keyboard interactions
 *
 * @param {Object} props - Component props
 * @param {Object} props.field - Field configuration object
 * @param {boolean} props.isSelected - Whether field is currently selected
 * @param {Function} props.onSelect - Callback when field is selected
 * @param {Function} props.onDelete - Callback when field is deleted
 * @returns {JSX.Element} Field renderer component
 */
export default function FieldRenderer({ field, isSelected, onSelect, onDelete }) {

  /**
   * Handle field click for selection
   * @param {MouseEvent} e - Click event
   */
  const handleClick = (e) => {
    e.stopPropagation();
    onSelect();
  };

  /**
   * Handle field deletion with confirmation
   * @param {MouseEvent} e - Click event
   */
  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete field "${field.label}"?\n\nThis action cannot be undone.`)) {
      onDelete();
    }
  };

  /**
   * Handle keyboard interactions for accessibility
   * @param {KeyboardEvent} e - Keyboard event
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      handleDelete(e);
    }
  };

  /**
   * Render field preview based on type with realistic styling
   * @returns {JSX.Element} Field preview component
   */
  const renderFieldPreview = () => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            placeholder={field.placeholder || 'Text input'}
            disabled
            className="field-preview-input"
            aria-label={`Preview of ${field.label}`}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            placeholder={field.placeholder || '0'}
            disabled
            className="field-preview-input"
            aria-label={`Preview of ${field.label}`}
          />
        );

      case 'textarea':
        return (
          <textarea
            placeholder={field.placeholder || 'Enter text...'}
            disabled
            className="field-preview-textarea"
            rows="3"
            aria-label={`Preview of ${field.label}`}
          />
        );

      case 'select':
        return (
          <select disabled className="field-preview-select" aria-label={`Preview of ${field.label}`}>
            <option>Select...</option>
            {(field.options || []).map((option, i) => (
              <option key={i}>{option}</option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="field-preview-radio" role="group" aria-label="Radio options preview">
            {(field.options || ['Option 1', 'Option 2']).map((option, i) => (
              <label key={i} className="field-preview-radio-label">
                <input
                  type="radio"
                  disabled
                  name={field.id}
                  aria-label={option}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="field-preview-checkbox" role="group" aria-label="Checkbox options preview">
            {(field.options || ['Option 1', 'Option 2']).map((option, i) => (
              <label key={i} className="field-preview-checkbox-label">
                <input
                  type="checkbox"
                  disabled
                  aria-label={option}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'timingOption':
        return (
          <div className="field-preview-timing" role="group" aria-label="Timing options preview">
            {['Fullday', 'Morning', 'Evening'].map((option, i) => (
              <label key={i} className="field-preview-timing-label">
                <input
                  type="checkbox"
                  disabled
                  aria-label={option}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'timeRange':
        return (
          <div className="field-preview-time-range" role="group" aria-label="Time range preview">
            <input
              type="time"
              disabled
              className="field-preview-time"
              aria-label="Start time"
            />
            <span className="field-preview-separator" aria-hidden="true">to</span>
            <input
              type="time"
              disabled
              className="field-preview-time"
              aria-label="End time"
            />
          </div>
        );

      case 'paymentTerms':
        return (
          <div className="field-preview-payment-terms" role="group" aria-label="Payment terms preview">
            <select disabled className="field-preview-select" aria-label="Payment terms selector">
              <option>Select payment terms...</option>
              {(field.options || ['Full Payment', '50% Advance + 50% on Event', 'Custom Terms']).map((option, i) => (
                <option key={i}>{option}</option>
              ))}
            </select>
            {field.allowCustom && (
              <div className="field-preview-custom-terms">
                <textarea
                  placeholder="Enter custom payment terms..."
                  disabled
                  className="field-preview-textarea"
                  rows="2"
                  aria-label="Custom payment terms"
                />
              </div>
            )}
          </div>
        );

      case 'repeatingGroup':
        // Determine layout: horizontal if layoutDirection is set, otherwise vertical
        const isHorizontalLayout = field.layoutDirection === 'horizontal';
        return (
          <div className="field-preview-repeating" aria-label="Repeating group preview">
            <div className={`field-preview-repeating-item ${isHorizontalLayout ? 'horizontal-layout' : ''}`}>
              {(field.nestedFields || []).map((nestedField, i) => (
                <div key={i} className="field-preview-nested">
                  <small>{nestedField.label}</small>
                  <input
                    type="text"
                    disabled
                    className="field-preview-input-sm"
                    aria-label={nestedField.label}
                  />
                </div>
              ))}
            </div>
            <button disabled className="field-preview-add-button" aria-label="Add item button preview">
              + Add Item
            </button>
          </div>
        );

      case 'file':
        return (
          <div className="field-preview-file" role="group" aria-label="File upload preview">
            <button disabled className="field-preview-file-button">
              Choose File
            </button>
            <span className="field-preview-file-text">No file chosen</span>
          </div>
        );

      default:
        return (
          <div className="field-preview-unknown" role="alert">
            Unknown field type: {field.type}
          </div>
        );
    }
  };

  // Check if field has validation rules
  const hasValidation = field.validation && Object.keys(field.validation).length > 0;
  const hasBookingValidation = field.bookingValidationRules?.validateOnBooking;

  return (
    <div
      className={`field-renderer ${isSelected ? 'selected' : ''} ${hasValidation ? 'has-validation' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      aria-label={`${field.label} field - ${field.type} - ${isSelected ? 'selected' : 'not selected'}`}
    >
      {/* Drag Handle */}
      <div
        className="field-renderer-drag-handle drag-handle"
        role="button"
        aria-label="Drag to reposition field"
        tabIndex={-1}
      >
        <FaGripVertical aria-hidden="true" />
      </div>

      {/* Field Content */}
      <div className="field-renderer-content">
        <div className="field-renderer-header">
          <label className="field-renderer-label">
            {field.label || 'Untitled Field'}
            {field.required && (
              <span className="field-required" aria-label="required">*</span>
            )}
          </label>
          <button
            className="field-renderer-delete"
            onClick={handleDelete}
            title="Delete field"
            aria-label={`Delete ${field.label} field`}
          >
            <FaTrash aria-hidden="true" />
          </button>
        </div>

        <div className="field-renderer-preview">
          {renderFieldPreview()}
        </div>

        {field.helpText && (
          <small className="field-renderer-help">{field.helpText}</small>
        )}

        {/* Validation indicators */}
        {hasValidation && (
          <div className="field-validation-indicators">
            {field.validation.minLength && (
              <span className="validation-badge" title={`Minimum length: ${field.validation.minLength}`}>
                Min: {field.validation.minLength}
              </span>
            )}
            {field.validation.maxLength && (
              <span className="validation-badge" title={`Maximum length: ${field.validation.maxLength}`}>
                Max: {field.validation.maxLength}
              </span>
            )}
            {field.validation.min !== undefined && (
              <span className="validation-badge" title={`Minimum value: ${field.validation.min}`}>
                Min: {field.validation.min}
              </span>
            )}
            {field.validation.max !== undefined && (
              <span className="validation-badge" title={`Maximum value: ${field.validation.max}`}>
                Max: {field.validation.max}
              </span>
            )}
          </div>
        )}

        {/* Booking validation indicator */}
        {hasBookingValidation && (
          <div className="booking-validation-badge" title="Has booking-time validation rules">
            🔒 Booking Validation
          </div>
        )}
      </div>

      {/* Field Type Badge */}
      <div className="field-renderer-badge" aria-label={`Field type: ${field.type}`}>
        {field.type}
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="selection-indicator" aria-hidden="true" />
      )}
    </div>
  );
}

FieldRenderer.propTypes = {
  field: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    label: PropTypes.string,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    helpText: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.string),
    nestedFields: PropTypes.array,
    validation: PropTypes.object,
    bookingValidationRules: PropTypes.object
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};
