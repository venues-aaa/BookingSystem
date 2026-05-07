import React from 'react';
import './DynamicForm.css';

/**
 * DynamicForm - Renders form fields based on FormSchema
 *
 * This component is schema-driven and renders fields dynamically
 * based on the category's bookingFormSchema.
 *
 * Supports all field types: text, number, textarea, select, radio,
 * checkbox, date, time, etc.
 */
const DynamicForm = ({ schema, data, onChange }) => {
  if (!schema || !schema.fields || schema.fields.length === 0) {
    return null;
  }

  const renderField = (field) => {
    const value = data[field.id] || field.defaultValue || '';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <div key={field.id} className="dynamic-form-group">
            <label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <input
              type={field.type}
              id={field.id}
              value={value}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
            />
            {field.helpText && <small className="help-text">{field.helpText}</small>}
          </div>
        );

      case 'number':
        return (
          <div key={field.id} className="dynamic-form-group">
            <label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <input
              type="number"
              id={field.id}
              value={value}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              min={field.validation?.min}
              max={field.validation?.max}
            />
            {field.helpText && <small className="help-text">{field.helpText}</small>}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="dynamic-form-group full-width">
            <label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <textarea
              id={field.id}
              value={value}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              rows="4"
            />
            {field.helpText && <small className="help-text">{field.helpText}</small>}
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="dynamic-form-group">
            <label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <select
              id={field.id}
              value={value}
              onChange={(e) => onChange(field.id, e.target.value)}
              required={field.required}
            >
              <option value="">Select {field.label.toLowerCase()}</option>
              {field.options?.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {field.helpText && <small className="help-text">{field.helpText}</small>}
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className="dynamic-form-group">
            <label>
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <div className="radio-group">
              {field.options?.map((option, index) => (
                <label key={index} className="radio-label">
                  <input
                    type="radio"
                    name={field.id}
                    value={option}
                    checked={value === option}
                    onChange={(e) => onChange(field.id, e.target.value)}
                    required={field.required}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            {field.helpText && <small className="help-text">{field.helpText}</small>}
          </div>
        );

      case 'checkbox':
        const checkboxValues = Array.isArray(value) ? value : [];
        return (
          <div key={field.id} className="dynamic-form-group">
            <label>
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <div className="checkbox-group">
              {field.options?.map((option, index) => (
                <label key={index} className="checkbox-label">
                  <input
                    type="checkbox"
                    value={option}
                    checked={checkboxValues.includes(option)}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...checkboxValues, option]
                        : checkboxValues.filter(v => v !== option);
                      onChange(field.id, newValues);
                    }}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            {field.helpText && <small className="help-text">{field.helpText}</small>}
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="dynamic-form-group">
            <label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <input
              type="date"
              id={field.id}
              value={value}
              onChange={(e) => onChange(field.id, e.target.value)}
              required={field.required}
            />
            {field.helpText && <small className="help-text">{field.helpText}</small>}
          </div>
        );

      case 'time':
        return (
          <div key={field.id} className="dynamic-form-group">
            <label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <input
              type="time"
              id={field.id}
              value={value}
              onChange={(e) => onChange(field.id, e.target.value)}
              required={field.required}
            />
            {field.helpText && <small className="help-text">{field.helpText}</small>}
          </div>
        );

      case 'timeRange':
        const timeRangeValue = value || { from: '', to: '' };
        return (
          <div key={field.id} className="dynamic-form-group">
            <label>
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <div className="time-range-inputs">
              <input
                type="time"
                value={timeRangeValue.from}
                onChange={(e) => onChange(field.id, { ...timeRangeValue, from: e.target.value })}
                placeholder="From"
                required={field.required}
              />
              <span>to</span>
              <input
                type="time"
                value={timeRangeValue.to}
                onChange={(e) => onChange(field.id, { ...timeRangeValue, to: e.target.value })}
                placeholder="To"
                required={field.required}
              />
            </div>
            {field.helpText && <small className="help-text">{field.helpText}</small>}
          </div>
        );

      // For complex field types like repeatingGroup, we'll keep it simple for booking
      case 'repeatingGroup':
        return (
          <div key={field.id} className="dynamic-form-group full-width">
            <label>{field.label}</label>
            <p className="info-text">
              {field.helpText || 'This field will be discussed with the vendor after booking.'}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  // Sort fields by grid position (y first, then x) to match Form Builder layout
  const sortedFields = [...schema.fields].sort((a, b) => {
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

  return (
    <div className="dynamic-form">
      {sortedFields.map(field => renderField(field))}
    </div>
  );
};

export default DynamicForm;
