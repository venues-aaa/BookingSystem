import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCategoryById } from '../../services/categoryService';
import { getItemDisplayName, getItemDescription, getItemCapacity, getItemPrice, deleteItem, deactivateItem } from '../../services/itemService';
import { useAuth } from '../../context/AuthContext';
import { getItemImage } from '../../utils/imageUtils';
import './VendorCategoryItemsPage.css';

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

  // If already an emoji (non-ASCII characters), return as-is
  if (icon.length <= 2 && /[\u{1F300}-\u{1F9FF}]/u.test(icon)) {
    return icon;
  }

  // Otherwise, map text to emoji
  const lowerIcon = icon.toLowerCase().trim();
  return ICON_MAP[lowerIcon] || ICON_MAP.default;
}

/**
 * VendorCategoryItemsPage Component
 *
 * Displays all items created by the vendor for a specific category
 * Example: "My Halls", "My Catering", etc.
 */
export default function VendorCategoryItemsPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [category, setCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategoryAndItems();
  }, [categoryId]);

  const loadCategoryAndItems = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load category details
      const categoryData = await getCategoryById(categoryId);
      setCategory(categoryData);

      // Load vendor's items for this category
      // TODO: Implement API call to fetch vendor's items filtered by categoryId
      // For now, using mock data
      await loadVendorItems(categoryId);

      setLoading(false);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load items');
      setLoading(false);
    }
  };

  const loadVendorItems = async (catId) => {
    try {
      if (!user || !user.id) {
        console.warn('User ID not available');
        setItems([]);
        return;
      }

      const response = await fetch(
        `http://localhost:8080/item/vendor/${user.id}?categoryId=${catId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }

      const data = await response.json();
      const itemsList = data.data || data.items || data.halls || [];

      console.log('Loaded vendor items:', itemsList);
      setItems(itemsList);
    } catch (err) {
      console.error('Failed to load vendor items:', err);
      setItems([]);
    }
  };

  const handleCreateNew = () => {
    navigate(`/vendor/items/create/${categoryId}`);
  };

  const handleEditItem = (itemId) => {
    navigate(`/vendor/items/edit/${itemId}`);
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      // Try to delete the item
      await deleteItem(itemId);
      alert('Item deleted successfully');
      // Reload items to reflect deletion
      loadVendorItems(categoryId);
    } catch (err) {
      console.error('Failed to delete item:', err);

      // Check if the error is because item has bookings
      if (err.response && err.response.data && err.response.data.hasBookings) {
        // Item has bookings - ask if user wants to deactivate instead
        const message = err.response.data.message + '\n\nWould you like to deactivate it instead? ' +
                       'Deactivating will prevent new bookings but preserve existing booking history.';

        if (window.confirm(message)) {
          try {
            await deactivateItem(itemId);
            alert('Item deactivated successfully. It will no longer accept new bookings.');
            loadVendorItems(categoryId);
          } catch (deactivateErr) {
            console.error('Failed to deactivate item:', deactivateErr);
            alert('Failed to deactivate item: ' + (deactivateErr.message || 'Unknown error'));
          }
        }
      } else {
        // Other error
        alert('Failed to delete item: ' + (err.response?.data?.message || err.message || 'Unknown error'));
      }
    }
  };

  if (loading) {
    return (
      <div className="vendor-items-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vendor-items-page">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={loadCategoryAndItems}>Retry</button>
        </div>
      </div>
    );
  }

  const categoryName = category?.displayName || category?.name || 'Items';

  return (
    <div className="vendor-items-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">{getIconEmoji(category?.icon)}</div>
          <div className="header-text">
            <h1>My {categoryName}</h1>
            <p>Manage your {categoryName.toLowerCase()} items</p>
          </div>
        </div>
        <button className="btn-create" onClick={handleCreateNew}>
          <i className="fa fa-plus"></i> Create New {categoryName}
        </button>
      </div>

      {/* Items Grid */}
      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{getIconEmoji(category?.icon)}</div>
          <h3>No {categoryName} Items Yet</h3>
          <p>Create your first {categoryName.toLowerCase()} item to start accepting bookings</p>
          <button className="btn-primary" onClick={handleCreateNew}>
            <i className="fa fa-plus"></i> Create First {categoryName}
          </button>
        </div>
      ) : (
        <div className="items-grid">
          {items.map((item) => {
            // Use centralized schema-driven extraction functions
            const itemName = getItemDisplayName(item);
            const itemDescription = getItemDescription(item);
            const itemCapacity = getItemCapacity(item);
            const itemPrice = getItemPrice(item);
            const itemStatus = item.status || 'ACTIVE';

            // Get item image with automatic fallback
            const itemImage = getItemImage(item);

            return (
              <div key={item.id} className="item-card">
                <div className="item-image">
                  <img
                    src={itemImage}
                    alt={itemName}
                    onError={(e) => {
                      // If image fails to load, use category default
                      e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80';
                    }}
                  />
                </div>
                <div className="item-content">
                  <h3>{itemName}</h3>
                  <p className="item-description">{itemDescription}</p>
                  <div className="item-stats">
                    {itemCapacity > 0 && (
                      <div className="item-stat">
                        <i className="fa fa-users"></i> {itemCapacity} guests
                      </div>
                    )}
                  </div>
                  <div className="item-meta">
                    <span className={`status-badge ${itemStatus.toLowerCase()}`}>
                      {itemStatus}
                    </span>
                    {itemPrice !== null && itemPrice > 0 && (
                      <span className="item-price">
                        ₹{itemPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="item-actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEditItem(item.id)}
                  >
                    <i className="fa fa-edit"></i> Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    <i className="fa fa-trash"></i> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{items.length}</div>
            <div className="stat-label">Total Items</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">
              {items.filter(i => i.status === 'Active').length}
            </div>
            <div className="stat-label">Active Items</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">0</div>
            <div className="stat-label">Bookings This Month</div>
          </div>
        </div>
      </div>
    </div>
  );
}
