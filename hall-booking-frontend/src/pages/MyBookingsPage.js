import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyBookings, cancelBooking } from '../services/bookingService';
import { formatDateTime } from '../utils/dateFormatter';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const status = filter === 'all' ? null : filter.toUpperCase();
      const response = await getMyBookings({ status });
      setBookings(response.bookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      alert('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await cancelBooking(bookingId);
      alert('Booking cancelled successfully');
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
                  <h3 style={{ fontSize: '28px', marginBottom: '15px', color: '#19191a' }}>No Bookings Found</h3>
                  <p style={{ fontSize: '16px', color: '#707079', marginBottom: '30px' }}>
                    You haven't made any bookings yet. Start exploring our luxury venues!
                  </p>
                  <Link to="/" className="primary-btn">
                    <i className="fa fa-search" style={{ marginRight: '8px' }}></i>
                    Browse Halls
                  </Link>
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
                    borderLeft: booking.status === 'CONFIRMED' ? '4px solid #28a745' : '4px solid #dc3545',
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
                          <h4 style={{ fontSize: '24px', margin: 0, color: '#19191a' }}>{booking.hallName}</h4>
                          <span style={{
                            display: 'inline-block',
                            padding: '5px 15px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: booking.status === 'CONFIRMED' ? '#d4edda' : '#f8d7da',
                            color: booking.status === 'CONFIRMED' ? '#155724' : '#721c24',
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
                              <strong>Start:</strong> {formatDateTime(booking.startDateTime)}
                            </p>
                            <p style={{ color: '#707079', marginBottom: '10px', fontSize: '14px' }}>
                              <i className="fa fa-calendar-alt" style={{ color: '#dfa974', marginRight: '8px', width: '20px' }}></i>
                              <strong>End:</strong> {formatDateTime(booking.endDateTime)}
                            </p>
                          </div>
                          <div className="col-md-6">
                            {booking.numberOfAttendees && (
                              <p style={{ color: '#707079', marginBottom: '10px', fontSize: '14px' }}>
                                <i className="fa fa-users" style={{ color: '#dfa974', marginRight: '8px', width: '20px' }}></i>
                                <strong>Attendees:</strong> {booking.numberOfAttendees} guests
                              </p>
                            )}
                            {booking.purpose && (
                              <p style={{ color: '#707079', marginBottom: '10px', fontSize: '14px' }}>
                                <i className="fa fa-info-circle" style={{ color: '#dfa974', marginRight: '8px', width: '20px' }}></i>
                                <strong>Purpose:</strong> {booking.purpose}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="col-lg-4" style={{ textAlign: 'right' }}>
                        {booking.totalPrice && (
                          <div style={{
                            background: '#f9f9f9',
                            padding: '20px',
                            marginBottom: '15px',
                            borderLeft: '3px solid #dfa974'
                          }}>
                            <p style={{ fontSize: '14px', color: '#707079', marginBottom: '5px' }}>Total Amount</p>
                            <h3 style={{ fontSize: '32px', color: '#dfa974', margin: 0, fontFamily: 'Lora, serif' }}>
                              ₹{parseFloat(booking.totalPrice).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h3>
                          </div>
                        )}

                        {booking.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
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
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default MyBookingsPage;
