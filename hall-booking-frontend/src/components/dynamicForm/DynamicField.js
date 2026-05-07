import React from 'react';
import './DynamicField.css';

/**
 * DynamicField Component
 *
 * Renders a single form field based on its type and configuration.
 * Supports all 10 field types with validation and proper input handling.
 */
const DynamicField = ({ field, value, onChange, error }) => {
  const handleChange = (e) => {
    const newValue = field.type === 'checkbox'
      ? (e.target.checked ? e.target.value : null)
      : e.target.value;
    onChange(field.id, newValue);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onChange(field.id, {
        name: file.name,
        size: file.size,
        type: file.type
      });
    }
  };

  const handleTimeRangeChange = (type, val) => {
    const currentValue = value || { startTime: '', endTime: '' };
    onChange(field.id, {
      ...currentValue,
      [type]: val
    });
  };

  const handlePaymentTermsChange = (selectedOption) => {
    const currentValue = value || {};
    onChange(field.id, {
      ...currentValue,
      selectedOption: selectedOption,
      customTerms: selectedOption === 'Custom Terms' ? (currentValue.customTerms || '') : ''
    });
  };

  const handleCustomTermsChange = (customText) => {
    const currentValue = value || {};
    onChange(field.id, {
      ...currentValue,
      customTerms: customText
    });
  };

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            id={field.id}
            value={value || ''}
            onChange={handleChange}
            placeholder={field.placeholder || ''}
            required={field.required}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
            pattern={field.validation?.pattern}
            className="dynamic-field-input"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            id={field.id}
            value={value || ''}
            onChange={handleChange}
            placeholder={field.placeholder || ''}
            required={field.required}
            min={field.validation?.min}
            max={field.validation?.max}
            className="dynamic-field-input"
          />
        );

      case 'textarea':
        return (
          <textarea
            id={field.id}
            value={value || ''}
            onChange={handleChange}
            placeholder={field.placeholder || ''}
            required={field.required}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
            rows="4"
            className="dynamic-field-textarea"
          />
        );

      case 'select':
        return (
          <select
            id={field.id}
            value={value || ''}
            onChange={handleChange}
            required={field.required}
            className="dynamic-field-select"
          >
            <option value="">-- Select --</option>
            {(field.options || []).map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="dynamic-field-radio-group">
            {(field.options || []).map((option, index) => (
              <label key={index} className="dynamic-field-radio-label">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={handleChange}
                  required={field.required}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="dynamic-field-checkbox-group">
            {(field.options || []).map((option, index) => (
              <label key={index} className="dynamic-field-checkbox-label">
                <input
                  type="checkbox"
                  value={option}
                  checked={(value || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = value || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter(v => v !== option);
                    onChange(field.id, newValues);
                  }}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'timingOption':
        return (
          <select
            id={field.id}
            value={value || ''}
            onChange={handleChange}
            required={field.required}
            className="dynamic-field-select"
          >
            <option value="">-- Select Time Slot --</option>
            {(field.options || []).map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'timeRange':
        return (
          <div className="dynamic-field-time-range">
            <div className="time-range-input">
              <label htmlFor={`${field.id}-start`}>Start Time</label>
              <input
                type="time"
                id={`${field.id}-start`}
                value={value?.startTime || ''}
                onChange={(e) => handleTimeRangeChange('startTime', e.target.value)}
                required={field.required}
                className="dynamic-field-input"
              />
            </div>
            <div className="time-range-input">
              <label htmlFor={`${field.id}-end`}>End Time</label>
              <input
                type="time"
                id={`${field.id}-end`}
                value={value?.endTime || ''}
                onChange={(e) => handleTimeRangeChange('endTime', e.target.value)}
                required={field.required}
                className="dynamic-field-input"
              />
            </div>
            {field.helpText && (
              <small className="field-help">{field.helpText}</small>
            )}
          </div>
        );

      case 'file':
        return (
          <div className="dynamic-field-file">
            <input
              type="file"
              id={field.id}
              onChange={handleFileChange}
              required={field.required}
              className="dynamic-field-file-input"
            />
            {value && (
              <div className="file-info">
                <span className="file-name">{value.name}</span>
                <span className="file-size">({Math.round(value.size / 1024)} KB)</span>
              </div>
            )}
          </div>
        );

      case 'paymentTerms':
        const paymentValue = value || {};
        return (
          <div className="dynamic-field-payment-terms">
            <select
              id={field.id}
              value={paymentValue.selectedOption || ''}
              onChange={(e) => handlePaymentTermsChange(e.target.value)}
              required={field.required}
              className="dynamic-field-select"
            >
              <option value="">-- Select Payment Terms --</option>
              {(field.options || []).map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>

            {field.allowCustom && paymentValue.selectedOption === 'Custom Terms' && (
              <div className="custom-terms-input">
                <label htmlFor={`${field.id}-custom`} className="custom-terms-label">
                  Specify Custom Terms
                </label>
                <textarea
                  id={`${field.id}-custom`}
                  value={paymentValue.customTerms || ''}
                  onChange={(e) => handleCustomTermsChange(e.target.value)}
                  placeholder="Enter your custom payment terms (e.g., 20% advance, 40% mid-way, 40% on completion)"
                  required={paymentValue.selectedOption === 'Custom Terms'}
                  rows="3"
                  className="dynamic-field-textarea"
                />
              </div>
            )}
          </div>
        );

      case 'repeatingGroup':
        // Handled by parent component (DynamicItemForm)
        return null;

      default:
        return <p className="error-text">Unknown field type: {field.type}</p>;
    }
  };

  return (
    <div className={`dynamic-field ${error ? 'has-error' : ''}`}>
      <label htmlFor={field.id} className="dynamic-field-label">
        {field.label}
        {field.required && <span className="required-indicator">*</span>}
      </label>

      {renderField()}

      {field.helpText && field.type !== 'timeRange' && (
        <small className="field-help">{field.helpText}</small>
      )}

      {error && (
        <span className="field-error">{error}</span>
      )}
    </div>
  );
};

export default DynamicField;
