import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getVendorHalls } from '../../services/vendorService';
import '../admin/Admin.css';

const VendorDashboard = () => {
  const [stats, setStats] = useState({
    totalHalls: 0,
    activeHalls: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const hallsData = await getVendorHalls({ page: 0, size: 1000 });
      const halls = hallsData.halls || [];

      setStats({
        totalHalls: halls.length,
        activeHalls: halls.filter(h => h.isActive).length,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
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
            <div className="row mb-5">
              <div className="col-md-6 mb-4">
                <div className="admin-card">
                  <div className="admin-card-icon" style={{ background: '#dfa974' }}>
                    <i className="fas fa-door-open"></i>
                  </div>
                  <div className="admin-card-content">
                    <h3>{stats.totalHalls}</h3>
                    <p>Total Halls</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-4">
                <div className="admin-card">
                  <div className="admin-card-icon" style={{ background: '#28a745' }}>
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className="admin-card-content">
                    <h3>{stats.activeHalls}</h3>
                    <p>Active Halls</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="row">
              <div className="col-lg-12">
                <h3 style={{ fontFamily: "'Lora', serif", marginBottom: '30px', fontSize: '32px' }}>Quick Actions</h3>
              </div>
              <div className="col-md-6 mb-3">
                <Link to="/vendor/halls" className="admin-quick-action">
                  <i className="fas fa-door-open"></i>
                  <span>Manage My Halls</span>
                  <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;
