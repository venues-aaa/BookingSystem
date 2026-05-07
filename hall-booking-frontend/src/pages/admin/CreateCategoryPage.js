import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCategory } from '../../services/categoryService';
import EmojiPicker from '../../components/common/EmojiPicker';
import './CreateCategoryPage.css';

/**
 * CreateCategoryPage Component
 *
 * Form to create a new category with basic metadata.
 * After creation, redirects to form builder to design the form schema.
 */
export default function CreateCategoryPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    icon: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Category name is required';
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.name)) {
      newErrors.name = 'Name must be alphanumeric (no spaces)';
    }

    if (!formData.displayName || formData.displayName.trim() === '') {
      newErrors.displayName = 'Display name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSubmitting(true);

      const categoryData = {
        ...formData,
        formSchema: {
          fields: [],
          layout: {
            columns: 12,
            rowHeight: 60
          },
          version: 1
        },
        isActive: true
      };

      const created = await createCategory(categoryData);

      alert('Category created successfully! Now design the form.');
      navigate(`/admin/categories/${created.id}/design`);
    } catch (error) {
      console.error('Failed to create category:', error);
      if (error.response?.status === 409) {
        setErrors({ name: 'Category name already exists' });
      } else {
        alert('Failed to create category. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-category-page">
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <button
            className="btn-back"
            onClick={() => navigate('/admin/categories')}
          >
            ← Back
          </button>
          <h1>Create New Category</h1>
          <p className="header-subtitle">
            Enter basic information, then design the custom form
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-section">
            <h3>Basic Information</h3>

            {/* Name */}
            <div className="form-group">
              <label htmlFor="name">
                Category Name *
                <span className="label-help">(Internal identifier, no spaces)</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
                placeholder="e.g., Catering, Photography, Decoration"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
              <small className="field-help">
                Example: "Catering" - This is used in code and database
              </small>
            </div>

            {/* Display Name */}
            <div className="form-group">
              <label htmlFor="displayName">
                Display Name *
                <span className="label-help">(Shown to users)</span>
              </label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className={errors.displayName ? 'error' : ''}
                placeholder="e.g., Catering Services, Photography Services"
              />
              {errors.displayName && (
                <span className="error-message">{errors.displayName}</span>
              )}
              <small className="field-help">
                Example: "Catering Services" - This is shown to vendors and users
              </small>
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Describe this category..."
              />
              <small className="field-help">
                Brief description of what this category is for
              </small>
            </div>

            {/* Icon */}
            <div className="form-group">
              <label htmlFor="icon">
                Icon
                <span className="label-help">(Click to select an emoji)</span>
              </label>
              <EmojiPicker
                currentEmoji={formData.icon}
                onSelect={(emoji) => setFormData(prev => ({ ...prev, icon: emoji }))}
              />
              <small className="field-help">
                Select an emoji to visually represent this category in menus and listings
              </small>
            </div>
          </div>

          {/* Preview */}
          <div className="form-section preview-section">
            <h3>Preview</h3>
            <div className="category-preview">
              <div className="preview-icon">
                {formData.icon || '📦'}
              </div>
              <div className="preview-content">
                <h4>{formData.displayName || 'Display Name'}</h4>
                <p>{formData.description || 'No description'}</p>
                <div className="preview-meta">
                  <span className="meta-item">ID: {formData.name || 'name'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/admin/categories')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create & Design Form'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
