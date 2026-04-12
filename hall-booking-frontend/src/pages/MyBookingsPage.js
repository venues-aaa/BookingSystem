import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyBookings, cancelBooking } from '../services/bookingService';
import { formatDateTime } from '../utils/dateFormatter';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Capitalize first letter to match backend format (Confirmed, Cancelled)
      const status = filter === 'all' ? undefined : filter.charAt(0).toUpperCase() + filter.slice(1).toLowerCase();
      const response = await getMyBookings({ status });
      console.log('Bookings response:', response);
      // Backend returns {availability: [...]} instead of {bookings: [...]}
      setBookings(response.availability || response.bookings || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      alert('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (booking) => {
    // Check if the booking is in the past
    const bookingEndDate = new Date(booking.bookingToDate || booking.endDateTime);
    const now = new Date();

    if (bookingEndDate < now) {
      alert('Cannot cancel a booking for a past event');
      return;
    }

    setSelectedBooking(booking);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const isBookingInPast = (booking) => {
    const bookingEndDate = new Date(booking.bookingToDate || booking.endDateTime);
    const now = new Date();
    return bookingEndDate < now;
  };

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    try {
      await cancelBooking(selectedBooking.id, cancelReason);
      alert('Booking cancelled successfully');
      setShowCancelModal(false);
      setSelectedBooking(null);
      setCancelReason('');
      fetchBookings();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      alert(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '70vh',
        flexDirection: 'column',
        gap: '20px',
        marginTop: '130px'
      }}>
        <div className="loading"></div>
        <p style={{ fontSize: '18px', color: '#707079' }}>Loading your bookings...</p>
      </div>
    );
  }

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
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: '48px', fontWeight: '400', color: '#19191a', marginBottom: '20px' }}>My Bookings</h2>
              {/* Breadcrumb */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '15px', fontFamily: "'Cabin', sans-serif" }}>
                <Link to="/" style={{ color: '#19191a', fontSize: '16px', fontWeight: '500', textDecoration: 'none' }}>Home</Link>
                <i className="fa fa-angle-right" style={{ color: '#dfa974' }}></i>
                <span style={{ color: '#dfa974' }}>My Bookings</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* My Bookings Section */}
      <section style={{ paddingTop: '12px', paddingBottom: '100px' }}>
        <div className="container">
          {/* Filter Buttons */}
          <div className="row">
            <div className="col-lg-12">
              <div style={{
                background: '#ffffff',
                boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
                padding: '20px 30px',
                marginBottom: '40px',
                display: 'flex',
                gap: '15px',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => setFilter('all')}
                  style={{
                    padding: '10px 25px',
                    background: 'transparent',
                    border: 'none',
                    color: '#19191a',
                    fontSize: '14px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    borderBottom: filter === 'all' ? '2px solid #dfa974' : '2px solid transparent',
                    transition: 'all 0.3s'
                  }}
                >
                  <i className="fa fa-list" style={{ marginRight: '8px' }}></i>
                  All Bookings
                </button>
                <button
                  onClick={() => setFilter('confirmed')}
                  style={{
                    padding: '10px 25px',
                    background: 'transparent',
                    border: 'none',
                    color: '#19191a',
                    fontSize: '14px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    borderBottom: filter === 'confirmed' ? '2px solid #dfa974' : '2px solid transparent',
                    transition: 'all 0.3s'
                  }}
                >
                  <i className="fa fa-check-circle" style={{ marginRight: '8px' }}></i>
                  Confirmed
                </button>
                <button
                  onClick={() => setFilter('cancelled')}
                  style={{
                    padding: '10px 25px',
                    background: 'transparent',
                    border: 'none',
                    color: '#19191a',
                    fontSize: '14px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    borderBottom: filter === 'cancelled' ? '2px solid #dfa974' : '2px solid transparent',
                    transition: 'all 0.3s'
                  }}
                >
                  <i className="fa fa-times-circle" style={{ marginRight: '8px' }}></i>
                  Cancelled
                </button>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          {bookings.length === 0 ? (
            <div className="row">
              <div className="col-lg-12">
                <div style={{
                  background: '#ffffff',
                  boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
                  padding: '80px 20px',
                  textAlign: 'center'
                }}>
                  <i className="fas fa-calendar-times fa-4x" style={{ color: '#dfa974', marginBottom: '20px' }}></i>
                  <h3 style={{ fontSize: '28px', marginBottom: '15px', color: '#19191a' }}>
                    {filter === 'all' ? 'No Bookings Found' : `No ${filter.charAt(0).toUpperCase() + filter.slice(1)} Bookings`}
                  </h3>
                  <p style={{ fontSize: '16px', color: '#707079', marginBottom: '30px' }}>
                    {filter === 'all'
                      ? "You haven't made any bookings yet. Start exploring our luxury venues!"
                      : filter === 'confirmed'
                      ? "You don't have any confirmed bookings at the moment."
                      : "You don't have any cancelled bookings."}
                  </p>
                  {filter === 'all' && (
                    <Link to="/" className="primary-btn">
                      <i className="fa fa-search" style={{ marginRight: '8px' }}></i>
                      Browse Halls
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="row">
              {bookings.map((booking) => (
                <div key={booking.id} className="col-lg-12">
                  <div style={{
                    background: '#ffffff',
                    boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
                    padding: '30px',
                    marginBottom: '25px',
                    borderLeft: (booking.status === 'CONFIRMED' || booking.status === 'Confirmed') ? '4px solid #28a745' : '4px solid #dc3545',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  >
                    <div className="row align-items-center">
                      <div className="col-lg-8">
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                          <h4 style={{ fontSize: '24px', margin: 0, color: '#19191a' }}>{booking.itemName || booking.hallName || `Booking #${booking.id?.substring(0, 8)}`}</h4>
                          <span style={{
                            display: 'inline-block',
                            padding: '5px 15px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: (booking.status === 'CONFIRMED' || booking.status === 'Confirmed') ? '#d4edda' : '#f8d7da',
                            color: (booking.status === 'CONFIRMED' || booking.status === 'Confirmed') ? '#155724' : '#721c24',
                            marginLeft: '15px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            {booking.status}
                          </span>
                        </div>

                        <div className="row" style={{ marginTop: '20px' }}>
                          <div className="col-md-6">
                            <p style={{ color: '#707079', marginBottom: '10px', fontSize: '14px' }}>
                              <i className="fa fa-calendar-alt" style={{ color: '#dfa974', marginRight: '8px', width: '20px' }}></i>
                              <strong>Start:</strong> {formatDateTime(booking.bookingFromDate || booking.startDateTime)}
                            </p>
                            <p style={{ color: '#707079', marginBottom: '10px', fontSize: '14px' }}>
                              <i className="fa fa-calendar-alt" style={{ color: '#dfa974', marginRight: '8px', width: '20px' }}></i>
                              <strong>End:</strong> {formatDateTime(booking.bookingToDate || booking.endDateTime)}
                            </p>
                          </div>
                          <div className="col-md-6">
                            {(booking.details?.numberOfAttendees || booking.numberOfAttendees) && (
                              <p style={{ color: '#707079', marginBottom: '10px', fontSize: '14px' }}>
                                <i className="fa fa-users" style={{ color: '#dfa974', marginRight: '8px', width: '20px' }}></i>
                                <strong>Attendees:</strong> {booking.details?.numberOfAttendees || booking.numberOfAttendees} guests
                              </p>
                            )}
                            {(booking.details?.functionType || booking.purpose) && (
                              <p style={{ color: '#707079', marginBottom: '10px', fontSize: '14px' }}>
                                <i className="fa fa-info-circle" style={{ color: '#dfa974', marginRight: '8px', width: '20px' }}></i>
                                <strong>Purpose:</strong> {booking.details?.functionType || booking.purpose}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Cancellation Details for Cancelled Bookings */}
                        {(booking.status === 'Cancelled' || booking.status === 'CANCELLED') && (
                          <div style={{ marginTop: '20px', padding: '15px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px' }}>
                            <h5 style={{ fontSize: '16px', color: '#856404', marginBottom: '10px' }}>
                              <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
                              Cancellation Details
                            </h5>
                            {booking.details?.blockedReason && (
                              <p style={{ fontSize: '14px', color: '#856404', marginBottom: '8px' }}>
                                <strong>Reason:</strong> {booking.details.blockedReason}
                              </p>
                            )}
                            {booking.lastUpdateUserId && (
                              <p style={{ fontSize: '14px', color: '#856404', marginBottom: '8px' }}>
                                <strong>Cancelled By:</strong> {booking.lastUpdateUserId}
                              </p>
                            )}
                            {booking.lastUpdateDate && (
                              <p style={{ fontSize: '14px', color: '#856404', marginBottom: '0' }}>
                                <strong>Cancelled On:</strong> {formatDateTime(booking.lastUpdateDate)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="col-lg-4" style={{ textAlign: 'right' }}>
                        {(booking.details?.totalPrice || booking.totalPrice) && (
                          <div style={{
                            background: '#f9f9f9',
                            padding: '20px',
                            marginBottom: '15px',
                            borderLeft: '3px solid #dfa974'
                          }}>
                            <p style={{ fontSize: '14px', color: '#707079', marginBottom: '5px' }}>Total Amount</p>
                            <h3 style={{ fontSize: '32px', color: '#dfa974', margin: 0, fontFamily: 'Lora, serif' }}>
                              ₹{parseFloat(booking.details?.totalPrice || booking.totalPrice).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h3>
                          </div>
                        )}

                        {(booking.status === 'CONFIRMED' || booking.status === 'Confirmed') && (
                          <>
                            {isBookingInPast(booking) ? (
                              <div style={{
                                background: '#f8f9fa',
                                padding: '15px',
                                textAlign: 'center',
                                border: '1px solid #dee2e6',
                                borderRadius: '4px'
                              }}>
                                <i className="fa fa-calendar-times" style={{ color: '#6c757d', marginRight: '8px' }}></i>
                                <span style={{ fontSize: '14px', color: '#6c757d', fontWeight: '600' }}>
                                  Past Event
                                </span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleCancelClick(booking)}
                                style={{
                                  background: 'transparent',
                                  color: '#dc3545',
                                  border: '2px solid #dc3545',
                                  padding: '10px 20px',
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  textTransform: 'uppercase',
                                  letterSpacing: '1px',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s',
                                  width: '100%'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.background = '#dc3545';
                                  e.target.style.color = '#ffffff';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.background = 'transparent';
                                  e.target.style.color = '#dc3545';
                                }}
                              >
                                <i className="fa fa-times-circle" style={{ marginRight: '8px' }}></i>
                                Cancel Booking
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#ffffff',
            padding: '40px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#19191a' }}>
              <i className="fa fa-exclamation-circle" style={{ color: '#dc3545', marginRight: '10px' }}></i>
              Cancel Booking
            </h3>
            <p style={{ marginBottom: '20px', color: '#707079' }}>
              Please provide a reason for cancelling this booking:
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              rows="4"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e5e5',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
                marginBottom: '20px'
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedBooking(null);
                  setCancelReason('');
                }}
                style={{
                  padding: '12px 24px',
                  background: '#6c757d',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Close
              </button>
              <button
                onClick={handleCancelBooking}
                style={{
                  padding: '12px 24px',
                  background: '#dc3545',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyBookingsPage;
