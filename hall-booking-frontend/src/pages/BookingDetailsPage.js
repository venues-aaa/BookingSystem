import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookingById } from '../services/bookingService';
import { getItemById } from '../services/itemService';
import { getCouponsByBooking } from '../services/couponService';
import './BookingSuccessPage.css';

/**
 * Booking Details Page
 * Shows complete booking information including generated coupons
 * Can be accessed from "My Bookings" list
 */
const BookingDetailsPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [item, setItem] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch booking details
      console.log('Fetching booking details for:', bookingId);
      const bookingData = await getBookingById(bookingId);
      console.log('Booking data:', bookingData);
      setBooking(bookingData);

      // Fetch item details
      const itemData = await getItemById(bookingData.itemId);
      console.log('Item data:', itemData);
      setItem(itemData);

      // Fetch coupons generated from this booking
      try {
        const couponsResponse = await getCouponsByBooking(bookingId);
        if (couponsResponse.success && couponsResponse.data && couponsResponse.data.length > 0) {
          setCoupons(couponsResponse.data);
        }
      } catch (err) {
        console.warn('Failed to fetch coupons:', err);
      }

      setLoading(false);
    } catch (err) {
      console.error('Failed to load booking details:', err);
      setError('Failed to load booking details. Please try again.');
      setLoading(false);
    }
  };

  const copyCouponCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      alert(`Coupon code "${code}" copied to clipboard!`);
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('Failed to copy coupon code. Please copy it manually.');
    });
  };

  const getTimeRemaining = (expiryTime) => {
    const now = new Date();
    const expiry = new Date(expiryTime);
    const diff = expiry - now;

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    }

    return `${hours}h ${minutes}m remaining`;
  };

  const getItemName = (itemData) => {
    return itemData?.dynamicData?.field_hall_name ||
           itemData?.dynamicData?.restaurant_name ||
           itemData?.dynamicData?.name ||
           itemData?.type;
  };

  const getBookingAmount = () => {
    if (booking?.details?.pricing?.total !== undefined && booking.details.pricing.total !== null) {
      return booking.details.pricing.total;
    }
    if (booking?.details?.additionalDetails?.pricing?.total !== undefined) {
      return booking.details.additionalDetails.pricing.total;
    }
    if (item?.dynamicData) {
      for (const [key, value] of Object.entries(item.dynamicData)) {
        if (typeof value === 'string' || typeof value === 'number') {
          const price = parseFloat(value);
          if (!isNaN(price) && price > 0 && price < 1000000) {
            return price;
          }
        }
      }
    }
    if (item?.price) return parseFloat(item.price);
    return 0;
  };

  const getBookingDates = () => {
    if (booking?.bookingFromDate && booking?.bookingToDate) {
      return {
        from: new Date(booking.bookingFromDate).toLocaleString(),
        to: new Date(booking.bookingToDate).toLocaleString()
      };
    }
    if (booking?.details) {
      const details = booking.details.additionalDetails || booking.details;
      if (details.event_date) {
        return {
          from: new Date(details.event_date).toLocaleDateString(),
          to: new Date(details.event_date).toLocaleDateString()
        };
      }
      if (details.start_date && details.end_date) {
        return {
          from: new Date(details.start_date).toLocaleDateString(),
          to: new Date(details.end_date).toLocaleDateString()
        };
      }
      if (details.checkin_date && details.checkout_date) {
        return {
          from: new Date(details.checkin_date).toLocaleDateString(),
          to: new Date(details.checkout_date).toLocaleDateString()
        };
      }
    }
    return { from: 'N/A', to: 'N/A' };
  };

  if (loading) {
    return (
      <div className="booking-success-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="booking-success-container">
        <div className="error-message">
          <h2>❌ Error</h2>
          <p>{error || 'Booking not found'}</p>
          <button onClick={() => navigate('/my-bookings')} className="btn-primary">
            Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-success-container">
      <div className="success-card">
        <div className="success-icon">
          <i className="fas fa-file-invoice" style={{ fontSize: '48px', color: '#667eea' }}></i>
        </div>

        <h1 className="success-title">Booking Details</h1>
        <p className="success-subtitle">
          Booking ID: {booking.id}
        </p>

        <div className="booking-details-card">
          <h2>Booking Information</h2>

          <div className="detail-row">
            <span className="detail-label">Item:</span>
            <span className="detail-value">{getItemName(item)}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Category:</span>
            <span className="detail-value">{item?.type}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">From:</span>
            <span className="detail-value">
              {getBookingDates().from}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">To:</span>
            <span className="detail-value">
              {getBookingDates().to}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Amount:</span>
            <span className="detail-value highlight">
              {getBookingAmount() > 0 ? `₹${getBookingAmount()}` : 'N/A'}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Status:</span>
            <span className={`status-badge ${booking.bookingStatus?.toLowerCase()}`}>
              {booking.bookingStatus || booking.status || 'Confirmed'}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Booked On:</span>
            <span className="detail-value">
              {booking.createdOn ? new Date(booking.createdOn).toLocaleString() : 'N/A'}
            </span>
          </div>
        </div>

        {/* Coupon Section */}
        {coupons.length > 0 && (
          <div className="coupons-section" style={{
            marginTop: '30px',
            padding: '25px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            color: 'white'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '28px' }}>🎁</span>
              Your Discount Coupons
            </h3>
            <p style={{ margin: '0 0 20px 0', opacity: 0.9, fontSize: '14px' }}>
              Use these coupons within 48 hours to get exclusive discounts on bundle items!
            </p>

            {coupons.map((coupon) => (
              <div key={coupon.id} style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                padding: '20px',
                borderRadius: '10px',
                marginBottom: '15px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <div>
                    <div style={{
                      background: '#10b981',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '700',
                      display: 'inline-block',
                      marginBottom: '8px'
                    }}>
                      {coupon.discountPercentage}% OFF
                    </div>
                    <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
                      {coupon.description}
                    </p>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  padding: '12px 15px',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Coupon Code</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#333', fontFamily: 'monospace', letterSpacing: '1px' }}>
                      {coupon.code}
                    </div>
                  </div>
                  <button
                    onClick={() => copyCouponCode(coupon.code)}
                    style={{
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    📋 Copy Code
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <div>
                    ⏰ {getTimeRemaining(coupon.expiryTime)}
                  </div>
                  <div style={{ opacity: 0.8 }}>
                    Expires: {new Date(coupon.expiryTime).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}

            <div style={{
              marginTop: '20px',
              padding: '15px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              fontSize: '13px',
              lineHeight: '1.6'
            }}>
              <i className="fas fa-info-circle" style={{ marginRight: '8px' }}></i>
              <strong>How to use:</strong> Copy the coupon code and paste it on the booking page of the respective item. The discount will be applied automatically!
            </div>
          </div>
        )}

        <div className="action-buttons">
          <button
            onClick={() => navigate('/my-bookings')}
            className="btn-primary"
          >
            <i className="fas fa-arrow-left"></i> Back to My Bookings
          </button>

          <button
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            <i className="fas fa-home"></i> Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsPage;
