import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../../services/categoryService';
import { getVendorItems } from '../../services/itemService';
import '../admin/Admin.css';

const VendorDashboard = () => {
  const [categories, setCategories] = useState([]);
  const [itemStats, setItemStats] = useState({}); // Stats per category
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get user from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) {
        console.error('User not found');
        setLoading(false);
        return;
      }

      // Load all active categories
      const categoriesData = await getCategories();
      setCategories(categoriesData);

      // Load vendor's items for each category
      const stats = {};
      for (const category of categoriesData) {
        try {
          const itemsData = await getVendorItems(user.id, category.id);
          const items = itemsData.data || itemsData.items || itemsData.halls || [];

          stats[category.id] = {
            total: items.length,
            active: items.filter(item => item.status === 'Active').length,
            categoryName: category.displayName,
            categoryIcon: category.icon || '📦'
          };
        } catch (error) {
          console.error(`Failed to load items for category ${category.name}:`, error);
          stats[category.id] = {
            total: 0,
            active: 0,
            categoryName: category.displayName,
            categoryIcon: category.icon || '📦'
          };
        }
      }

      setItemStats(stats);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setLoading(false);
    }
  };

  const getTotalItems = () => {
    return Object.values(itemStats).reduce((sum, stat) => sum + stat.total, 0);
  };

  const getActiveItems = () => {
    return Object.values(itemStats).reduce((sum, stat) => sum + stat.active, 0);
  };

  return (
    <div style={{ marginTop: '130px', paddingBottom: '100px' }}>
      <div className="container">
        {/* Page Header */}
        <div className="row mb-4">
          <div className="col-lg-12">
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: '48px', fontWeight: '400', color: '#19191a' }}>
              Vendor Dashboard
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', marginTop: '10px' }}>
              <Link to="/" style={{ color: '#19191a', textDecoration: 'none' }}>Home</Link>
              <i className="fa fa-angle-right" style={{ color: '#dfa974' }}></i>
              <span style={{ color: '#dfa974' }}>Vendor Dashboard</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="text-center" style={{ padding: '60px 0' }}>
            <div className="spinner-border text-gold" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Overall Stats */}
            <div className="row mb-5">
              <div className="col-md-6 mb-4">
                <div className="admin-card">
                  <div className="admin-card-icon" style={{ background: '#dfa974' }}>
                    <i className="fas fa-boxes"></i>
                  </div>
                  <div className="admin-card-content">
                    <h3>{getTotalItems()}</h3>
                    <p>Total Items</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-4">
                <div className="admin-card">
                  <div className="admin-card-icon" style={{ background: '#28a745' }}>
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className="admin-card-content">
                    <h3>{getActiveItems()}</h3>
                    <p>Active Items</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Category-wise Stats */}
            <div className="row mb-4">
              <div className="col-lg-12">
                <h3 style={{ fontFamily: "'Lora', serif", marginBottom: '30px', fontSize: '32px' }}>
                  My Categories
                </h3>
              </div>
            </div>

            {/* Dynamic category cards */}
            <div className="row mb-5">
              {categories.map(category => (
                <div key={category.id} className="col-md-6 mb-3">
                  <Link
                    to={`/vendor/items/${category.id}`}
                    className="admin-quick-action"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span style={{ fontSize: '24px' }}>{category.icon || '📦'}</span>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{category.displayName}</div>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          {itemStats[category.id]?.total || 0} items
                          {' • '}
                          {itemStats[category.id]?.active || 0} active
                        </div>
                      </div>
                    </div>
                    <i className="fas fa-arrow-right"></i>
                  </Link>
                </div>
              ))}
            </div>

            {/* Create New Item */}
            <div className="row">
              <div className="col-lg-12">
                <h3 style={{ fontFamily: "'Lora', serif", marginBottom: '30px', fontSize: '32px' }}>
                  Create New Item
                </h3>
              </div>
              {categories.map(category => (
                <div key={category.id} className="col-md-4 mb-3">
                  <Link
                    to={`/vendor/items/create/${category.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      padding: '15px',
                      background: '#dfa974',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '5px',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#c89860'}
                    onMouseLeave={(e) => e.target.style.background = '#dfa974'}
                  >
                    <span style={{ fontSize: '20px' }}>{category.icon || '📦'}</span>
                    <span>New {category.displayName}</span>
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;
