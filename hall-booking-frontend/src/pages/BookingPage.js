import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getHallById } from '../services/hallService';
import { createBooking } from '../services/bookingService';

const BookingPage = () => {
  const { hallId } = useParams();
  const navigate = useNavigate();
  const [hall, setHall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    startDateTime: '',
    endDateTime: '',
    purpose: '',
    numberOfAttendees: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchHallDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hallId]);

  const fetchHallDetails = async () => {
    try {
      const data = await getHallById(hallId);
      setHall(data);
    } catch (error) {
      console.error('Failed to fetch hall details:', error);
      alert('Failed to load hall details');
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

  const calculateHours = () => {
    if (formData.startDateTime && formData.endDateTime) {
      const start = new Date(formData.startDateTime);
      const end = new Date(formData.endDateTime);
      const hours = Math.ceil((end - start) / (1000 * 60 * 60));
      return hours > 0 ? hours : 0;
    }
    return 0;
  };

  const calculateTotal = () => {
    const hours = calculateHours();
    const total = hall?.pricePerHour ? (hours * hall.pricePerHour).toFixed(2) : '0.00';
    return parseFloat(total).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const bookingData = {
        hallId: parseInt(hallId),
        startDateTime: formData.startDateTime,
        endDateTime: formData.endDateTime,
        purpose: formData.purpose,
        numberOfAttendees: formData.numberOfAttendees ? parseInt(formData.numberOfAttendees) : null,
      };

      await createBooking(bookingData);
      alert('Booking created successfully!');
      navigate('/my-bookings');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const defaultImages = [
    'https://images.unsplash.com/photo-1519167758481-83f29da8f969?w=600&q=80',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
  ];

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
        <p style={{ fontSize: '18px', color: '#707079' }}>Loading booking form...</p>
      </div>
    );
  }

  if (!hall) {
    return (
      <div className="container" style={{ marginTop: '150px', textAlign: 'center', paddingBottom: '100px' }}>
        <i className="fas fa-exclamation-triangle fa-4x" style={{ color: '#dfa974', marginBottom: '20px' }}></i>
        <h2 style={{ marginBottom: '15px' }}>Hall Not Found</h2>
        <Link to="/" className="primary-btn">Back to Halls</Link>
      </div>
    );
  }

  const imageUrl = hall.imageUrl || defaultImages[hall.id % 3];

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
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: '48px', fontWeight: '400', color: '#19191a', marginBottom: '20px' }}>Book Hall</h2>
              {/* Breadcrumb */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '15px', fontFamily: "'Cabin', sans-serif" }}>
                <Link to="/" style={{ color: '#19191a', fontSize: '16px', fontWeight: '500', textDecoration: 'none' }}>Home</Link>
                <i className="fa fa-angle-right" style={{ color: '#dfa974' }}></i>
                <Link to={`/halls/${hallId}`} style={{ color: '#707079', textDecoration: 'none' }}>{hall.name}</Link>
                <i className="fa fa-angle-right" style={{ color: '#dfa974' }}></i>
                <span style={{ color: '#dfa974' }}>Booking</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form Section */}
      <section style={{ paddingTop: '12px', paddingBottom: '100px' }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title" style={{ marginBottom: '50px' }}>
                <span>Reserve Your Venue</span>
                <h2>Complete Your Booking</h2>
              </div>
            </div>
          </div>

          <div className="row">
            {/* Booking Form */}
            <div className="col-lg-8">
              <div className="booking-form">
                <h3>Booking Details</h3>
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Start Date & Time <span style={{ color: '#dfa974' }}>*</span></label>
                        <input
                          type="datetime-local"
                          name="startDateTime"
                          className="form-control"
                          value={formData.startDateTime}
                          onChange={handleChange}
                          required
                          min={new Date().toISOString().slice(0, 16)}
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label>End Date & Time <span style={{ color: '#dfa974' }}>*</span></label>
                        <input
                          type="datetime-local"
                          name="endDateTime"
                          className="form-control"
                          value={formData.endDateTime}
                          onChange={handleChange}
                          required
                          min={formData.startDateTime || new Date().toISOString().slice(0, 16)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Number of Attendees</label>
                    <input
                      type="number"
                      name="numberOfAttendees"
                      className="form-control"
                      value={formData.numberOfAttendees}
                      onChange={handleChange}
                      placeholder={`Maximum capacity: ${hall.capacity} guests`}
                      min="1"
                      max={hall.capacity}
                    />
                    <small style={{ color: '#707079', fontSize: '13px', display: 'block', marginTop: '8px' }}>
                      <i className="fa fa-info-circle" style={{ marginRight: '5px' }}></i>
                      This hall can accommodate up to {hall.capacity} guests
                    </small>
                  </div>

                  <div className="form-group">
                    <label>Event Purpose</label>
                    <textarea
                      name="purpose"
                      className="form-control"
                      value={formData.purpose}
                      onChange={handleChange}
                      placeholder="Tell us about your event (e.g., Wedding Reception, Corporate Meeting, Conference)"
                      rows="4"
                    />
                  </div>

                  {error && (
                    <div style={{
                      background: '#ffe6e6',
                      border: '1px solid #ff4d4d',
                      color: '#cc0000',
                      padding: '15px',
                      marginBottom: '25px',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}>
                      <i className="fa fa-exclamation-circle" style={{ marginRight: '8px' }}></i>
                      {error}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                    <button type="submit" className="primary-btn" disabled={submitting} style={{ flex: 1 }}>
                      {submitting ? (
                        <>
                          <i className="fa fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="fa fa-check-circle" style={{ marginRight: '8px' }}></i>
                          Confirm Booking
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="secondary-btn"
                      style={{ flex: 1 }}
                    >
                      <i className="fa fa-times" style={{ marginRight: '8px' }}></i>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Booking Summary Sidebar */}
            <div className="col-lg-4">
              <div style={{
                background: '#ffffff',
                boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
                padding: '30px',
                position: 'sticky',
                top: '110px'
              }}>
                <h4 style={{ marginBottom: '25px', paddingBottom: '15px', borderBottom: '2px solid #dfa974' }}>
                  Booking Summary
                </h4>

                {/* Hall Image */}
                <div style={{ marginBottom: '20px', overflow: 'hidden' }}>
                  <img
                    src={imageUrl}
                    alt={hall.name}
                    style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                  />
                </div>

                {/* Hall Info */}
                <h5 style={{ fontSize: '20px', marginBottom: '15px', color: '#19191a' }}>{hall.name}</h5>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
                    <span style={{ color: '#707079', fontSize: '14px' }}>
                      <i className="fa fa-map-marker-alt" style={{ color: '#dfa974', marginRight: '5px' }}></i>
                      Location
                    </span>
                    <span style={{ fontWeight: '600', fontSize: '14px', color: '#19191a' }}>{hall.location}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
                    <span style={{ color: '#707079', fontSize: '14px' }}>
                      <i className="fa fa-users" style={{ color: '#dfa974', marginRight: '5px' }}></i>
                      Capacity
                    </span>
                    <span style={{ fontWeight: '600', fontSize: '14px', color: '#19191a' }}>{hall.capacity} Guests</span>
                  </div>

                  {hall.pricePerHour && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
                        <span style={{ color: '#707079', fontSize: '14px' }}>Price per Hour</span>
                        <span style={{ fontWeight: '600', fontSize: '14px', color: '#19191a' }}>₹{parseFloat(hall.pricePerHour).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>

                      {calculateHours() > 0 && (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
                            <span style={{ color: '#707079', fontSize: '14px' }}>Duration</span>
                            <span style={{ fontWeight: '600', fontSize: '14px', color: '#19191a' }}>
                              {calculateHours()} {calculateHours() === 1 ? 'hour' : 'hours'}
                            </span>
                          </div>

                          <div style={{
                            background: '#f9f9f9',
                            padding: '20px',
                            marginTop: '20px',
                            borderLeft: '3px solid #dfa974'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '16px', fontWeight: '600', color: '#19191a' }}>Estimated Total</span>
                              <span style={{ fontSize: '28px', fontWeight: '700', color: '#dfa974', fontFamily: 'Lora, serif' }}>
                                ₹{calculateTotal()}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>

                <div style={{
                  background: '#f0f8ff',
                  padding: '15px',
                  borderLeft: '3px solid #1e90ff',
                  fontSize: '13px',
                  color: '#707079',
                  marginTop: '20px'
                }}>
                  <i className="fa fa-info-circle" style={{ color: '#1e90ff', marginRight: '5px' }}></i>
                  Your booking will be confirmed instantly upon submission
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BookingPage;
