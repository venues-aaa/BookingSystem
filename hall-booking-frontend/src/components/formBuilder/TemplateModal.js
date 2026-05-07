import React, { useState, useEffect } from 'react';
import {
  getAllTemplates,
  createTemplate,
  applyTemplate,
  deleteTemplate,
  searchTemplates
} from '../../services/formTemplateService';
import './TemplateModal.css';

/**
 * TemplateModal Component
 *
 * Modal dialog for saving current form as template or loading existing templates.
 * Supports search, preview, and delete operations.
 */
export default function TemplateModal({ mode, fields, onClose, onApplyTemplate }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Save mode state
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateCategory, setTemplateCategory] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode === 'load') {
      loadTemplates();
    }
  }, [mode]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await getAllTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
      alert('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      loadTemplates();
      return;
    }

    try {
      setLoading(true);
      const data = await searchTemplates(query);
      setTemplates(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    if (fields.length === 0) {
      alert('Cannot save an empty form as a template');
      return;
    }

    try {
      setSaving(true);

      const templateData = {
        name: templateName,
        description: templateDescription,
        category: templateCategory,
        schema: {
          fields: fields,
          layout: {
            columns: 12,
            rowHeight: 60
          },
          version: 1
        },
        isActive: true
      };

      await createTemplate(templateData);
      alert('Template saved successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to save template:', error);
      alert(error.response?.data?.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyTemplate = async (templateId) => {
    if (!window.confirm('Applying this template will replace your current form design. Continue?')) {
      return;
    }

    try {
      setLoading(true);
      const schema = await applyTemplate(templateId);
      onApplyTemplate(schema.fields);
      alert('Template applied successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to apply template:', error);
      alert('Failed to apply template');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId, templateName) => {
    if (!window.confirm(`Delete template "${templateName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteTemplate(templateId);
      alert('Template deleted successfully');
      loadTemplates();
    } catch (error) {
      console.error('Failed to delete template:', error);
      alert('Failed to delete template');
    }
  };

  return (
    <div className="template-modal-overlay" onClick={onClose}>
      <div className="template-modal" onClick={(e) => e.stopPropagation()}>
        <div className="template-modal-header">
          <h2>{mode === 'save' ? 'Save as Template' : 'Load Template'}</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="template-modal-body">
          {mode === 'save' ? (
            /* Save Mode */
            <div className="template-save-form">
              <div className="form-group">
                <label>Template Name *</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Wedding Hall Form"
                  className="template-input"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Describe what this template is for..."
                  className="template-textarea"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={templateCategory}
                  onChange={(e) => setTemplateCategory(e.target.value)}
                  className="template-select"
                >
                  <option value="">Select category...</option>
                  <option value="event">Event Venues</option>
                  <option value="venue">General Venues</option>
                  <option value="equipment">Equipment</option>
                  <option value="service">Services</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="template-preview-info">
                <p>This template will contain {fields.length} field{fields.length !== 1 ? 's' : ''}:</p>
                <div className="field-list-preview">
                  {fields.map(field => (
                    <span key={field.id} className="field-tag">
                      {field.label} ({field.type})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Load Mode */
            <div className="template-load-container">
              <div className="template-search">
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="template-search-input"
                />
              </div>

              {loading ? (
                <div className="template-loading">
                  <div className="spinner-small"></div>
                  <p>Loading templates...</p>
                </div>
              ) : templates.length === 0 ? (
                <div className="template-empty">
                  <p>No templates found</p>
                </div>
              ) : (
                <div className="template-list">
                  {templates.map(template => (
                    <div
                      key={template.id}
                      className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="template-card-header">
                        <h3>{template.name}</h3>
                        {template.category && (
                          <span className="template-category-badge">{template.category}</span>
                        )}
                      </div>

                      {template.description && (
                        <p className="template-description">{template.description}</p>
                      )}

                      <div className="template-card-meta">
                        <span className="template-field-count">
                          {template.schema?.fields?.length || 0} fields
                        </span>
                        <span className="template-usage">
                          Used {template.usageCount || 0} times
                        </span>
                      </div>

                      <div className="template-card-actions">
                        <button
                          className="btn-apply"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyTemplate(template.id);
                          }}
                        >
                          Apply
                        </button>
                        <button
                          className="btn-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTemplate(template.id, template.name);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="template-modal-footer">
          {mode === 'save' ? (
            <>
              <button
                className="btn-secondary"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSaveTemplate}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Template'}
              </button>
            </>
          ) : (
            <button
              className="btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
