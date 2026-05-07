import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './VendorOfflineBookingsPage.css';

/**
 * VendorOfflineBookingsPage - Manage offline payment bookings
 *
 * Shows all bookings where customers selected "Pay Offline" option.
 * Vendor can confirm or cancel these bookings.
 */
const VendorOfflineBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null); // Track which booking is being acted upon

  useEffect(() => {
    loadOfflineBookings();
  }, []);

  const loadOfflineBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) {
        setError('Please login as a vendor');
        setLoading(false);
        return;
      }

      const response = await api.get(`/booking/vendor/${user.id}/offline-pending`);
      setBookings(response.data.bookings || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load offline bookings:', err);
      setError('Failed to load bookings. Please try again.');
      setLoading(false);
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to confirm this booking?')) {
      return;
    }

    try {
      setActionInProgress(bookingId);
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      await api.post(`/booking/${bookingId}/confirm-offline?vendorId=${user.id}`);

      alert('Booking confirmed successfully!');

      // Reload bookings
      loadOfflineBookings();
    } catch (err) {
      console.error('Failed to confirm booking:', err);
      alert(err.response?.data?.message || 'Failed to confirm booking. Please try again.');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    const reason = prompt('Please enter cancellation reason:');
    if (!reason || reason.trim() === '') {
      alert('Cancellation reason is required');
      return;
    }

    try {
      setActionInProgress(bookingId);
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      await api.post(`/booking/${bookingId}/cancel-offline?vendorId=${user.id}&reason=${encodeURIComponent(reason)}`);

      alert('Booking cancelled successfully!');

      // Reload bookings
      loadOfflineBookings();
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      alert(err.response?.data?.message || 'Failed to cancel booking. Please try again.');
    } finally {
      setActionInProgress(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="vendor-offline-bookings-page">
        <div className="container">
          <div className="loading-state">
            <div className="spinner-border"></div>
            <p>Loading offline bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-offline-bookings-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>Offline Payment Bookings</h1>
            <p className="subtitle">Manage customer bookings awaiting offline payment confirmation</p>
          </div>
          <button onClick={() => navigate('/vendor/dashboard')} className="btn-back">
            ← Back to Dashboard
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        {/* Bookings List */}
        {!error && bookings.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No Pending Offline Bookings</h3>
            <p>You don't have any offline payment bookings awaiting confirmation at the moment.</p>
          </div>
        )}

        {bookings.length > 0 && (
          <div className="bookings-grid">
            {bookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                {/* Card Header */}
                <div className="card-header">
                  <div className="booking-info">
                    <h3>{booking.itemName}</h3>
                    <span className="booking-id">Booking #{booking.id.substring(0, 8)}</span>
                  </div>
                  <span className="status-badge offline">Offline Payment</span>
                </div>

                {/* Card Body */}
                <div className="card-body">
                  {/* Customer Info */}
                  <div className="info-row">
                    <span className="label">Customer:</span>
                    <span className="value">{booking.userName || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Email:</span>
                    <span className="value">{booking.userEmail || 'N/A'}</span>
                  </div>

                  {/* Event Date */}
                  <div className="info-row">
                    <span className="label">Event Date:</span>
                    <span className="value highlight">
                      {formatDate(booking.bookingFromDate)}
                    </span>
                  </div>

                  {/* Event Time */}
                  <div className="info-row">
                    <span className="label">Time:</span>
                    <span className="value">
                      {formatDateTime(booking.bookingFromDate)} - {formatDateTime(booking.bookingToDate)}
                    </span>
                  </div>

                  {/* Attendees */}
                  {booking.details?.numberOfAttendees && (
                    <div className="info-row">
                      <span className="label">Attendees:</span>
                      <span className="value">{booking.details.numberOfAttendees} people</span>
                    </div>
                  )}

                  {/* Total Amount */}
                  {booking.details?.totalBookingAmount && (
                    <div className="info-row">
                      <span className="label">Total Amount:</span>
                      <span className="value amount">₹{booking.details.totalBookingAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Booking Date */}
                  <div className="info-row">
                    <span className="label">Requested On:</span>
                    <span className="value small">{formatDateTime(booking.createdOn)}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="card-actions">
                  <button
                    onClick={() => handleConfirmBooking(booking.id)}
                    disabled={actionInProgress === booking.id}
                    className="btn-confirm"
                  >
                    {actionInProgress === booking.id ? 'Processing...' : '✓ Confirm Booking'}
                  </button>
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    disabled={actionInProgress === booking.id}
                    className="btn-cancel"
                  >
                    {actionInProgress === booking.id ? 'Processing...' : '✗ Cancel'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorOfflineBookingsPage;
