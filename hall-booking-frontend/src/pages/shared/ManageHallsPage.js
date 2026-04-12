import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createHall, updateHall } from '../../services/hallService';
import { toggleHallStatus, getAdminHalls, getAllUsers } from '../../services/adminService';
import { getVendorHalls, toggleVendorHallStatus } from '../../services/vendorService';

const ManageHallsPage = () => {
  const { user, isAdmin, isVendor } = useAuth();
  const [halls, setHalls] = useState([]);
  const [users, setUsers] = useState([]);
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
    availableSlotTypes: {
      fullday: true,
      morning: true,
      evening: true,
    },
  });

  // Admin-only filters and sorting
  const [filters, setFilters] = useState({
    name: '',
    capacity: '',
    location: '',
    createdById: '',
    isActive: '',
  });

  const [sorting, setSorting] = useState({
    sortBy: 'id',
    sortDirection: 'asc',
  });

  useEffect(() => {
    fetchHalls();
    if (isAdmin()) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sorting]);

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers({ page: 0, size: 1000 });
      // Backend returns array directly, not wrapped in an object
      const userList = Array.isArray(response) ? response : response.users || [];
      setUsers(userList);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchHalls = async () => {
    setLoading(true);
    try {
      if (isAdmin()) {
        // Admin: fetch all halls with filters
        const params = {
          page: 0,
          size: 1000,
          ...filters,
          ...sorting,
        };

        // Remove empty filters
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === null) {
            delete params[key];
          }
        });

        const response = await getAdminHalls(params);
        setHalls(response.halls);
      } else {
        // Vendor: fetch only their halls
        const response = await getVendorHalls({ page: 0, size: 100 });
        setHalls(response.halls);
      }
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
      if (editingHall) {
        // Update existing hall
        if (isVendor()) {
          // Vendor: merge with existing data
          const amenitiesObj = formData.amenities && formData.amenities.trim()
            ? formData.amenities.split(',').reduce((acc, amenity, index) => {
                if (index < 6) acc[`amenity${index + 1}`] = amenity.trim();
                return acc;
              }, {})
            : null;

          const updatedHall = {
            ...editingHall,
            details: {
              ...editingHall.details,
              name: formData.name,
              description: formData.description || null,
              qtyAvailable: formData.capacity ? parseInt(formData.capacity) : 0,
              address: formData.location || null,
              mainImageUrl: formData.imageUrl || null,
              amenities: amenitiesObj,
              availableSlotTypes: formData.availableSlotTypes,
            },
            price: {
              ...editingHall.price,
              baseRate: formData.pricePerHour ? parseFloat(formData.pricePerHour) : 0,
            },
          };
          await updateHall(editingHall.id, updatedHall);
        } else {
          // Admin: simpler update
          const hallData = {
            ...formData,
            capacity: parseInt(formData.capacity),
            pricePerHour: formData.pricePerHour ? parseFloat(formData.pricePerHour) : null,
          };
          await updateHall(editingHall.id, hallData);
        }
        alert('Hall updated successfully');
      } else {
        // Create new hall - both admin and vendor use the same service
        const hallData = {
          ...formData,
          capacity: parseInt(formData.capacity),
          pricePerHour: formData.pricePerHour ? parseFloat(formData.pricePerHour) : null,
        };
        await createHall(hallData);
        alert('Hall created successfully');
      }

      setShowForm(false);
      setEditingHall(null);
      resetForm();
      fetchHalls();
    } catch (error) {
      console.error('Failed to save hall:', error);
      alert(error.response?.data?.message || 'Failed to save hall');
    }
  };

  const handleEdit = (hall) => {
    setEditingHall(hall);

    // Convert amenities to string if needed
    let amenitiesStr = '';
    if (isVendor() && hall.details?.amenities) {
      const amenitiesList = [
        hall.details.amenities.amenity1,
        hall.details.amenities.amenity2,
        hall.details.amenities.amenity3,
        hall.details.amenities.amenity4,
        hall.details.amenities.amenity5,
        hall.details.amenities.amenity6,
      ].filter(a => a && a.trim());
      amenitiesStr = amenitiesList.join(', ');
    } else {
      amenitiesStr = hall.amenities || '';
    }

    setFormData({
      name: isVendor() ? hall.details?.name || '' : hall.name || '',
      description: isVendor() ? hall.details?.description || '' : hall.description || '',
      capacity: isVendor() ? hall.details?.qtyAvailable || '' : hall.capacity || '',
      location: isVendor() ? hall.details?.address || '' : hall.location || '',
      pricePerHour: isVendor() ? hall.price?.baseRate || '' : hall.pricePerHour || '',
      amenities: amenitiesStr,
      imageUrl: isVendor() ? hall.details?.mainImageUrl || '' : hall.imageUrl || '',
      availableSlotTypes: (isVendor() ? hall.details?.availableSlotTypes : hall.availableSlotTypes) || {
        fullday: true,
        morning: true,
        evening: true,
      },
    });
    setShowForm(true);
  };

  const handleToggleStatus = async (hall) => {
    const currentStatus = isVendor() ? hall.status : hall.isActive;
    const action = (isVendor() ? currentStatus === 'Active' : currentStatus) ? 'deactivate' : 'activate';

    if (!window.confirm(`Are you sure you want to ${action} this hall?`)) return;

    try {
      if (isVendor()) {
        await toggleVendorHallStatus(hall.id, hall.status, hall);
      } else {
        await toggleHallStatus(hall.id);
      }
      alert(`Hall ${action}d successfully`);
      fetchHalls();
    } catch (error) {
      console.error('Failed to toggle hall status:', error);
      alert(`Failed to ${action} hall`);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleSort = (field) => {
    setSorting({
      sortBy: field,
      sortDirection: sorting.sortBy === field && sorting.sortDirection === 'asc' ? 'desc' : 'asc',
    });
  };

  const resetFilters = () => {
    setFilters({
      name: '',
      capacity: '',
      location: '',
      createdById: '',
      isActive: '',
    });
  };

  const getUserName = (userId) => {
    const foundUser = users.find(u => u.id === userId || u._id === userId);
    if (!foundUser) return 'Unknown';

    const firstName = foundUser.details?.firstName || '';
    const lastName = foundUser.details?.lastName || '';
    const role = foundUser.details?.role || '';
    const name = `${firstName} ${lastName}`.trim() || foundUser.emailId || 'Unknown';

    return role ? `${name} (${role})` : name;
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
      availableSlotTypes: {
        fullday: true,
        morning: true,
        evening: true,
      },
    });
  };

  const pageTitle = isAdmin() ? 'Manage Halls' : 'My Halls';
  const breadcrumbRole = isAdmin() ? 'Admin' : 'Vendor';
  const breadcrumbPath = isAdmin() ? '/admin' : '/vendor';

  return (
    <>
      {/* Page Header */}
      <div style={{
        background: '#ffffff',
        padding: '60px 0 10px',
        marginTop: '130px',
        textAlign: 'center'
      }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: '48px', fontWeight: '400', color: '#19191a', marginBottom: '20px' }}>
                {pageTitle}
              </h2>
              {/* Breadcrumb */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '15px', fontFamily: "'Cabin', sans-serif" }}>
                <Link to="/" style={{ color: '#19191a', fontSize: '16px', fontWeight: '500', textDecoration: 'none' }}>Home</Link>
                <i className="fa fa-angle-right" style={{ color: '#dfa974' }}></i>
                <Link to={breadcrumbPath} style={{ color: '#707079', textDecoration: 'none' }}>{breadcrumbRole}</Link>
                <i className="fa fa-angle-right" style={{ color: '#dfa974' }}></i>
                <span style={{ color: '#dfa974' }}>{pageTitle}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manage Halls Section */}
      <section style={{ paddingTop: '12px', paddingBottom: '100px' }}>
        <div className="container">
          {/* Header */}
          <div className="row">
            <div className="col-lg-12">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
                <div className="section-title" style={{ textAlign: 'left', marginBottom: 0 }}>
                  <span>{isAdmin() ? 'Administration' : 'Vendor Dashboard'}</span>
                  <h2 style={{ marginBottom: 0 }}>{pageTitle}</h2>
                </div>
                <button
                  onClick={() => {
                    setShowForm(!showForm);
                    setEditingHall(null);
                    resetForm();
                  }}
                  className={showForm ? 'secondary-btn' : 'primary-btn'}
                >
                  {showForm ? (
                    <>
                      <i className="fa fa-times" style={{ marginRight: '8px' }}></i>
                      Cancel
                    </>
                  ) : (
                    <>
                      <i className="fa fa-plus" style={{ marginRight: '8px' }}></i>
                      Add New Hall
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Form */}
          {showForm && (
            <div className="row">
              <div className="col-lg-12">
                <div className="booking-form" style={{ marginBottom: '50px' }}>
                  <h3>{editingHall ? 'Edit Hall Details' : 'Create New Hall'}</h3>
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label>Hall Name <span style={{ color: '#dfa974' }}>*</span></label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter hall name"
                      />
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        name="description"
                        className="form-control"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Describe the hall and its features"
                      />
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Capacity <span style={{ color: '#dfa974' }}>*</span></label>
                          <input
                            type="number"
                            name="capacity"
                            className="form-control"
                            value={formData.capacity}
                            onChange={handleChange}
                            required
                            min="1"
                            placeholder="Maximum number of guests"
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Price per Hour</label>
                          <input
                            type="number"
                            name="pricePerHour"
                            className="form-control"
                            value={formData.pricePerHour}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            placeholder="Hourly rate (₹)"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Location</label>
                      <input
                        type="text"
                        name="location"
                        className="form-control"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Hall location or address"
                      />
                    </div>

                    <div className="form-group">
                      <label>Amenities (comma-separated)</label>
                      <input
                        type="text"
                        name="amenities"
                        className="form-control"
                        value={formData.amenities}
                        onChange={handleChange}
                        placeholder="WiFi, Projector, Sound System, Air Conditioning"
                      />
                    </div>

                    <div className="form-group">
                      <label>Available Slot Types <span style={{ color: '#dfa974' }}>*</span></label>
                      <div style={{ display: 'flex', gap: '30px', marginTop: '10px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', fontWeight: 'normal', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={formData.availableSlotTypes.fullday}
                            onChange={(e) => setFormData({
                              ...formData,
                              availableSlotTypes: {
                                ...formData.availableSlotTypes,
                                fullday: e.target.checked
                              }
                            })}
                            style={{ marginRight: '8px', width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                          <span>Full Day (12 AM - 12 AM)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', fontWeight: 'normal', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={formData.availableSlotTypes.morning}
                            onChange={(e) => setFormData({
                              ...formData,
                              availableSlotTypes: {
                                ...formData.availableSlotTypes,
                                morning: e.target.checked
                              }
                            })}
                            style={{ marginRight: '8px', width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                          <span>Morning (6 AM - 3 PM)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', fontWeight: 'normal', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={formData.availableSlotTypes.evening}
                            onChange={(e) => setFormData({
                              ...formData,
                              availableSlotTypes: {
                                ...formData.availableSlotTypes,
                                evening: e.target.checked
                              }
                            })}
                            style={{ marginRight: '8px', width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                          <span>Evening (4 PM - 10 PM)</span>
                        </label>
                      </div>
                      <small style={{ display: 'block', marginTop: '8px', color: '#707079' }}>
                        Select which time slots this hall offers for booking
                      </small>
                    </div>

                    <div className="form-group">
                      <label>Image URL</label>
                      <input
                        type="url"
                        name="imageUrl"
                        className="form-control"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <button type="submit" className="primary-btn">
                      {editingHall ? (
                        <>
                          <i className="fa fa-save" style={{ marginRight: '8px' }}></i>
                          Update Hall
                        </>
                      ) : (
                        <>
                          <i className="fa fa-plus-circle" style={{ marginRight: '8px' }}></i>
                          Create Hall
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Admin Filter Controls */}
          {isAdmin() && !showForm && (
            <div className="row mb-4">
              <div className="col-lg-12">
                <div style={{
                  background: '#ffffff',
                  padding: '25px',
                  boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
                  marginBottom: '20px'
                }}>
                  <h4 style={{ marginBottom: '20px', color: '#19191a' }}>
                    <i className="fa fa-filter" style={{ marginRight: '10px', color: '#dfa974' }}></i>
                    Filter & Sort Halls
                  </h4>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#19191a', marginBottom: '8px' }}>Hall Name</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={filters.name}
                        onChange={handleFilterChange}
                        placeholder="Search by name..."
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#19191a', marginBottom: '8px' }}>Min Capacity</label>
                      <input
                        type="number"
                        name="capacity"
                        className="form-control"
                        value={filters.capacity}
                        onChange={handleFilterChange}
                        placeholder="Minimum capacity..."
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#19191a', marginBottom: '8px' }}>Location</label>
                      <input
                        type="text"
                        name="location"
                        className="form-control"
                        value={filters.location}
                        onChange={handleFilterChange}
                        placeholder="Search by location..."
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#19191a', marginBottom: '8px' }}>Created By</label>
                      <select
                        name="createdById"
                        className="form-control"
                        value={filters.createdById}
                        onChange={handleFilterChange}
                      >
                        <option value="">All Users</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>
                            {u.username} ({u.role})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#19191a', marginBottom: '8px' }}>Status</label>
                      <select
                        name="isActive"
                        className="form-control"
                        value={filters.isActive}
                        onChange={handleFilterChange}
                      >
                        <option value="">All</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                    <div className="col-md-4 mb-3" style={{ display: 'flex', alignItems: 'flex-end' }}>
                      <button
                        onClick={resetFilters}
                        style={{
                          background: '#dc3545',
                          color: '#ffffff',
                          border: 'none',
                          padding: '10px 20px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          width: '100%'
                        }}
                      >
                        <i className="fa fa-times" style={{ marginRight: '8px' }}></i>
                        Reset Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Halls List */}
          <div className="row">
            <div className="col-lg-12">
              {loading ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '400px',
                  flexDirection: 'column',
                  gap: '20px'
                }}>
                  <div className="loading"></div>
                  <p style={{ fontSize: '18px', color: '#707079' }}>Loading halls...</p>
                </div>
              ) : (
                <div style={{
                  background: '#ffffff',
                  boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
                  overflow: 'hidden'
                }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f9f9f9', borderBottom: '2px solid #dfa974' }}>
                          {isAdmin() && (
                            <th
                              onClick={() => handleSort('id')}
                              style={{
                                padding: '20px',
                                textAlign: 'left',
                                fontWeight: '600',
                                color: '#19191a',
                                fontSize: '14px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                cursor: 'pointer',
                                userSelect: 'none'
                              }}
                            >
                              ID {sorting.sortBy === 'id' && (
                                <i className={`fa fa-sort-${sorting.sortDirection === 'asc' ? 'up' : 'down'}`} style={{ marginLeft: '5px', color: '#dfa974' }}></i>
                              )}
                            </th>
                          )}
                          {!isAdmin() && (
                            <th style={{ padding: '20px', textAlign: 'left', fontWeight: '600', color: '#19191a', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              ID
                            </th>
                          )}
                          <th
                            onClick={isAdmin() ? () => handleSort('name') : undefined}
                            style={{
                              padding: '20px',
                              textAlign: 'left',
                              fontWeight: '600',
                              color: '#19191a',
                              fontSize: '14px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              cursor: isAdmin() ? 'pointer' : 'default',
                              userSelect: 'none'
                            }}
                          >
                            Hall Name {isAdmin() && sorting.sortBy === 'name' && (
                              <i className={`fa fa-sort-${sorting.sortDirection === 'asc' ? 'up' : 'down'}`} style={{ marginLeft: '5px', color: '#dfa974' }}></i>
                            )}
                          </th>
                          <th
                            onClick={isAdmin() ? () => handleSort('capacity') : undefined}
                            style={{
                              padding: '20px',
                              textAlign: 'left',
                              fontWeight: '600',
                              color: '#19191a',
                              fontSize: '14px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              cursor: isAdmin() ? 'pointer' : 'default',
                              userSelect: 'none'
                            }}
                          >
                            Capacity {isAdmin() && sorting.sortBy === 'capacity' && (
                              <i className={`fa fa-sort-${sorting.sortDirection === 'asc' ? 'up' : 'down'}`} style={{ marginLeft: '5px', color: '#dfa974' }}></i>
                            )}
                          </th>
                          <th
                            onClick={isAdmin() ? () => handleSort('location') : undefined}
                            style={{
                              padding: '20px',
                              textAlign: 'left',
                              fontWeight: '600',
                              color: '#19191a',
                              fontSize: '14px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              cursor: isAdmin() ? 'pointer' : 'default',
                              userSelect: 'none'
                            }}
                          >
                            Location {isAdmin() && sorting.sortBy === 'location' && (
                              <i className={`fa fa-sort-${sorting.sortDirection === 'asc' ? 'up' : 'down'}`} style={{ marginLeft: '5px', color: '#dfa974' }}></i>
                            )}
                          </th>
                          <th
                            onClick={isAdmin() ? () => handleSort('pricePerHour') : undefined}
                            style={{
                              padding: '20px',
                              textAlign: 'left',
                              fontWeight: '600',
                              color: '#19191a',
                              fontSize: '14px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              cursor: isAdmin() ? 'pointer' : 'default',
                              userSelect: 'none'
                            }}
                          >
                            Price/Hour {isAdmin() && sorting.sortBy === 'pricePerHour' && (
                              <i className={`fa fa-sort-${sorting.sortDirection === 'asc' ? 'up' : 'down'}`} style={{ marginLeft: '5px', color: '#dfa974' }}></i>
                            )}
                          </th>
                          {isAdmin() && (
                            <th style={{ padding: '20px', textAlign: 'left', fontWeight: '600', color: '#19191a', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Created By</th>
                          )}
                          <th
                            onClick={isAdmin() ? () => handleSort('isActive') : undefined}
                            style={{
                              padding: '20px',
                              textAlign: 'left',
                              fontWeight: '600',
                              color: '#19191a',
                              fontSize: '14px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              cursor: isAdmin() ? 'pointer' : 'default',
                              userSelect: 'none'
                            }}
                          >
                            Status {isAdmin() && sorting.sortBy === 'isActive' && (
                              <i className={`fa fa-sort-${sorting.sortDirection === 'asc' ? 'up' : 'down'}`} style={{ marginLeft: '5px', color: '#dfa974' }}></i>
                            )}
                          </th>
                          <th style={{ padding: '20px', textAlign: 'center', fontWeight: '600', color: '#19191a', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {halls.length === 0 ? (
                          <tr>
                            <td colSpan={isAdmin() ? "8" : "7"} style={{ textAlign: 'center', padding: '40px' }}>
                              No halls found. Click "Add New Hall" to create one.
                            </td>
                          </tr>
                        ) : (
                          halls.map((hall, index) => (
                            <tr key={hall.id} style={{
                              borderBottom: '1px solid #f0f0f0',
                              transition: 'all 0.3s',
                              background: index % 2 === 0 ? '#ffffff' : '#fafafa'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#f9f9f9';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = index % 2 === 0 ? '#ffffff' : '#fafafa';
                            }}
                            >
                              <td style={{ padding: '20px', fontSize: '14px', color: '#707079' }}>
                                {isAdmin() ? `#${hall.id}` : hall.id}
                              </td>
                              <td style={{ padding: '20px', fontSize: '14px', color: '#19191a', fontWeight: '600' }}>
                                {isVendor() ? hall.details?.name : hall.name}
                              </td>
                              <td style={{ padding: '20px', fontSize: '14px', color: '#707079' }}>
                                <i className="fa fa-users" style={{ color: '#dfa974', marginRight: '5px' }}></i>
                                {isVendor() ? hall.details?.qtyAvailable : hall.capacity}
                              </td>
                              <td style={{ padding: '20px', fontSize: '14px', color: '#707079' }}>
                                {isVendor() ? (hall.details?.address || 'N/A') : (hall.location || 'N/A')}
                              </td>
                              <td style={{ padding: '20px', fontSize: '14px', color: '#dfa974', fontWeight: '600' }}>
                                {(() => {
                                  const price = isVendor() ? hall.price?.baseRate : hall.pricePerHour;
                                  return price ? `₹${parseFloat(price).toLocaleString('en-IN')}` : 'N/A';
                                })()}
                              </td>
                              {isAdmin() && (
                                <td style={{ padding: '20px', fontSize: '14px', color: '#707079' }}>
                                  {hall.createdById ? getUserName(hall.createdById) : 'N/A'}
                                </td>
                              )}
                              <td style={{ padding: '20px' }}>
                                {(() => {
                                  const active = isVendor() ? hall.status === 'Active' : hall.isActive;
                                  return (
                                    <span style={{
                                      display: 'inline-block',
                                      padding: '5px 15px',
                                      borderRadius: '20px',
                                      fontSize: '12px',
                                      fontWeight: '600',
                                      background: active ? '#d4edda' : '#f8d7da',
                                      color: active ? '#155724' : '#721c24',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.5px'
                                    }}>
                                      {active ? 'Active' : 'Inactive'}
                                    </span>
                                  );
                                })()}
                              </td>
                              <td style={{ padding: '20px', textAlign: 'center' }}>
                                <button
                                  onClick={() => handleEdit(hall)}
                                  style={{
                                    background: 'transparent',
                                    border: '1px solid #dfa974',
                                    color: '#dfa974',
                                    padding: '6px 15px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    cursor: 'pointer',
                                    marginRight: '8px',
                                    transition: 'all 0.3s'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.background = '#dfa974';
                                    e.target.style.color = '#ffffff';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.background = 'transparent';
                                    e.target.style.color = '#dfa974';
                                  }}
                                >
                                  <i className="fa fa-edit" style={{ marginRight: '5px' }}></i>
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(hall)}
                                  style={{
                                    background: 'transparent',
                                    border: (() => {
                                      const active = isVendor() ? hall.status === 'Active' : hall.isActive;
                                      return active ? '1px solid #dc3545' : '1px solid #28a745';
                                    })(),
                                    color: (() => {
                                      const active = isVendor() ? hall.status === 'Active' : hall.isActive;
                                      return active ? '#dc3545' : '#28a745';
                                    })(),
                                    padding: '6px 15px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                  }}
                                  onMouseEnter={(e) => {
                                    const active = isVendor() ? hall.status === 'Active' : hall.isActive;
                                    e.target.style.background = active ? '#dc3545' : '#28a745';
                                    e.target.style.color = '#ffffff';
                                  }}
                                  onMouseLeave={(e) => {
                                    const active = isVendor() ? hall.status === 'Active' : hall.isActive;
                                    e.target.style.background = 'transparent';
                                    e.target.style.color = active ? '#dc3545' : '#28a745';
                                  }}
                                >
                                  {(() => {
                                    const active = isVendor() ? hall.status === 'Active' : hall.isActive;
                                    return (
                                      <>
                                        <i className={`fa ${active ? 'fa-toggle-off' : 'fa-toggle-on'}`} style={{ marginRight: '5px' }}></i>
                                        {active ? 'Deactivate' : 'Activate'}
                                      </>
                                    );
                                  })()}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ManageHallsPage;
