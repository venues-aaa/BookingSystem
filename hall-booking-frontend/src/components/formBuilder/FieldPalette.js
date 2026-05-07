import React, { useState } from 'react';
import {
  FaFont, FaHashtag, FaAlignLeft, FaCheckSquare,
  FaDotCircle, FaListUl, FaClock, FaImage,
  FaCalendarAlt, FaPlus, FaSearch, FaMoneyBillWave
} from 'react-icons/fa';
import PropTypes from 'prop-types';
import './FieldPalette.css';

/**
 * Field Types Configuration
 * Defines all available field types with their default properties, icons, and tooltips
 */
const FIELD_TYPES = [
  {
    type: 'text',
    label: 'Text Input',
    icon: FaFont,
    color: '#3b82f6',
    category: 'Basic',
    description: 'Single-line text input for short text entries',
    defaultProps: {
      label: 'Text Field',
      placeholder: 'Enter text...',
      required: false,
      validation: {}
    }
  },
  {
    type: 'number',
    label: 'Number',
    icon: FaHashtag,
    color: '#8b5cf6',
    category: 'Basic',
    description: 'Numeric input with optional min/max validation',
    defaultProps: {
      label: 'Number Field',
      placeholder: '0',
      required: false,
      validation: { min: 0 }
    }
  },
  {
    type: 'textarea',
    label: 'Text Area',
    icon: FaAlignLeft,
    color: '#06b6d4',
    category: 'Basic',
    description: 'Multi-line text input for longer content',
    defaultProps: {
      label: 'Description',
      placeholder: 'Enter description...',
      required: false,
      validation: { maxLength: 1000 }
    }
  },
  {
    type: 'select',
    label: 'Dropdown',
    icon: FaListUl,
    color: '#10b981',
    category: 'Choice',
    description: 'Single-select dropdown menu',
    defaultProps: {
      label: 'Select Option',
      required: false,
      options: ['Option 1', 'Option 2', 'Option 3']
    }
  },
  {
    type: 'radio',
    label: 'Radio Buttons',
    icon: FaDotCircle,
    color: '#f59e0b',
    category: 'Choice',
    description: 'Single-choice radio button group',
    defaultProps: {
      label: 'Choose One',
      required: false,
      options: ['Option 1', 'Option 2']
    }
  },
  {
    type: 'checkbox',
    label: 'Checkboxes',
    icon: FaCheckSquare,
    color: '#ec4899',
    category: 'Choice',
    description: 'Multi-select checkbox group',
    defaultProps: {
      label: 'Select Multiple',
      required: false,
      options: ['Option 1', 'Option 2', 'Option 3']
    }
  },
  {
    type: 'timingOption',
    label: 'Timing Slots',
    icon: FaClock,
    color: '#6366f1',
    category: 'Booking',
    description: 'Predefined timing slot options (Fullday, Morning, Evening)',
    defaultProps: {
      label: 'Available Slots',
      required: true,
      options: ['Fullday', 'Morning', 'Evening']
    }
  },
  {
    type: 'timeRange',
    label: 'Time Range',
    icon: FaCalendarAlt,
    color: '#14b8a6',
    category: 'Booking',
    description: 'Start and end time selector with duration validation',
    defaultProps: {
      label: 'Event Timing',
      required: true,
      timeFormat: '12h',
      validation: { minDuration: 60 }
    }
  },
  {
    type: 'paymentTerms',
    label: 'Payment Terms',
    icon: FaMoneyBillWave,
    color: '#10b981',
    category: 'Booking',
    description: 'Payment terms selector with predefined options or custom terms',
    defaultProps: {
      label: 'Payment Terms',
      required: true,
      options: ['Full Payment', '50% Advance + 50% on Event', '30% Advance + 70% on Event', 'Custom Terms'],
      allowCustom: true
    }
  },
  {
    type: 'repeatingGroup',
    label: 'Repeating Group',
    icon: FaPlus,
    color: '#f97316',
    category: 'Advanced',
    description: 'Dynamic group of fields that users can add/remove',
    defaultProps: {
      label: 'Items',
      required: false,
      minItems: 1,
      maxItems: 10,
      nestedFields: [
        {
          id: 'field1',
          type: 'text',
          label: 'Item Name',
          required: true
        }
      ]
    }
  },
  {
    type: 'file',
    label: 'File Upload',
    icon: FaImage,
    color: '#64748b',
    category: 'Advanced',
    description: 'File upload field for images and documents',
    defaultProps: {
      label: 'Upload Image',
      required: false
    }
  }
];

/**
 * FieldPalette Component
 *
 * Displays all available field types organized by category with search functionality.
 * Uses HTML5 drag-and-drop API with visual feedback and keyboard support.
 *
 * @param {Object} props - Component props
 * @returns {JSX.Element} Field palette component
 */
export default function FieldPalette() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const dragTimeoutRef = React.useRef(null);

  // Extract unique categories
  const categories = ['All', ...new Set(FIELD_TYPES.map(field => field.category))];

  // Filter fields based on search and category
  const filteredFields = FIELD_TYPES.filter(fieldType => {
    const matchesSearch = fieldType.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         fieldType.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || fieldType.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  /**
   * Cleanup drag state - removes visual feedback class
   * Centralized cleanup function to ensure consistent state management
   */
  const cleanupDragState = () => {
    // Clear any pending timeout
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }

    // Remove the dragging class
    document.body.classList.remove('field-dragging');
  };

  /**
   * Handle drag start event - transfers field type data
   * @param {DragEvent} e - Drag event
   * @param {Object} fieldType - Field type configuration
   */
  const handleDragStart = (e, fieldType) => {
    e.dataTransfer.setData('fieldType', JSON.stringify(fieldType));
    e.dataTransfer.effectAllowed = 'copy';

    // Add visual feedback class to body
    document.body.classList.add('field-dragging');

    // Failsafe: ensure cleanup after reasonable timeout
    // This handles edge cases where dragend event might not fire
    dragTimeoutRef.current = setTimeout(cleanupDragState, 5000);
  };

  /**
   * Handle drag end event - cleanup
   * @param {DragEvent} e - Drag event
   */
  const handleDragEnd = (e) => {
    cleanupDragState();
  };

  /**
   * Handle keyboard navigation for accessibility
   * @param {KeyboardEvent} e - Keyboard event
   * @param {Object} fieldType - Field type configuration
   */
  const handleKeyDown = (e, fieldType) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Trigger add field via custom event
      window.dispatchEvent(new CustomEvent('addField', { detail: fieldType }));
    }
  };

  /**
   * Cleanup on component unmount
   * Ensures drag state is cleaned up if component unmounts during drag
   */
  React.useEffect(() => {
    return () => {
      cleanupDragState();
    };
  }, []);

  return (
    <div className="field-palette" role="complementary" aria-label="Field Types Palette">
      <div className="palette-header">
        <h3 className="palette-title">Field Types</h3>
        <p className="palette-subtitle">Drag fields to the canvas or press Enter</p>
      </div>

      {/* Search Input */}
      <div className="palette-search">
        <FaSearch className="palette-search-icon" aria-hidden="true" />
        <input
          type="text"
          className="palette-search-input"
          placeholder="Search fields..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search field types"
        />
        {searchQuery && (
          <button
            className="palette-search-clear"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="palette-categories" role="tablist" aria-label="Field categories">
        {categories.map(category => (
          <button
            key={category}
            className={`palette-category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
            role="tab"
            aria-selected={selectedCategory === category}
            aria-controls="field-list"
          >
            {category}
          </button>
        ))}
      </div>

      {/* Field List */}
      <div
        id="field-list"
        className="field-list"
        role="list"
        aria-label="Available field types"
      >
        {filteredFields.length === 0 ? (
          <div className="palette-empty" role="status">
            <div className="palette-empty-icon" aria-hidden="true">🔍</div>
            <p className="palette-empty-text">
              No fields found matching "{searchQuery}"
            </p>
          </div>
        ) : (
          filteredFields.map(fieldType => {
            const Icon = fieldType.icon;
            return (
              <div
                key={fieldType.type}
                className="field-item"
                draggable
                onDragStart={(e) => handleDragStart(e, fieldType)}
                onDragEnd={handleDragEnd}
                onKeyDown={(e) => handleKeyDown(e, fieldType)}
                tabIndex={0}
                role="listitem button"
                aria-label={`${fieldType.label} - ${fieldType.description}`}
                style={{ '--field-color': fieldType.color }}
              >
                <div
                  className="field-item-icon"
                  style={{ backgroundColor: fieldType.color }}
                  aria-hidden="true"
                >
                  <Icon />
                </div>
                <div className="field-item-content">
                  <span className="field-item-label">{fieldType.label}</span>
                  <span className="field-item-description">{fieldType.description}</span>
                </div>

                {/* Tooltip for larger screens */}
                <div className="field-item-tooltip" role="tooltip">
                  <strong>{fieldType.label}</strong>
                  <p>{fieldType.description}</p>
                  <small>Click or drag to add</small>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer with helpful hints */}
      <div className="palette-footer">
        <small className="palette-footer-text">
          Drag fields to design area or use keyboard to add
        </small>
        <div className="palette-keyboard-hint" role="note">
          <kbd>Tab</kbd> to navigate
          <kbd>Enter</kbd> to add field
        </div>
      </div>
    </div>
  );
}

FieldPalette.propTypes = {
  // No props currently, but keeping for future extensions
};
