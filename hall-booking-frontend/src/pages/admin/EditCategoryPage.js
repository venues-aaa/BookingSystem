import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCategoryById, updateCategory, deactivateCategory, deleteCategory } from '../../services/categoryService';
import EmojiPicker from '../../components/common/EmojiPicker';
import './CreateCategoryPage.css';

/**
 * EditCategoryPage Component
 *
 * Form to edit an existing category's basic metadata.
 * Uses the same styles as CreateCategoryPage for consistency.
 */
export default function EditCategoryPage() {
  const navigate = useNavigate();
  const { categoryId } = useParams();

  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    icon: '',
    isActive: true
  });

  const [originalCategory, setOriginalCategory] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategory();
  }, [categoryId]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      const category = await getCategoryById(categoryId);
      setOriginalCategory(category);
      setFormData({
        name: category.name || '',
        displayName: category.displayName || '',
        description: category.description || '',
        icon: category.icon || '',
        isActive: category.isActive !== false
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to load category:', error);
      alert('Failed to load category');
      navigate('/admin/categories');
    }
  };

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

      const updatedCategory = {
        ...originalCategory,
        displayName: formData.displayName,
        description: formData.description,
        icon: formData.icon,
        isActive: formData.isActive,
        // Name is not editable to prevent breaking references
        name: originalCategory.name
      };

      await updateCategory(categoryId, updatedCategory);

      alert('Category updated successfully!');
      // Navigate with state to force refresh
      navigate('/admin/categories', { replace: true, state: { refresh: Date.now() } });
    } catch (error) {
      console.error('Failed to update category:', error);
      alert('Failed to update category. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm(`Are you sure you want to deactivate the category "${formData.displayName}"? It will be hidden from vendors but existing items will remain intact.`)) {
      return;
    }

    try {
      setSubmitting(true);
      await deactivateCategory(categoryId);
      alert('Category deactivated successfully! It is now hidden from vendors.');
      navigate('/admin/categories');
    } catch (error) {
      console.error('Failed to deactivate category:', error);
      const errorMessage = error.response?.data?.error || 'Failed to deactivate category. Please try again.';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`⚠️ PERMANENT DELETE: Are you sure you want to permanently delete the category "${formData.displayName}"? This action CANNOT be undone and will fail if any items exist in this category.`)) {
      return;
    }

    try {
      setSubmitting(true);
      await deleteCategory(categoryId);
      alert('Category deleted permanently!');
      navigate('/admin/categories');
    } catch (error) {
      console.error('Failed to delete category:', error);
      const errorMessage = error.response?.data?.error || 'Failed to delete category. Please try again.';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="create-category-page">
        <div className="page-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading category...</p>
          </div>
        </div>
      </div>
    );
  }

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
          <h1>Edit Category</h1>
          <p className="header-subtitle">
            Update category information
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-section">
            <h3>Basic Information</h3>

            {/* Name (Read-only) */}
            <div className="form-group">
              <label htmlFor="name">
                Category Name
                <span className="label-help">(Cannot be changed)</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                disabled
                className="disabled"
              />
              <small className="field-help">
                Category name cannot be changed to prevent breaking existing references
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
                This is shown to vendors and users
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

            {/* Active Status */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: '500' }}>Active</span>
              </label>
              <small className="field-help">
                Only active categories are visible to vendors and users
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
                  <span className="meta-item">ID: {formData.name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Actions - Save and Cancel */}
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
              style={{
                background: '#10b981',
                fontSize: '15px',
                fontWeight: '600',
                padding: '12px 32px'
              }}
              onMouseEnter={(e) => !submitting && (e.target.style.background = '#059669')}
              onMouseLeave={(e) => !submitting && (e.target.style.background = '#10b981')}
            >
              {submitting ? 'Saving Changes...' : '✓ Save Changes'}
            </button>
          </div>

          {/* Secondary Actions - Advanced Options */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', margin: '0 0 8px 0' }}>
                Advanced Options
              </h4>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                Design form schema or manage category status
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => navigate(`/admin/categories/${categoryId}/design`)}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = '#2563eb'}
                onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
              >
                🎨 Design Form
              </button>
              <button
                type="button"
                onClick={handleDeactivate}
                disabled={submitting || !formData.isActive}
                style={{
                  background: formData.isActive ? '#f59e0b' : '#9ca3af',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: (submitting || !formData.isActive) ? 'not-allowed' : 'pointer',
                  opacity: (submitting || !formData.isActive) ? 0.5 : 1,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => !submitting && formData.isActive && (e.target.style.background = '#d97706')}
                onMouseLeave={(e) => formData.isActive && (e.target.style.background = '#f59e0b')}
                title={!formData.isActive ? 'Category is already inactive' : 'Hide from vendors'}
              >
                🔒 Deactivate
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                style={{
                  background: '#dc2626',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.5 : 1,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => !submitting && (e.target.style.background = '#b91c1c')}
                onMouseLeave={(e) => e.target.style.background = '#dc2626'}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
