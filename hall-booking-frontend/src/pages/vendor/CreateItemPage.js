import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCategories, getCategoryById } from '../../services/categoryService';
import { createItem, updateItem, getItemById } from '../../services/itemService';
import DynamicItemForm from '../../components/dynamicForm/DynamicItemForm';
import './CreateItemPage.css';

/**
 * CreateItemPage Component
 *
 * Allows vendors to select a category and create/edit an item
 * using the admin-designed dynamic form.
 *
 * Edit mode: When itemId is in URL params, loads existing item for editing
 */
const CreateItemPage = ({ editMode = false }) => {
  const navigate = useNavigate();
  const { categoryId, itemId } = useParams();

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [existingItem, setExistingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (editMode && itemId) {
      loadItemForEdit();
    } else {
      loadCategories();
    }
  }, [editMode, itemId]);

  useEffect(() => {
    if (categoryId && categories.length > 0) {
      loadCategory(categoryId);
    }
  }, [categoryId, categories]);

  const loadItemForEdit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load the item
      const item = await getItemById(itemId);
      setExistingItem(item);

      // Load the category for this item
      const category = await getCategoryById(item.categoryId);
      setSelectedCategory(category);

      setLoading(false);
    } catch (err) {
      console.error('Failed to load item:', err);
      setError('Failed to load item for editing');
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const loadCategory = async (id) => {
    try {
      setLoading(true);
      const category = await getCategoryById(id);
      setSelectedCategory(category);
      setError(null);
    } catch (err) {
      console.error('Failed to load category:', err);
      setError('Failed to load category');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    navigate(`/vendor/items/create/${category.id}`);
  };

  const handleSubmit = async (formData) => {
    try {
      console.log('Form data received:', formData);
      console.log('Category:', selectedCategory);
      console.log('Edit mode:', editMode);

      let result;
      if (editMode && itemId) {
        // Update existing item - pass category object for type and validation
        result = await updateItem(itemId, selectedCategory.id, formData, selectedCategory);
        console.log('Item updated:', result);
        alert('Item updated successfully!');
      } else {
        // Create new item
        result = await createItem(selectedCategory.id, formData, selectedCategory);
        console.log('Item created:', result);
        alert('Item created successfully!');
      }

      // Navigate back to category items page
      navigate(`/vendor/items/${selectedCategory.id}`);
    } catch (error) {
      console.error(`Failed to ${editMode ? 'update' : 'create'} item:`, error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      alert(`Failed to ${editMode ? 'update' : 'create'} item: ${errorMsg}\n\nCheck console for details.`);
    }
  };

  const handleCancel = () => {
    if (editMode && selectedCategory) {
      // Return to category items page when editing
      navigate(`/vendor/items/${selectedCategory.id}`);
    } else if (categoryId) {
      navigate('/vendor/items/create');
    } else {
      navigate('/vendor');
    }
  };

  if (loading) {
    return (
      <div className="create-item-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="create-item-page">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={loadCategories} className="btn-retry">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="create-item-page">
      <div className="page-container">
        {/* Category Selection */}
        {!selectedCategory && (
          <>
            <div className="page-header">
              <button
                className="btn-back"
                onClick={() => navigate('/vendor')}
              >
                ← Back to Dashboard
              </button>
              <h1>Create New Item</h1>
              <p className="header-subtitle">
                Select a category to create an item
              </p>
            </div>

            {categories.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3>No Categories Available</h3>
                <p>No categories have been created yet. Contact an admin to create categories.</p>
              </div>
            ) : (
              <div className="categories-grid">
                {categories.map(category => (
                  <div
                    key={category.id}
                    className="category-card"
                    onClick={() => handleCategorySelect(category)}
                  >
                    <div className="card-icon">
                      {category.icon || '📦'}
                    </div>
                    <div className="card-content">
                      <h3>{category.displayName}</h3>
                      <p>{category.description || 'No description'}</p>
                      <div className="card-meta">
                        <span className="meta-item">
                          {category.formSchema?.fields?.length || 0} fields
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Dynamic Form */}
        {selectedCategory && (
          <>
            <div className="page-header">
              <button
                className="btn-back"
                onClick={() => {
                  if (editMode && selectedCategory) {
                    navigate(`/vendor/items/${selectedCategory.id}`);
                  } else {
                    navigate('/vendor/items/create');
                  }
                }}
              >
                ← Back to {editMode ? 'Items' : 'Categories'}
              </button>
              <h1>{editMode ? 'Edit' : 'Create'} {selectedCategory.displayName}</h1>
            </div>

            <DynamicItemForm
              category={selectedCategory}
              initialData={editMode ? {
                ...existingItem?.dynamicData,
                discountedBundledItems: existingItem?.discountedBundledItems,
                maxConcurrentBookings: existingItem?.maxConcurrentBookings,
                id: existingItem?.id
              } : null}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default CreateItemPage;
