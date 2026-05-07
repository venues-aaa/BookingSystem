import React, { useState, useRef, useEffect } from 'react';
import './MultiSelectDropdown.css';

/**
 * MultiSelectDropdown Component
 *
 * A dropdown with checkboxes inside for multiple selections.
 * Used in booking forms where users can select multiple options.
 */
const MultiSelectDropdown = ({
  label,
  options = [],
  value = [],
  onChange,
  placeholder = "Select options...",
  required = false,
  helpText = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleCheckboxChange = (option) => {
    const currentSelections = Array.isArray(value) ? value : [];
    let newSelections;

    if (currentSelections.includes(option)) {
      // Remove from selections
      newSelections = currentSelections.filter(item => item !== option);
    } else {
      // Add to selections
      newSelections = [...currentSelections, option];
    }

    onChange(newSelections);
  };

  const getDisplayText = () => {
    if (!value || value.length === 0) {
      return placeholder;
    }

    if (value.length === 1) {
      return value[0];
    }

    return `${value.length} selected`;
  };

  return (
    <div className="multi-select-container" ref={dropdownRef}>
      <label className="multi-select-label">
        {label}
        {required && <span className="required"> *</span>}
      </label>

      {/* Dropdown Trigger */}
      <div
        className={`multi-select-trigger ${isOpen ? 'open' : ''} ${value.length > 0 ? 'has-value' : ''}`}
        onClick={handleToggle}
      >
        <span className="multi-select-text">{getDisplayText()}</span>
        <span className={`multi-select-arrow ${isOpen ? 'up' : 'down'}`}>▼</span>
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="multi-select-dropdown">
          {options.map((option, index) => {
            const isChecked = Array.isArray(value) && value.includes(option);

            return (
              <label key={index} className="multi-select-option">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleCheckboxChange(option)}
                />
                <span className="checkbox-custom"></span>
                <span className="option-text">{option}</span>
              </label>
            );
          })}
        </div>
      )}

      {/* Selected Items Display */}
      {value && value.length > 0 && (
        <div className="selected-items">
          {value.map((item, index) => (
            <span key={index} className="selected-item-tag">
              {item}
              <button
                type="button"
                className="remove-tag"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCheckboxChange(item);
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Help Text */}
      {helpText && (
        <small className="help-text">{helpText}</small>
      )}

      {/* Validation Message */}
      {required && (!value || value.length === 0) && (
        <small className="error-text">Please select at least one option</small>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
