import React from 'react';
import DynamicField from './DynamicField';
import './RepeatingGroupField.css';

/**
 * RepeatingGroupField Component
 *
 * Renders a repeating group of fields (e.g., menu items).
 * Allows adding/removing items with min/max constraints.
 */
const RepeatingGroupField = ({ field, value, onChange, errors }) => {
  const items = value || [];
  const minItems = field.minItems || 0;
  const maxItems = field.maxItems || 10;

  const handleAddItem = () => {
    if (items.length >= maxItems) {
      return;
    }

    const newItem = {};
    (field.nestedFields || []).forEach(nestedField => {
      newItem[nestedField.id] = '';
    });

    onChange(field.id, [...items, newItem]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= minItems) {
      return;
    }

    const newItems = items.filter((_, i) => i !== index);
    onChange(field.id, newItems);
  };

  const handleNestedFieldChange = (itemIndex, fieldId, fieldValue) => {
    const newItems = [...items];
    newItems[itemIndex] = {
      ...newItems[itemIndex],
      [fieldId]: fieldValue
    };
    onChange(field.id, newItems);
  };

  return (
    <div className="repeating-group-field">
      <div className="repeating-group-header">
        <label className="repeating-group-label">
          {field.label}
          {field.required && <span className="required-indicator">*</span>}
        </label>
        <button
          type="button"
          onClick={handleAddItem}
          disabled={items.length >= maxItems}
          className="btn-add-item"
        >
          + Add {field.label}
        </button>
      </div>

      {field.helpText && (
        <small className="field-help">{field.helpText}</small>
      )}

      <div className="repeating-items">
        {items.length === 0 ? (
          <div className="empty-state">
            <p>No items added yet. Click "Add {field.label}" to begin.</p>
          </div>
        ) : (
          items.map((item, itemIndex) => (
            <div key={itemIndex} className="repeating-item">
              <div className="repeating-item-header">
                <h4>Item {itemIndex + 1}</h4>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(itemIndex)}
                  disabled={items.length <= minItems}
                  className="btn-remove-item"
                  title="Remove item"
                >
                  ×
                </button>
              </div>

              <div className="repeating-item-fields">
                {(field.nestedFields || []).map(nestedField => (
                  <DynamicField
                    key={nestedField.id}
                    field={nestedField}
                    value={item[nestedField.id]}
                    onChange={(fieldId, fieldValue) =>
                      handleNestedFieldChange(itemIndex, fieldId, fieldValue)
                    }
                    error={errors?.[itemIndex]?.[nestedField.id]}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {items.length < minItems && (
        <div className="validation-hint warning">
          Minimum {minItems} item{minItems !== 1 ? 's' : ''} required
        </div>
      )}

      {items.length >= maxItems && (
        <div className="validation-hint info">
          Maximum {maxItems} items reached
        </div>
      )}
    </div>
  );
};

export default RepeatingGroupField;
