import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FieldPalette from './FieldPalette';
import DesignCanvas from './DesignCanvas';
import FieldPropertiesPanel from './FieldPropertiesPanel';
import TemplateModal from './TemplateModal';
import { getCategoryById, updateCategory } from '../../services/categoryService';
import './FormBuilder.css';

/**
 * FormBuilder Component
 *
 * Main form builder interface for designing category forms.
 * Integrates palette, canvas, and properties panel.
 * Supports saving and loading form templates.
 */
export default function FormBuilder() {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [fields, setFields] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [primaryNameFieldId, setPrimaryNameFieldId] = useState(null);

  // Template modal state
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateModalMode, setTemplateModalMode] = useState('load'); // 'save' or 'load'

  // Load category on mount
  useEffect(() => {
    loadCategory();
  }, [categoryId]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCategoryById(categoryId);
      setCategory(data);
      setFields(data.formSchema?.fields || []);
      setPrimaryNameFieldId(data.primaryNameFieldId || null);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load category:', error);
      setError('Failed to load category. Please try again.');
      setLoading(false);
    }
  };

  /**
   * Handle field updates (add or modify)
   */
  const handleFieldUpdate = (fieldId, updatedField) => {
    if (fieldId === null) {
      // Add new field
      setFields([...fields, updatedField]);
      // Auto-select the new field
      setSelectedFieldId(updatedField.id);
    } else {
      // Update existing field
      setFields(fields.map(f => f.id === fieldId ? updatedField : f));
    }
  };

  /**
   * Handle field deletion
   */
  const handleFieldDelete = (fieldId) => {
    setFields(fields.filter(f => f.id !== fieldId));
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  };

  /**
   * Save form schema to backend
   */
  const handleSave = async () => {
    // Validation
    if (fields.length === 0) {
      alert('Please add at least one field to the form');
      return;
    }

    // Check all fields have labels
    const missingLabels = fields.filter(f => !f.label || f.label.trim() === '');
    if (missingLabels.length > 0) {
      alert('All fields must have a label');
      return;
    }

    // Check if primary name field is set
    if (!primaryNameFieldId) {
      const confirmSave = window.confirm(
        'Warning: No primary name field selected.\n\n' +
        'Items in this category may display as "Unnamed Item".\n\n' +
        'Do you want to save anyway?'
      );
      if (!confirmSave) {
        return;
      }
    }

    try {
      setSaving(true);

      const updatedCategory = {
        ...category,
        primaryNameFieldId: primaryNameFieldId,
        formSchema: {
          fields: fields,
          layout: {
            columns: 12,
            rowHeight: 60
          },
          version: (category.formSchema?.version || 0) + 1
        }
      };

      await updateCategory(categoryId, updatedCategory);
      alert('Form schema saved successfully!');
      navigate('/admin/categories');
    } catch (error) {
      console.error('Failed to save form schema:', error);
      alert('Failed to save form schema. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Preview mode
   */
  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  /**
   * Open template modal in save mode
   */
  const handleSaveAsTemplate = () => {
    if (fields.length === 0) {
      alert('Please add fields before saving as template');
      return;
    }
    setTemplateModalMode('save');
    setShowTemplateModal(true);
  };

  /**
   * Open template modal in load mode
   */
  const handleLoadTemplate = () => {
    setTemplateModalMode('load');
    setShowTemplateModal(true);
  };

  /**
   * Apply template fields to current form
   */
  const handleApplyTemplate = (templateFields) => {
    setFields(templateFields);
    setSelectedFieldId(null);
  };

  const selectedField = fields.find(f => f.id === selectedFieldId);

  if (loading) {
    return (
      <div className="form-builder-loading">
        <div className="spinner"></div>
        <p>Loading category...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="form-builder-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/admin/categories')}>
          Back to Categories
        </button>
      </div>
    );
  }

  if (previewMode) {
    return (
      <div className="form-builder-preview">
        <div className="preview-header">
          <h2>Preview: {category?.displayName}</h2>
          <button onClick={togglePreview} className="btn-secondary">
            Back to Designer
          </button>
        </div>
        <div className="preview-content">
          <div className="preview-form">
            {fields.map(field => (
              <div key={field.id} className="preview-field">
                <label>
                  {field.label}
                  {field.required && <span style={{color: 'red'}}>*</span>}
                </label>
                <div className="preview-field-placeholder">
                  [{field.type} field preview]
                </div>
                {field.helpText && (
                  <small className="preview-help">{field.helpText}</small>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-builder">
      {/* Header */}
      <div className="form-builder-header">
        <div className="header-left">
          <h2>Design Form: {category?.displayName}</h2>
          <span className="header-badge">{fields.length} field{fields.length !== 1 ? 's' : ''}</span>

          {/* Primary Name Field Selector */}
          {fields.length > 0 && (
            <div style={{ marginLeft: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>
                📝 Primary Name Field:
              </label>
              <select
                value={primaryNameFieldId || ''}
                onChange={(e) => setPrimaryNameFieldId(e.target.value || null)}
                style={{
                  padding: '6px 12px',
                  border: primaryNameFieldId ? '1px solid #4caf50' : '2px solid #ff9800',
                  borderRadius: '4px',
                  fontSize: '13px',
                  background: primaryNameFieldId ? '#f1f8f4' : '#fff8e1',
                  cursor: 'pointer'
                }}
                title="Select which field should be used as the item's display name"
              >
                <option value="">⚠️ Not set (will show 'Unnamed Item')</option>
                {fields
                  .filter(f => f.type === 'text' || f.type === 'textarea')
                  .map(field => (
                    <option key={field.id} value={field.id}>
                      {field.label || field.id}
                      {field.id === primaryNameFieldId && ' ✓'}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>
        <div className="header-actions">
          <button
            onClick={handleLoadTemplate}
            className="btn-secondary"
            title="Load a saved template"
          >
            📥 Load Template
          </button>
          <button
            onClick={handleSaveAsTemplate}
            className="btn-secondary"
            disabled={fields.length === 0}
            title="Save current design as template"
          >
            💾 Save as Template
          </button>
          <button
            onClick={togglePreview}
            className="btn-secondary"
            disabled={fields.length === 0}
          >
            👁️ Preview
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : '💾 Save'}
          </button>
          <button
            onClick={() => navigate('/admin/categories')}
            className="btn-secondary"
          >
            ✕ Cancel
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="form-builder-body">
        {/* Field Palette */}
        <FieldPalette />

        {/* Design Canvas */}
        <DesignCanvas
          fields={fields}
          onFieldUpdate={handleFieldUpdate}
          onFieldDelete={handleFieldDelete}
          onFieldSelect={setSelectedFieldId}
          selectedFieldId={selectedFieldId}
        />

        {/* Properties Panel */}
        <FieldPropertiesPanel
          field={selectedField}
          onFieldUpdate={handleFieldUpdate}
        />
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <TemplateModal
          mode={templateModalMode}
          fields={fields}
          onClose={() => setShowTemplateModal(false)}
          onApplyTemplate={handleApplyTemplate}
        />
      )}
    </div>
  );
}
