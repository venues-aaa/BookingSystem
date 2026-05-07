import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCategoryById } from '../services/categoryService';
import { getItemsByCategory } from '../services/itemService';
import ItemCard from '../components/hall/ItemCard';
import './CategoryItemsPage.css';

/**
 * CategoryItemsPage - Generic page to browse items in any category
 *
 * Shows all items (Hall, Catering, Decoration, etc.) for a specific category.
 * Completely schema-driven and category-agnostic.
 *
 * URL: /category/:categoryId/items
 */
const CategoryItemsPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const pageSize = 12; // 12 items per page

  useEffect(() => {
    loadCategoryAndItems();
  }, [categoryId, page]);

  const loadCategoryAndItems = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load category details
      const categoryData = await getCategoryById(categoryId);
      console.log('Category data loaded:', categoryData);
      console.log('Category icon:', categoryData.icon);
      setCategory(categoryData);

      // Load items for this category
      const response = await getItemsByCategory(categoryData.name, { page, size: pageSize });
      setItems(response.data || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);

      setLoading(false);
    } catch (err) {
      console.error('Failed to load category items:', err);
      setError('Failed to load items. Please try again.');
      setLoading(false);
    }
  };

  const handleItemClick = (item) => {
    // Navigate to item details/booking page
    navigate(`/booking/${item.id}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading && page === 0) {
    return (
      <div className="category-items-page">
        <div className="container">
          <div className="loading-state">
            <div className="spinner-border text-gold" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="sr-only">Loading...</span>
            </div>
            <p style={{ marginTop: '20px', color: '#707079' }}>Loading items...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-items-page">
        <div className="container">
          <div className="error-state">
            <i className="fas fa-exclamation-triangle"></i>
            <h3>Oops! Something went wrong</h3>
            <p>{error}</p>
            <button onClick={() => loadCategoryAndItems()} className="primary-btn">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="category-items-page">
        <div className="container">
          <div className="error-state">
            <i className="fas fa-question-circle"></i>
            <h3>Category Not Found</h3>
            <p>The category you're looking for doesn't exist.</p>
            <button onClick={() => navigate('/')} className="primary-btn">
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="category-items-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <div className="breadcrumb">
            <a href="/">Home</a>
            <span> / </span>
            <span>{category.displayName}</span>
          </div>
          <h1>
            <span className="category-icon">{category.icon || '📦'}</span>
            {category.displayName}
          </h1>
          {category.description && (
            <p className="category-description">{category.description}</p>
          )}
        </div>

        {/* Stats Summary */}
        <div className="stats-bar">
          <div className="stat-item">
            <i className="fas fa-list"></i>
            <span>{totalElements} {totalElements === 1 ? 'Item' : 'Items'} Available</span>
          </div>
          <div className="stat-item">
            <i className="fas fa-check-circle"></i>
            <span>{items.filter(i => i.status === 'Active').length} Active</span>
          </div>
        </div>

        {/* Items Grid */}
        {items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{category.icon || '📦'}</div>
            <h3>No {category.displayName} Available</h3>
            <p>There are currently no items in this category. Please check back later.</p>
            <button onClick={() => navigate('/')} className="primary-btn">
              Browse Other Categories
            </button>
          </div>
        ) : (
          <>
            <div className="items-grid">
              {items.map((item) => (
                <div key={item.id} className="item-card-wrapper">
                  <ItemCard
                    item={item}
                    category={category}
                    onClick={() => handleItemClick(item)}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 0}
                  className="pagination-btn"
                >
                  <i className="fas fa-chevron-left"></i> Previous
                </button>

                <div className="page-numbers">
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index)}
                      className={`page-number ${page === index ? 'active' : ''}`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages - 1}
                  className="pagination-btn"
                >
                  Next <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryItemsPage;
