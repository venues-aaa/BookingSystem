import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAllCategories, deleteCategory, getCategoryStats } from '../../services/categoryService';
import './CategoriesPage.css';

/**
 * CategoriesPage Component
 *
 * Admin page to manage categories. Shows list of all categories
 * with options to create, edit, design forms, and delete.
 */
export default function CategoriesPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reload categories when coming back from edit page
  useEffect(() => {
    loadCategories();
  }, [location.state?.refresh]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllCategories();
      setCategories(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setError('Failed to load categories');
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId, categoryName) => {
    if (!window.confirm(`Are you sure you want to delete "${categoryName}"?`)) {
      return;
    }

    try {
      await deleteCategory(categoryId);
      alert('Category deleted successfully');
      loadCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Failed to delete category. It may have existing items.');
    }
  };

  const handleDesignForm = (categoryId) => {
    navigate(`/admin/categories/${categoryId}/design`);
  };

  const handleEdit = (categoryId) => {
    navigate(`/admin/categories/${categoryId}/edit`);
  };

  if (loading) {
    return (
      <div className="categories-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="categories-page">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={loadCategories}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1>Category Management</h1>
          <p className="header-subtitle">
            Design and manage booking categories with custom forms
          </p>
        </div>
        <button
          className="btn-create"
          onClick={() => navigate('/admin/categories/create')}
        >
          + New Category
        </button>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Categories Yet</h3>
          <p>Create your first category to start designing custom booking forms</p>
          <button
            className="btn-primary"
            onClick={() => navigate('/admin/categories/create')}
          >
            Create First Category
          </button>
        </div>
      ) : (
        <div className="categories-grid">
          {categories.map(category => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={handleEdit}
              onDesign={handleDesignForm}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Icon mapping - converts text icon names to emojis
 */
const ICON_MAP = {
  'restaurant': '🍽️',
  'catering': '🍽️',
  'food': '🍴',
  'hall': '🏛️',
  'event': '🎪',
  'decoration': '🎨',
  'floral': '💐',
  'flower': '🌸',
  'music': '🎵',
  'dj': '🎧',
  'photo': '📸',
  'photography': '📷',
  'video': '🎥',
  'venue': '🏢',
  'hotel': '🏨',
  'default': '📦'
};

/**
 * Get icon emoji from text or emoji input
 */
function getIconEmoji(icon) {
  if (!icon) return ICON_MAP.default;

  // If already an emoji (contains emoji characters), return as-is
  // Check for any emoji using a comprehensive regex
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2300}-\u{23FF}\u{2B50}\u{2934}-\u{2935}\u{3030}\u{303D}\u{3297}\u{3299}]/u;

  if (emojiRegex.test(icon)) {
    return icon;
  }

  // Otherwise, map text to emoji
  const lowerIcon = icon.toLowerCase().trim();
  return ICON_MAP[lowerIcon] || ICON_MAP.default;
}

/**
 * CategoryCard Component
 */
function CategoryCard({ category, onEdit, onDesign, onDelete }) {
  const [stats, setStats] = useState(null);
  const [showAllFields, setShowAllFields] = useState(false);

  useEffect(() => {
    loadStats();
  }, [category.id]);

  const loadStats = async () => {
    try {
      const data = await getCategoryStats(category.id);
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const fieldCount = category.formSchema?.fields?.length || 0;
  const hasSchema = fieldCount > 0;
  const fields = category.formSchema?.fields || [];
  const displayFields = showAllFields ? fields : fields.slice(0, 3);

  return (
    <div className={`category-card ${!category.isActive ? 'inactive' : ''}`}>
      {/* Card Header */}
      <div className="card-header">
        <div className="card-icon">{getIconEmoji(category.icon)}</div>
        <div className="card-title">
          <h3>{category.displayName || category.name}</h3>
          {!category.isActive && <span className="badge-inactive">Inactive</span>}
        </div>
      </div>

      {/* Card Body */}
      <div className="card-body">
        <p className="card-description">
          {category.description || 'No description provided'}
        </p>

        {/* Stats Row */}
        <div className="card-stats-row">
          <div className="stat-box">
            <div className="stat-number">{fieldCount}</div>
            <div className="stat-label">Form Fields</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{stats?.itemCount || 0}</div>
            <div className="stat-label">Items</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">v{category.formSchema?.version || 0}</div>
            <div className="stat-label">Schema</div>
          </div>
        </div>

        {/* Form Fields List */}
        {hasSchema ? (
          <div className="fields-section">
            <div className="fields-header">
              <h4>Form Fields ({fieldCount})</h4>
            </div>
            <div className="fields-list">
              {displayFields.map((field, index) => (
                <div key={field.id || index} className="field-item">
                  <span className="field-type-badge">{field.type}</span>
                  <span className="field-label">{field.label}</span>
                  {field.required && <span className="field-required">*</span>}
                </div>
              ))}
            </div>
            {fields.length > 3 && (
              <button
                className="btn-show-more"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllFields(!showAllFields);
                }}
              >
                {showAllFields ? 'Show Less' : `Show ${fields.length - 3} More`}
              </button>
            )}
          </div>
        ) : (
          <div className="card-warning">
            <span className="warning-icon">⚠️</span>
            <span>No form schema designed yet</span>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="card-actions">
        <button
          className="btn-action btn-edit"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(category.id);
          }}
          title="Edit category details"
        >
          <span className="btn-icon">✏️</span>
          Edit
        </button>
        <button
          className="btn-action btn-design"
          onClick={(e) => {
            e.stopPropagation();
            onDesign(category.id);
          }}
          title={hasSchema ? 'Edit form schema' : 'Design form schema'}
        >
          <span className="btn-icon">🎨</span>
          {hasSchema ? 'Edit Form' : 'Design Form'}
        </button>
        <button
          className="btn-action btn-delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(category.id, category.displayName);
          }}
          title="Delete category"
        >
          <span className="btn-icon">🗑️</span>
          Delete
        </button>
      </div>

      {/* Last Updated */}
      {category.lastModifiedOn && (
        <div className="card-footer">
          <span className="footer-label">Last updated:</span>
          <span className="footer-value">
            {new Date(category.lastModifiedOn).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </span>
        </div>
      )}
    </div>
  );
}
