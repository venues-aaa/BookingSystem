import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import blockedDateService from '../../services/blockedDateService';
import vendorService from '../../services/vendorService';
import './VendorBlockedDates.css';

const VendorBlockedDates = () => {
    const { user } = useAuth();
    const [blockedDates, setBlockedDates] = useState([]);
    const [vendorItems, setVendorItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        itemId: '',
        startDate: '',
        endDate: '',
        reason: '',
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, [user.id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');

            // Fetch vendor's items
            const items = await vendorService.getVendorItems(user.id);
            console.log('Fetched vendor items:', items); // Debug log
            if (items && items.length > 0) {
                console.log('First item structure:', items[0]); // Debug first item
                console.log('First item dynamicData:', items[0].dynamicData); // Debug dynamicData
            }
            setVendorItems(items);

            // Fetch blocked dates
            const blocked = await blockedDateService.getVendorBlockedDates(user.id);
            setBlockedDates(blocked);
        } catch (err) {
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (!formData.itemId || !formData.startDate || !formData.endDate) {
            setError('Please fill in all required fields');
            return;
        }

        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            setError('Start date must be before end date');
            return;
        }

        try {
            const requestData = {
                itemId: formData.itemId,
                startDate: formData.startDate,
                endDate: formData.endDate,
                reason: formData.reason || 'Not specified',
                notes: formData.notes || ''
            };

            await blockedDateService.createBlockedDate(requestData, user.id);
            setSuccess('Blocked date created successfully');
            setShowForm(false);
            setFormData({
                itemId: '',
                startDate: '',
                endDate: '',
                reason: '',
                notes: ''
            });
            fetchData(); // Refresh the list
        } catch (err) {
            setError(err.message || 'Failed to create blocked date');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this blocked date?')) {
            return;
        }

        try {
            setError('');
            setSuccess('');
            await blockedDateService.deleteBlockedDate(id, user.id);
            setSuccess('Blocked date removed successfully');
            fetchData(); // Refresh the list
        } catch (err) {
            setError(err.message || 'Failed to delete blocked date');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getItemName = (itemId) => {
        const item = vendorItems.find(i => (i.id || i._id) === itemId);
        if (!item) return 'Unknown Item';

        // Schema-driven display: cascading field lookup (works for all categories)
        // Check multiple possible field names in order of preference
        // Note: Legacy items use details.name, new items use dynamicData fields
        return item.details?.name ||                // Legacy items (Hall)
               item.dynamicData?.property_name ||   // Home Rentals
               item.dynamicData?.restaurant_name || // Catering
               item.dynamicData?.service_name ||    // Other services
               item.dynamicData?.name ||            // Generic name field
               item.name ||                         // Top-level name (rare)
               `Item ${item.id || item._id}`;       // Fallback to ID
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="vendor-blocked-dates">
            <div className="page-header">
                <h1>Blocked Dates Management</h1>
                <p>Block specific dates when your items are not available for booking</p>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="actions-bar">
                <button
                    className="btn btn-primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancel' : '+ Block New Dates'}
                </button>
            </div>

            {showForm && (
                <div className="blocked-date-form-container">
                    <h2>Block Dates for Maintenance or Unavailability</h2>
                    <form onSubmit={handleSubmit} className="blocked-date-form">
                        <div className="form-group">
                            <label htmlFor="itemId">Item *</label>
                            <select
                                id="itemId"
                                name="itemId"
                                value={formData.itemId}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">-- Select Item --</option>
                                {vendorItems.map(item => {
                                    // Get item ID (handle both 'id' and '_id')
                                    const itemId = item.id || item._id;

                                    // Get item name using cascading lookup
                                    // Legacy items (Hall) use details.name
                                    // New dynamic items use dynamicData fields
                                    const itemName = item.details?.name ||
                                                   item.dynamicData?.property_name ||
                                                   item.dynamicData?.restaurant_name ||
                                                   item.dynamicData?.service_name ||
                                                   item.dynamicData?.name ||
                                                   item.name ||
                                                   itemId;

                                    return (
                                        <option key={itemId} value={itemId}>
                                            {itemName}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="startDate">Start Date & Time *</label>
                                <input
                                    type="datetime-local"
                                    id="startDate"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="endDate">End Date & Time *</label>
                                <input
                                    type="datetime-local"
                                    id="endDate"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="reason">Reason</label>
                            <input
                                type="text"
                                id="reason"
                                name="reason"
                                value={formData.reason}
                                onChange={handleInputChange}
                                placeholder="e.g., Maintenance, Holiday, Renovation"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="notes">Notes (Optional)</label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                placeholder="Additional details about this blocked period..."
                                rows="3"
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">
                                Block Dates
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="blocked-dates-list">
                <h2>Your Blocked Dates ({blockedDates.length})</h2>

                {blockedDates.length === 0 ? (
                    <div className="empty-state">
                        <p>No blocked dates yet. Block dates when your items are unavailable for booking.</p>
                    </div>
                ) : (
                    <div className="blocked-dates-grid">
                        {blockedDates.map(blocked => (
                            <div key={blocked.id} className="blocked-date-card">
                                <div className="blocked-date-header">
                                    <h3>{getItemName(blocked.itemId)}</h3>
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDelete(blocked.id)}
                                        title="Remove block"
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="blocked-date-info">
                                    <div className="info-row">
                                        <span className="label">From:</span>
                                        <span className="value">{formatDate(blocked.startDate)}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">To:</span>
                                        <span className="value">{formatDate(blocked.endDate)}</span>
                                    </div>
                                    {blocked.reason && (
                                        <div className="info-row">
                                            <span className="label">Reason:</span>
                                            <span className="value">{blocked.reason}</span>
                                        </div>
                                    )}
                                    {blocked.notes && (
                                        <div className="info-row notes">
                                            <span className="label">Notes:</span>
                                            <span className="value">{blocked.notes}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="blocked-date-footer">
                                    <small>Created: {new Date(blocked.createdOn).toLocaleDateString()}</small>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorBlockedDates;
