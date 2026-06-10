import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getBookingById } from '../services/bookingService';
import { getItemById } from '../services/itemService';
import { getCouponsByBooking } from '../services/couponService';
import './BookingSuccessPage.css';

/**
 * Booking Success Page
 * Displays booking confirmation and available bundle offers
 */
const BookingSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [item, setItem] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get booking ID from location state
  const bookingId = location.state?.bookingId;

  useEffect(() => {
    console.log('=== BookingSuccessPage Loaded ===');
    console.log('Location state:', location.state);
    console.log('Booking ID:', bookingId);
    console.log('================================');

    if (!bookingId) {
      console.error('ERROR: Booking ID not found in location.state');
      setError('Booking ID not found. Please check your bookings in "My Bookings" page.');
      setLoading(false);
      return;
    }

    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch booking details
      console.log('=== Fetching Booking Details ===');
      console.log('Booking ID:', bookingId);
      const bookingData = await getBookingById(bookingId);
      console.log('Booking data:', bookingData);
      console.log('================================');

      setBooking(bookingData);

      // Fetch item details
      console.log('=== Fetching Item Details ===');
      console.log('Item ID:', bookingData.itemId);
      const itemData = await getItemById(bookingData.itemId);
      console.log('Item data:', itemData);
      console.log('=============================');

      setItem(itemData);

      // Fetch coupons generated from this booking
      console.log('=== Fetching Coupons ===');
      console.log('Booking ID:', bookingId);
      try {
        const couponsResponse = await getCouponsByBooking(bookingId);
        console.log('Coupons response:', couponsResponse);

        if (couponsResponse.success && couponsResponse.data && couponsResponse.data.length > 0) {
          console.log(`Found ${couponsResponse.data.length} coupon(s)`);
          setCoupons(couponsResponse.data);
        } else {
          console.log('No coupons generated for this booking');
        }
      } catch (err) {
        console.warn('Failed to fetch coupons:', err);
        // Don't fail the page if coupons can't be loaded
      }
      console.log('========================')

    } catch (err) {
      console.error('=== ERROR Fetching Booking Details ===');
      console.error('Error object:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      console.error('======================================');
      setError(`Failed to load booking details: ${err.response?.data?.message || err.message}`);
    } finally {
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

  const handleBookNow = (coupon) => {
    // Navigate to booking page with coupon pre-applied
    navigate(`/booking/${coupon.applicableItemId}`, {
      state: {
        couponCode: coupon.code,
        fromCoupon: true
      }
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
    console.log('=== getBookingAmount DEBUG ===');
    console.log('booking object:', booking);
    console.log('booking.details:', booking?.details);
    console.log('booking.details.totalBookingAmount:', booking?.details?.totalBookingAmount);
    console.log('booking.discountApplied:', booking?.discountApplied);
    console.log('booking.discountReason:', booking?.discountReason);
    console.log('==============================');

    let baseAmount = 0;

    // Priority 1: For catering and other bookings with calculated total amounts
    if (booking?.details?.totalBookingAmount !== undefined && booking.details.totalBookingAmount !== null) {
      baseAmount = booking.details.totalBookingAmount;
    }
    // Priority 2: Try to get from booking details pricing (includes discounts, fees, etc.)
    else if (booking?.details?.pricing?.total !== undefined && booking.details.pricing.total !== null) {
      baseAmount = booking.details.pricing.total;
    }
    // Priority 3: Try additionalDetails map
    else if (booking?.details?.additionalDetails?.pricing?.total !== undefined) {
      baseAmount = booking.details.additionalDetails.pricing.total;
    }
    // Fallback: Try to get base price from item dynamicData
    else if (item?.dynamicData) {
      // Try common price field names
      const price = item.dynamicData.field_hall_price ||
                    item.dynamicData.price_per_person ||
                    item.dynamicData.price_per_day ||
                    item.dynamicData.price ||
                    0;
      if (price) baseAmount = parseFloat(price);
    }
    // Last resort: check top-level price
    else if (item?.price) {
      baseAmount = parseFloat(item.price);
    }

    // Apply coupon discount if present
    if (booking?.discountApplied && booking.discountApplied > 0) {
      const discountAmount = (baseAmount * booking.discountApplied) / 100;
      const finalAmount = baseAmount - discountAmount;
      console.log('Base amount:', baseAmount);
      console.log('Discount %:', booking.discountApplied);
      console.log('Discount amount:', discountAmount);
      console.log('Final amount:', finalAmount);
      return finalAmount;
    }

    return baseAmount;
  };

  const getBookingDates = () => {
    console.log('=== getBookingDates DEBUG ===');
    console.log('booking object:', booking);
    console.log('booking.bookingFromDate:', booking?.bookingFromDate);
    console.log('booking.bookingToDate:', booking?.bookingToDate);
    console.log('booking.details:', booking?.details);
    console.log('=============================');

    // Priority 1: bookingFromDate and bookingToDate from Booking model
    if (booking?.bookingFromDate) {
      const fromDate = new Date(booking.bookingFromDate);
      const toDate = booking.bookingToDate ? new Date(booking.bookingToDate) : fromDate;

      return {
        from: fromDate.toLocaleString(),
        to: toDate.toLocaleString()
      };
    }

    // Priority 2: Try details fields
    if (booking?.details) {
      const details = booking.details.additionalDetails || booking.details;

      // Single day booking
      if (details.event_date) {
        return {
          from: new Date(details.event_date).toLocaleDateString(),
          to: new Date(details.event_date).toLocaleDateString()
        };
      }

      // Multi-day booking
      if (details.start_date && details.end_date) {
        return {
          from: new Date(details.start_date).toLocaleDateString(),
          to: new Date(details.end_date).toLocaleDateString()
        };
      }

      // Check-in/check-out dates
      if (details.checkin_date && details.checkout_date) {
        return {
          from: new Date(details.checkin_date).toLocaleDateString(),
          to: new Date(details.checkout_date).toLocaleDateString()
        };
      }
    }

    return {
      from: 'N/A',
      to: 'N/A'
    };
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
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-success-container">
      <div className="success-card">
        <div className="success-icon">
          <div className="checkmark-circle">
            <svg className="checkmark" viewBox="0 0 52 52">
              <circle className="checkmark-circle-path" cx="26" cy="26" r="25" fill="none"/>
              <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
        </div>

        <h1 className="success-title">Booking Confirmed!</h1>
        <p className="success-subtitle">
          Your booking has been successfully created
        </p>

        <div className="booking-details-card">
          <h2>Booking Details</h2>

          <div className="detail-row">
            <span className="detail-label">Booking ID:</span>
            <span className="detail-value">{booking.id}</span>
          </div>

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
              {(() => {
                const amount = getBookingAmount();
                // Show ₹0 for 100% discount, N/A only if truly unavailable
                if (amount >= 0 && (booking?.discountApplied > 0 || amount > 0)) {
                  return `₹${amount}`;
                }
                return 'N/A';
              })()}
              {booking?.discountApplied > 0 && (
                <span style={{
                  marginLeft: '10px',
                  padding: '2px 8px',
                  background: '#d4edda',
                  color: '#155724',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {booking.discountApplied}% OFF
                </span>
              )}
            </span>
          </div>

          {booking?.discountReason && (
            <div className="detail-row" style={{ fontSize: '13px', color: '#28a745' }}>
              <span className="detail-label">💰 Discount:</span>
              <span className="detail-value">
                {booking.discountReason}
              </span>
            </div>
          )}

          <div className="detail-row">
            <span className="detail-label">Status:</span>
            <span className={`status-badge ${booking.status?.toLowerCase()}`}>
              {booking.status}
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
                    {coupon.sameDayOnly && coupon.parentBookingDate && (
                      <div style={{
                        marginTop: '8px',
                        padding: '6px 10px',
                        background: '#fff3cd',
                        color: '#856404',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'inline-block'
                      }}>
                        📅 Valid only for bookings on {(() => {
                          try {
                            // Handle both string format (YYYY-MM-DD) and array format [YYYY,M,D]
                            const dateStr = Array.isArray(coupon.parentBookingDate)
                              ? `${coupon.parentBookingDate[0]}-${String(coupon.parentBookingDate[1]).padStart(2, '0')}-${String(coupon.parentBookingDate[2]).padStart(2, '0')}`
                              : coupon.parentBookingDate;

                            // Parse as local date to avoid timezone shift
                            // YYYY-MM-DD string should be treated as local date, not UTC
                            const [year, month, day] = dateStr.split('-').map(Number);
                            const localDate = new Date(year, month - 1, day); // month is 0-indexed

                            return localDate.toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            });
                          } catch (e) {
                            return coupon.parentBookingDate;
                          }
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  padding: '12px 15px',
                  borderRadius: '8px',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
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
                        fontWeight: '600',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.background = '#5568d3'}
                      onMouseOut={(e) => e.target.style.background = '#667eea'}
                    >
                      📋 Copy Code
                    </button>
                  </div>

                  {/* Book Now Button */}
                  <button
                    onClick={() => handleBookNow(coupon)}
                    style={{
                      width: '100%',
                      background: coupon.discountPercentage === 100
                        ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '14px 24px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      transition: 'all 0.3s',
                      boxShadow: coupon.discountPercentage === 100
                        ? '0 4px 12px rgba(245, 158, 11, 0.3)'
                        : '0 4px 12px rgba(16, 185, 129, 0.3)'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = coupon.discountPercentage === 100
                        ? '0 6px 16px rgba(245, 158, 11, 0.4)'
                        : '0 6px 16px rgba(16, 185, 129, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = coupon.discountPercentage === 100
                        ? '0 4px 12px rgba(245, 158, 11, 0.3)'
                        : '0 4px 12px rgba(16, 185, 129, 0.3)';
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>
                      {coupon.discountPercentage === 100 ? '🎉' : '🎯'}
                    </span>
                    {coupon.discountPercentage === 100
                      ? 'Book Now for FREE'
                      : `Book Now with ${coupon.discountPercentage}% Discount`
                    }
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
              <strong>How to use:</strong> Click "Book Now" button to go directly to the booking page with your coupon pre-applied, or copy the code and use it manually later. The discount will be applied automatically!
            </div>
          </div>
        )}

        <div className="action-buttons">
          <button
            onClick={() => navigate('/my-bookings')}
            className="btn-primary"
          >
            View My Bookings
          </button>

          <button
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
