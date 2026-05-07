import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllBookings } from '../../services/adminService';
import { getHallById } from '../../services/hallService';
import { formatDateTime } from '../../utils/dateFormatter';

const AllBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [categories, setCategories] = useState({});

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const status = filter === 'all' ? undefined : filter.charAt(0).toUpperCase() + filter.slice(1).toLowerCase();
      const response = await getAllBookings({ status });
      const bookingsList = response.availability || response.bookings || [];

      console.log('Raw bookings from API:', bookingsList);

      // Fetch item details for each booking to get item name and category
      const categoryMap = {};
      const enrichedBookings = await Promise.all(
        bookingsList.map(async (booking) => {
          console.log('Processing booking:', booking.id, 'itemId:', booking.itemId);

          if (booking.itemId) {
            // Try to get from cache first
            if (!categoryMap[booking.itemId]) {
              try {
                console.log('Fetching item details for:', booking.itemId);
                const itemResponse = await getHallById(booking.itemId);
                console.log('Item response:', itemResponse);

                // Extract actual item data from response
                const item = itemResponse.data?.halls || itemResponse.data || itemResponse.halls || itemResponse;
                console.log('Actual item:', item);

                // Get item name from various possible fields
                let itemName = item.name || item.details?.name || null;

                // For items with dynamicData, the name is usually the first field
                if (!itemName && item.dynamicData) {
                  // Try common field names first
                  itemName = item.dynamicData.name || item.dynamicData.item_name || item.dynamicData.itemName;

                  // If not found, take the first string value (name is typically the first field)
                  if (!itemName) {
                    const firstValue = Object.values(item.dynamicData)[0];
                    if (typeof firstValue === 'string') {
                      itemName = firstValue;
                    }
                  }
                }

                if (!itemName) {
                  itemName = 'Unknown Item';
                }

                categoryMap[booking.itemId] = {
                  categoryId: item.categoryId,
                  type: item.type,
                  categoryName: item.type,
                  itemName: itemName
                };

                console.log('Cached item info:', categoryMap[booking.itemId]);
              } catch (error) {
                console.error(`Failed to fetch item ${booking.itemId}:`, error);
                categoryMap[booking.itemId] = {
                  categoryName: 'Unknown',
                  itemName: 'Unknown Item'
                };
              }
            }

            // Enrich booking with item name and category
            return {
              ...booking,
              itemName: booking.itemName || booking.hallName || categoryMap[booking.itemId]?.itemName || `Booking #${booking.id?.substring(0, 8)}`,
              displayCategoryName: categoryMap[booking.itemId]?.categoryName
            };
          } else {
            console.log('No itemId for booking:', booking.id);
            return {
              ...booking,
              itemName: booking.itemName || booking.hallName || `Booking #${booking.id?.substring(0, 8)}`
            };
          }
        })
      );

      console.log('Enriched bookings:', enrichedBookings);
      setCategories(categoryMap);
      setBookings(enrichedBookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      alert('Failed to load bookings');
    } finally {
      setLoading(false);
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
        <p style={{ fontSize: '18px', color: '#707079' }}>Loading all bookings...</p>
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
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: '48px', fontWeight: '400', color: '#19191a', marginBottom: '20px' }}>All Bookings</h2>
              {/* Breadcrumb */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '15px', fontFamily: "'Cabin', sans-serif" }}>
                <Link to="/admin/dashboard" style={{ color: '#19191a', fontSize: '16px', fontWeight: '500', textDecoration: 'none' }}>Admin Dashboard</Link>
                <i className="fa fa-angle-right" style={{ color: '#dfa974' }}></i>
                <span style={{ color: '#dfa974' }}>All Bookings</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Bookings Section */}
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
                  <p style={{ fontSize: '16px', color: '#707079' }}>
                    {filter === 'all'
                      ? "There are no bookings in the system yet."
                      : `There are no ${filter} bookings at the moment.`}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="row">
              {bookings.map((booking) => {
                console.log('Rendering booking:', booking.id, 'itemName:', booking.itemName, 'displayCategoryName:', booking.displayCategoryName);

                return (
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
                          {/* Item Name and Badges Row */}
                          <div style={{ marginBottom: '20px' }}>
                            <h4 style={{
                              fontSize: '26px',
                              margin: '0 0 12px 0',
                              color: '#19191a',
                              fontWeight: '600',
                              letterSpacing: '-0.5px'
                            }}>
                              {booking.itemName || booking.hallName || `Booking #${booking.id?.substring(0, 8)}`}
                            </h4>

                            {/* Badges Row */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              {/* Category Badge */}
                              {booking.displayCategoryName && (
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '6px 14px',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  color: '#ffffff',
                                  textTransform: 'capitalize',
                                  letterSpacing: '0.3px',
                                  boxShadow: '0 2px 4px rgba(102, 126, 234, 0.3)'
                                }}>
                                  <i className="fa fa-tag" style={{ fontSize: '11px' }}></i>
                                  {booking.displayCategoryName}
                                </span>
                              )}

                              {/* Status Badge */}
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 14px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: '600',
                                background: (booking.status === 'CONFIRMED' || booking.status === 'Confirmed')
                                  ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                                  : 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
                                color: '#ffffff',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                boxShadow: (booking.status === 'CONFIRMED' || booking.status === 'Confirmed')
                                  ? '0 2px 4px rgba(17, 153, 142, 0.3)'
                                  : '0 2px 4px rgba(235, 51, 73, 0.3)'
                              }}>
                                <i className={`fa fa-${(booking.status === 'CONFIRMED' || booking.status === 'Confirmed') ? 'check-circle' : 'times-circle'}`}
                                   style={{ fontSize: '11px' }}></i>
                                {booking.status}
                              </span>

                              {/* Booking ID - subtle */}
                              <span style={{
                                display: 'inline-block',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '500',
                                background: '#f3f4f6',
                                color: '#6b7280',
                                letterSpacing: '0.3px'
                              }}>
                                ID: {booking.id?.substring(0, 12)}...
                              </span>
                            </div>
                          </div>

                          <div className="row" style={{ marginTop: '20px' }}>
                            <div className="col-md-6">
                              {/* Booked By Information */}
                              <p style={{ color: '#707079', marginBottom: '10px', fontSize: '14px' }}>
                                <i className="fa fa-user" style={{ color: '#dfa974', marginRight: '8px', width: '20px' }}></i>
                                <strong>Booked by:</strong> {booking.userName || booking.userEmail || booking.userId || 'N/A'}
                              </p>
                              {(booking.userName && booking.userEmail) && (
                                <p style={{ color: '#707079', marginBottom: '10px', fontSize: '14px' }}>
                                  <i className="fa fa-envelope" style={{ color: '#dfa974', marginRight: '8px', width: '20px' }}></i>
                                  <strong>Email:</strong> {booking.userEmail}
                                </p>
                              )}
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
                              {booking.createdOn && (
                                <p style={{ color: '#707079', marginBottom: '10px', fontSize: '14px' }}>
                                  <i className="fa fa-clock" style={{ color: '#dfa974', marginRight: '8px', width: '20px' }}></i>
                                  <strong>Booked On:</strong> {formatDateTime(booking.createdOn)}
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

                          <div style={{
                            background: '#f8f9fa',
                            padding: '15px',
                            textAlign: 'center',
                            border: '1px solid #dee2e6',
                            borderRadius: '4px'
                          }}>
                            <p style={{ fontSize: '12px', color: '#6c757d', margin: 0 }}>
                              Booking ID: {booking.id?.substring(0, 12)}...
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default AllBookingsPage;
