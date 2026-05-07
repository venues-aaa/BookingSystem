import React, { useState, useEffect } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import PropTypes from 'prop-types';
import FieldRenderer from './FieldRenderer';
import './DesignCanvas.css';

/**
 * DesignCanvas Component
 *
 * Main design area where fields are dropped and arranged using React-Grid-Layout.
 * Features:
 * - Drag-and-drop field placement
 * - Resizable and repositionable fields
 * - Visual feedback during drag operations
 * - Empty state with helpful instructions
 * - Keyboard navigation support
 *
 * @param {Object} props - Component props
 * @param {Array} props.fields - Array of field objects
 * @param {Function} props.onFieldUpdate - Callback to update field
 * @param {Function} props.onFieldDelete - Callback to delete field
 * @param {Function} props.onFieldSelect - Callback to select field
 * @param {string} props.selectedFieldId - Currently selected field ID
 * @returns {JSX.Element} Design canvas component
 */
export default function DesignCanvas({
  fields,
  onFieldUpdate,
  onFieldDelete,
  onFieldSelect,
  selectedFieldId
}) {

  const [layouts, setLayouts] = useState([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [dropIndicator, setDropIndicator] = useState(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  const canvasRef = React.useRef(null);

  // Convert fields to React-Grid-Layout format
  useEffect(() => {
    const gridLayouts = fields.map(field => ({
      i: field.id,
      x: field.position?.x || 0,
      y: field.position?.y || 0,
      w: field.position?.width || 6,
      h: field.position?.height || 1,
      minW: 2,
      minH: 1,
      maxH: field.type === 'repeatingGroup' ? 6 : field.type === 'textarea' ? 4 : 3
    }));
    setLayouts(gridLayouts);
  }, [fields]);

  // Listen for keyboard-triggered field additions
  useEffect(() => {
    const handleAddField = (e) => {
      const fieldTypeData = e.detail;
      addFieldToCanvas(fieldTypeData);
    };

    window.addEventListener('addField', handleAddField);
    return () => window.removeEventListener('addField', handleAddField);
  }, [fields]);

  // Calculate container width dynamically and handle window resize
  useEffect(() => {
    const updateWidth = () => {
      if (canvasRef.current) {
        const PADDING = 48; // Padding for canvas (24px each side)
        const MIN_WIDTH = 800; // Minimum width for usability
        const MAX_WIDTH = 1200; // Maximum width for readability

        // Get actual container width
        const rect = canvasRef.current.getBoundingClientRect();
        const availableWidth = rect.width - PADDING;

        // Clamp width between min and max
        const finalWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, availableWidth));

        console.log('[DesignCanvas] Container width:', finalWidth);
        setContainerWidth(finalWidth);
      }
    };

    // Initial measurement
    updateWidth();

    // Update on window resize with debounce
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateWidth, 100);
    };

    window.addEventListener('resize', handleResize);

    // Retry after mount to ensure canvas is rendered
    const timeoutId = setTimeout(updateWidth, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
      clearTimeout(resizeTimer);
    };
  }, []);

  /**
   * Handle layout changes when fields are moved or resized
   * Only updates if position actually changed to prevent unnecessary re-renders
   * @param {Array} newLayout - Updated layout configuration
   */
  const handleLayoutChange = (newLayout) => {
    const updates = [];

    newLayout.forEach(item => {
      const field = fields.find(f => f.id === item.i);
      if (field) {
        const currentPos = field.position || {};
        // Only update if position actually changed
        if (currentPos.x !== item.x ||
            currentPos.y !== item.y ||
            currentPos.width !== item.w ||
            currentPos.height !== item.h) {
          updates.push({
            id: field.id,
            field: {
              ...field,
              position: {
                x: item.x,
                y: item.y,
                width: item.w,
                height: item.h
              }
            }
          });
        }
      }
    });

    // Batch update to prevent flickering
    if (updates.length > 0) {
      updates.forEach(({ id, field }) => {
        onFieldUpdate(id, field);
      });
    }
  };

  /**
   * Handle drag start - cleanup for resize handle
   * @param {Array} layout - Current layout
   * @param {Object} oldItem - Item being dragged
   * @param {Object} newItem - New item position
   * @param {Object} placeholder - Placeholder element
   * @param {Event} e - Mouse event
   * @param {HTMLElement} element - DOM element
   */
  const handleDragStart = (layout, oldItem, newItem, placeholder, e, element) => {
    // Ensure any stuck resize state is cleaned up
    document.body.style.cursor = 'grabbing';
  };

  /**
   * Handle drag stop - cleanup cursor state
   */
  const handleDragStop = (layout, oldItem, newItem, placeholder, e, element) => {
    document.body.style.cursor = '';
    handleLayoutChange(layout);
  };

  /**
   * Handle resize start - ensure proper cursor
   */
  const handleResizeStart = (layout, oldItem, newItem, placeholder, e, element) => {
    document.body.style.cursor = 'se-resize';
  };

  /**
   * Handle resize stop - cleanup cursor and update layout
   */
  const handleResizeStop = (layout, oldItem, newItem, placeholder, e, element) => {
    // Critical: Reset cursor to prevent stuck resize cursor
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    // Force cleanup of any residual mouse event handlers
    if (element) {
      element.style.cursor = '';
    }

    handleLayoutChange(layout);
  };

  /**
   * Add field to canvas programmatically
   * @param {Object} fieldTypeData - Field type configuration
   */
  const addFieldToCanvas = (fieldTypeData) => {
    const fieldId = `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Calculate drop position based on existing fields
    const maxY = fields.length > 0
      ? Math.max(...fields.map(f => (f.position?.y || 0) + (f.position?.height || 1)))
      : 0;

    // Create new field
    const newField = {
      id: fieldId,
      type: fieldTypeData.type,
      ...fieldTypeData.defaultProps,
      position: {
        x: 0,
        y: maxY,
        width: 6,
        height: 1
      }
    };

    onFieldUpdate(null, newField);

    // Provide visual feedback
    setTimeout(() => {
      onFieldSelect(fieldId);
    }, 100);
  };

  /**
   * Handle field drop from palette with enhanced feedback
   * @param {DragEvent} e - Drop event
   */
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    setDropIndicator(null);

    // Cleanup any drag state from palette (failsafe)
    document.body.classList.remove('field-dragging');

    const fieldTypeData = e.dataTransfer.getData('fieldType');
    if (!fieldTypeData) return;

    try {
      const fieldType = JSON.parse(fieldTypeData);
      addFieldToCanvas(fieldType);
    } catch (error) {
      console.error('Error adding field:', error);
    }
  };

  /**
   * Handle drag over event with visual feedback
   * @param {DragEvent} e - Drag over event
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDraggingOver(true);

    // Calculate drop position indicator
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    setDropIndicator({ y: relativeY });
  };

  /**
   * Handle drag leave event
   * @param {DragEvent} e - Drag leave event
   */
  const handleDragLeave = (e) => {
    // Only process if we're leaving the canvas container itself (not child elements)
    if (e.currentTarget === e.target) {
      setIsDraggingOver(false);
      setDropIndicator(null);

      // Cleanup drag state when leaving canvas area
      // This handles the case where user drags out of bounds
      document.body.classList.remove('field-dragging');
    }
  };

  /**
   * Deselect field when clicking canvas background
   * @param {MouseEvent} e - Click event
   */
  const handleCanvasClick = (e) => {
    if (e.target === e.currentTarget || e.target.classList.contains('react-grid-layout')) {
      onFieldSelect(null);
    }
  };

  /**
   * Handle keyboard navigation in canvas
   * @param {KeyboardEvent} e - Keyboard event
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onFieldSelect(null);
    }
  };

  return (
    <div
      ref={canvasRef}
      className={`design-canvas ${isDraggingOver ? 'drag-over' : ''} ${fields.length === 0 ? 'empty' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleCanvasClick}
      onKeyDown={handleKeyDown}
      role="main"
      aria-label="Form design canvas"
      tabIndex={-1}
    >
      {/* Drop indicator line */}
      {isDraggingOver && dropIndicator && (
        <div
          className="drop-indicator"
          style={{ top: `${dropIndicator.y}px` }}
          aria-hidden="true"
        />
      )}

      {fields.length === 0 ? (
        <div className="canvas-empty-state" role="status">
          <div className="empty-state-icon" aria-hidden="true">📋</div>
          <h3>Start Designing Your Form</h3>
          <p>Drag fields from the left panel or use keyboard shortcuts to build your form</p>

          {/* Enhanced instructional steps */}
          <div className="empty-state-steps">
            <div className="empty-state-step">
              <div className="empty-state-step-number" aria-hidden="true">1</div>
              <span className="empty-state-step-text">Browse field types in the left panel</span>
            </div>
            <div className="empty-state-step">
              <div className="empty-state-step-number" aria-hidden="true">2</div>
              <span className="empty-state-step-text">Drag or press Enter to add fields</span>
            </div>
            <div className="empty-state-step">
              <div className="empty-state-step-number" aria-hidden="true">3</div>
              <span className="empty-state-step-text">Click fields to configure properties</span>
            </div>
            <div className="empty-state-step">
              <div className="empty-state-step-number" aria-hidden="true">4</div>
              <span className="empty-state-step-text">Resize and reposition as needed</span>
            </div>
          </div>

          <div className="empty-state-hint">
            <span className="hint-badge">Pro Tip</span>
            Fields automatically stack vertically when added
          </div>
        </div>
      ) : (
        <GridLayout
          key={`grid-${containerWidth}`}
          className="layout"
          layout={layouts}
          cols={12}
          rowHeight={60}
          width={containerWidth}
          onDragStart={handleDragStart}
          onDragStop={handleDragStop}
          onResizeStart={handleResizeStart}
          onResizeStop={handleResizeStop}
          draggableHandle=".drag-handle"
          compactType={null}
          preventCollision={true}
          margin={[16, 16]}
          containerPadding={[24, 24]}
          useCSSTransforms={true}
          isDraggable={true}
          isResizable={true}
          resizeHandles={['se']}
          aria-label="Draggable form fields"
        >
          {fields.map(field => (
            <div
              key={field.id}
              role="group"
              aria-label={`${field.label} field`}
            >
              <FieldRenderer
                field={field}
                isSelected={selectedFieldId === field.id}
                onSelect={() => onFieldSelect(field.id)}
                onDelete={() => onFieldDelete(field.id)}
              />
            </div>
          ))}
        </GridLayout>
      )}
    </div>
  );
}

DesignCanvas.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    label: PropTypes.string,
    position: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
      width: PropTypes.number,
      height: PropTypes.number
    })
  })).isRequired,
  onFieldUpdate: PropTypes.func.isRequired,
  onFieldDelete: PropTypes.func.isRequired,
  onFieldSelect: PropTypes.func.isRequired,
  selectedFieldId: PropTypes.string
};
