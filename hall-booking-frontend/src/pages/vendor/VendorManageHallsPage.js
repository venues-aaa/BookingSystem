import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getVendorHalls, createVendorHall, updateVendorHall, toggleVendorHallStatus } from '../../services/vendorService';
import '../admin/Admin.css';

const VendorManageHallsPage = () => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHall, setEditingHall] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: '',
    location: '',
    pricePerHour: '',
    amenities: '',
    imageUrl: '',
  });

  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    setLoading(true);
    try {
      const response = await getVendorHalls({ page: 0, size: 100 });
      setHalls(response.halls);
    } catch (error) {
      console.error('Failed to fetch halls:', error);
      alert('Failed to load halls');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const hallData = {
        ...formData,
        capacity: parseInt(formData.capacity),
        pricePerHour: formData.pricePerHour ? parseFloat(formData.pricePerHour) : null,
      };

      if (editingHall) {
        await updateVendorHall(editingHall.id, hallData);
        alert('Hall updated successfully');
      } else {
        await createVendorHall(hallData);
        alert('Hall created successfully');
      }

      setShowForm(false);
      setEditingHall(null);
      resetForm();
      fetchHalls();
    } catch (error) {
      console.error('Failed to save hall:', error);
      alert(error.response?.data?.error || error.response?.data?.message || 'Failed to save hall');
    }
  };

  const handleEdit = (hall) => {
    setEditingHall(hall);
    setFormData({
      name: hall.name,
      description: hall.description || '',
      capacity: hall.capacity,
      location: hall.location || '',
      pricePerHour: hall.pricePerHour || '',
      amenities: hall.amenities || '',
      imageUrl: hall.imageUrl || '',
    });
    setShowForm(true);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this hall?`)) return;

    try {
      const response = await toggleVendorHallStatus(id);
      alert(response.message || `Hall ${action}d successfully`);
      fetchHalls();
    } catch (error) {
      console.error('Failed to toggle hall status:', error);
      alert(error.response?.data?.error || `Failed to ${action} hall`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      capacity: '',
      location: '',
      pricePerHour: '',
      amenities: '',
      imageUrl: '',
    });
  };

  const handleAddNew = () => {
    setEditingHall(null);
    resetForm();
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingHall(null);
    resetForm();
  };

  return (
    <div style={{ marginTop: '130px', paddingBottom: '100px' }}>
      <div className="container">
        {/* Page Header */}
        <div className="row mb-4">
          <div className="col-lg-12">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontFamily: "'Lora', serif", fontSize: '48px', fontWeight: '400', color: '#19191a' }}>
                  My Halls
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', marginTop: '10px' }}>
                  <Link to="/" style={{ color: '#19191a', textDecoration: 'none' }}>Home</Link>
                  <i className="fa fa-angle-right" style={{ color: '#dfa974' }}></i>
                  <Link to="/vendor" style={{ color: '#19191a', textDecoration: 'none' }}>Vendor</Link>
                  <i className="fa fa-angle-right" style={{ color: '#dfa974' }}></i>
                  <span style={{ color: '#dfa974' }}>My Halls</span>
                </div>
              </div>
              {!showForm && (
                <button onClick={handleAddNew} className="primary-btn">
                  <i className="fas fa-plus mr-2"></i> Add New Hall
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="admin-form-card mb-5">
            <h3>{editingHall ? 'Edit Hall' : 'Add New Hall'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label>Hall Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label>Capacity *</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    required
                    min="1"
                    className="form-control"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label>Price Per Hour (₹)</label>
                  <input
                    type="number"
                    name="pricePerHour"
                    value={formData.pricePerHour}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="form-control"
                  />
                </div>
                <div className="col-md-12 mb-3">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="form-control"
                  />
                </div>
                <div className="col-md-12 mb-3">
                  <label>Amenities (comma separated)</label>
                  <input
                    type="text"
                    name="amenities"
                    value={formData.amenities}
                    onChange={handleChange}
                    placeholder="WiFi, Projector, Air Conditioning"
                    className="form-control"
                  />
                </div>
                <div className="col-md-12 mb-3">
                  <label>Image URL</label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="primary-btn">
                  <i className="fas fa-save mr-2"></i>
                  {editingHall ? 'Update Hall' : 'Create Hall'}
                </button>
                <button type="button" onClick={handleCancel} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Halls Table */}
        {loading ? (
          <div className="text-center" style={{ padding: '60px 0' }}>
            <div className="spinner-border text-gold" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="admin-table-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Capacity</th>
                  <th>Location</th>
                  <th>Price/Hour</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {halls.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                      No halls found. Click "Add New Hall" to create one.
                    </td>
                  </tr>
                ) : (
                  halls.map((hall) => (
                    <tr key={hall.id}>
                      <td>{hall.id}</td>
                      <td>{hall.name}</td>
                      <td>{hall.capacity}</td>
                      <td>{hall.location || '-'}</td>
                      <td>₹{hall.pricePerHour?.toLocaleString('en-IN') || '-'}</td>
                      <td>
                        <span className={`badge ${hall.isActive ? 'badge-success' : 'badge-secondary'}`}>
                          {hall.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleEdit(hall)}
                          className="btn-icon btn-edit"
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(hall.id, hall.isActive)}
                          className={`btn-icon ${hall.isActive ? 'btn-delete' : 'btn-success'}`}
                          title={hall.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <i className={`fas ${hall.isActive ? 'fa-toggle-off' : 'fa-toggle-on'}`}></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorManageHallsPage;
