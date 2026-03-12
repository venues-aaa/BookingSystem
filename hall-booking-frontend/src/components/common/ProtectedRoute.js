import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false, vendorOnly = false }) => {
  const { isAuthenticated, isAdmin, isVendor, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin()) {
    return (
      <div className="container" style={{ padding: '40px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h2>Access Denied</h2>
          <p>You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (vendorOnly && !isVendor()) {
    return (
      <div className="container" style={{ padding: '40px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h2>Access Denied</h2>
          <p>You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
