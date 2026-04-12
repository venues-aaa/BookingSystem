import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../datepicker-custom.css';
import { getHallById } from '../services/hallService';
import { createBooking } from '../services/bookingService';

const BookingPage = () => {
  const { hallId } = useParams();
  const navigate = useNavigate();
  const [hall, setHall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    bookingDate: '',
    slotType: 'fullday', // fullday, morning, evening
    startDateTime: '',
    endDateTime: '',
    purpose: '',
    numberOfAttendees: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [availabilityChecking, setAvailabilityChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [suggestedSlots, setSuggestedSlots] = useState([]);

  useEffect(() => {
    fetchHallDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hallId]);

  const fetchHallDetails = async () => {
    try {
      const data = await getHallById(hallId);
      setHall(data);

      // Auto-select the first available slot type
      const availableSlotTypes = data.availableSlotTypes || { fullday: true, morning: true, evening: true };
      let defaultSlot = 'fullday';

      if (availableSlotTypes.fullday !== false) {
        defaultSlot = 'fullday';
      } else if (availableSlotTypes.morning !== false) {
        defaultSlot = 'morning';
      } else if (availableSlotTypes.evening !== false) {
        defaultSlot = 'evening';
      }

      setFormData(prev => ({ ...prev, slotType: defaultSlot }));
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

  const calculateSlotTimes = (date, slotType) => {
    if (!date) return { start: null, end: null };

    // Parse date manually to avoid timezone shift
    const [year, month, day] = date.split('-').map(Number);
    let startTime, endTime;

    switch (slotType) {
      case 'fullday':
        startTime = new Date(year, month - 1, day, 0, 0, 0, 0);
        endTime = new Date(year, month - 1, day, 23, 59, 59, 999);
        break;
      case 'morning':
        startTime = new Date(year, month - 1, day, 0, 0, 0, 0);
        endTime = new Date(year, month - 1, day, 16, 0, 0, 0); // 4:00 PM
        break;
      case 'evening':
        startTime = new Date(year, month - 1, day, 17, 0, 0, 0); // 5:00 PM
        endTime = new Date(year, month - 1, day, 22, 0, 0, 0); // 10:00 PM
        break;
      default:
        return { start: null, end: null };
    }

    return { start: startTime, end: endTime };
  };

  const formatLocalDateTime = (date) => {
    if (!date) return null;
    const d = date instanceof Date ? date : new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const checkAvailability = async (date, slotType) => {
    if (!date || !slotType) return;

    setAvailabilityChecking(true);
    setError('');
    setSuggestedSlots([]);

    try {
      const { start, end } = calculateSlotTimes(date, slotType);
      if (!start || !end) return;

      const response = await fetch(`http://localhost:8080/bookings/check-availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({
          itemId: hallId,
          bookingDate: date,
          slotType: slotType,
          startDateTime: formatLocalDateTime(start),
          endDateTime: formatLocalDateTime(end),
        }),
      });

      const data = await response.json();

      console.log('Availability check response:', {
        requestedDate: date,
        available: data.available,
        suggestedSlots: data.suggestedSlots,
        suggestedDates: data.suggestedSlots?.map(s => s.date) || []
      });

      setIsAvailable(data.available);
      if (!data.available && data.suggestedSlots) {
        // Filter out the requested date from suggestions (extra safety check)
        const filteredSlots = data.suggestedSlots.filter(slot => slot.date !== date);
        console.log('After filtering requested date:', filteredSlots.map(s => s.date));
        setSuggestedSlots(filteredSlots);
      }

      // Update form with calculated times
      setFormData(prev => ({
        ...prev,
        startDateTime: start,
        endDateTime: end,
      }));

    } catch (err) {
      console.error('Availability check failed:', err);
      setError('Failed to check availability');
    } finally {
      setAvailabilityChecking(false);
    }
  };

  const handleDateSlotChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Auto-check availability when both date and slot are selected
    if (field === 'bookingDate' || field === 'slotType') {
      const dateToCheck = field === 'bookingDate' ? value : newFormData.bookingDate;
      const slotToCheck = field === 'slotType' ? value : newFormData.slotType;

      if (dateToCheck && slotToCheck) {
        checkAvailability(dateToCheck, slotToCheck);
      }
    }
  };

  const selectSuggestedSlot = (slot) => {
    setFormData(prev => ({
      ...prev,
      bookingDate: slot.date,
    }));
    checkAvailability(slot.date, formData.slotType);
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
      // Get user ID from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const bookingData = {
        itemId: hallId, // Backend expects itemId (String), not hallId
        startDateTime: formatLocalDateTime(formData.startDateTime),
        endDateTime: formatLocalDateTime(formData.endDateTime),
        functionType: formData.purpose, // Backend calls it functionType, not purpose
        numberOfAttendees: formData.numberOfAttendees ? parseInt(formData.numberOfAttendees) : null,
        userId: user.id, // Add userId from logged-in user
      };

      await createBooking(bookingData);
      alert('Booking created successfully!');
      navigate('/my-bookings');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to create booking. Please try again.');
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
        background: 'linear-gradient(135deg, #dfa974 0%, #c89860 100%)',
        padding: '60px 0 30px',
        marginTop: '130px',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(223, 169, 116, 0.3)'
      }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div style={{ marginBottom: '10px', color: '#ffffff', fontSize: '14px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Book Your Hall
              </div>
              <h2 style={{
                fontFamily: "'Lora', serif",
                fontSize: '52px',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '15px',
                textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
              }}>
                {hall.name}
              </h2>
              {/* Breadcrumb */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '15px', fontFamily: "'Cabin', sans-serif" }}>
                <Link to="/" style={{ color: '#ffffff', fontSize: '16px', fontWeight: '500', textDecoration: 'none', opacity: 0.9 }}>Home</Link>
                <i className="fa fa-angle-right" style={{ color: '#ffffff', opacity: 0.7 }}></i>
                <Link to={`/halls/${hallId}`} style={{ color: '#ffffff', textDecoration: 'none', opacity: 0.9 }}>{hall.name}</Link>
                <i className="fa fa-angle-right" style={{ color: '#ffffff', opacity: 0.7 }}></i>
                <span style={{ color: '#ffffff', fontWeight: '600' }}>Booking</span>
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
                  {/* Date Selection */}
                  <div className="form-group">
                    <label>Select Date <span style={{ color: '#dfa974' }}>*</span></label>
                    <input
                      type="date"
                      name="bookingDate"
                      className="form-control"
                      value={formData.bookingDate}
                      onChange={(e) => handleDateSlotChange('bookingDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  {/* Slot Type Selection */}
                  <div className="form-group">
                    <label>Select Time Slot <span style={{ color: '#dfa974' }}>*</span></label>
                    <small style={{ display: 'block', marginBottom: '10px', color: '#707079' }}>
                      <i className="fa fa-info-circle" style={{ marginRight: '5px' }}></i>
                      Available booking options for {hall.name}
                    </small>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                      {(!hall?.availableSlotTypes || hall?.availableSlotTypes?.fullday !== false) && (
                        <div
                          onClick={() => handleDateSlotChange('slotType', 'fullday')}
                          style={{
                            padding: '20px',
                            border: `2px solid ${formData.slotType === 'fullday' ? '#dfa974' : '#e5e5e5'}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            textAlign: 'center',
                            background: formData.slotType === 'fullday' ? '#fff8f0' : '#ffffff',
                            transition: 'all 0.3s'
                          }}
                        >
                          <i className="fa fa-sun" style={{ fontSize: '24px', color: '#dfa974', marginBottom: '10px', display: 'block' }}></i>
                          <strong style={{ display: 'block', marginBottom: '5px' }}>Full Day</strong>
                          <small style={{ color: '#707079' }}>All Day</small>
                        </div>
                      )}
                      {(!hall?.availableSlotTypes || hall?.availableSlotTypes?.morning !== false) && (
                        <div
                          onClick={() => handleDateSlotChange('slotType', 'morning')}
                          style={{
                            padding: '20px',
                            border: `2px solid ${formData.slotType === 'morning' ? '#dfa974' : '#e5e5e5'}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            textAlign: 'center',
                            background: formData.slotType === 'morning' ? '#fff8f0' : '#ffffff',
                            transition: 'all 0.3s'
                          }}
                        >
                          <i className="fa fa-cloud-sun" style={{ fontSize: '24px', color: '#dfa974', marginBottom: '10px', display: 'block' }}></i>
                          <strong style={{ display: 'block', marginBottom: '5px' }}>Morning</strong>
                          <small style={{ color: '#707079' }}>Until 4:00 PM</small>
                        </div>
                      )}
                      {(!hall?.availableSlotTypes || hall?.availableSlotTypes?.evening !== false) && (
                        <div
                          onClick={() => handleDateSlotChange('slotType', 'evening')}
                          style={{
                            padding: '20px',
                            border: `2px solid ${formData.slotType === 'evening' ? '#dfa974' : '#e5e5e5'}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            textAlign: 'center',
                            background: formData.slotType === 'evening' ? '#fff8f0' : '#ffffff',
                            transition: 'all 0.3s'
                          }}
                        >
                          <i className="fa fa-moon" style={{ fontSize: '24px', color: '#dfa974', marginBottom: '10px', display: 'block' }}></i>
                          <strong style={{ display: 'block', marginBottom: '5px' }}>Evening</strong>
                          <small style={{ color: '#707079' }}>5:00 PM - 10:00 PM</small>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Availability Status */}
                  {availabilityChecking && (
                    <div style={{ padding: '15px', background: '#f0f8ff', border: '1px solid #1e90ff', borderRadius: '4px', marginBottom: '20px' }}>
                      <i className="fa fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                      Checking availability...
                    </div>
                  )}

                  {isAvailable === true && (
                    <div style={{ padding: '15px', background: '#d4edda', border: '1px solid #28a745', borderRadius: '4px', marginBottom: '20px' }}>
                      <i className="fa fa-check-circle" style={{ marginRight: '8px', color: '#155724' }}></i>
                      <strong style={{ color: '#155724' }}>Great! This slot is available</strong>
                    </div>
                  )}

                  {isAvailable === false && (
                    <div style={{ padding: '20px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', marginBottom: '20px' }}>
                      <h5 style={{ color: '#856404', marginBottom: '15px' }}>
                        <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
                        This slot is not available
                      </h5>
                      {suggestedSlots.length > 0 && (
                        <>
                          <p style={{ color: '#856404', marginBottom: '10px' }}>Here are some available alternatives:</p>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
                            {suggestedSlots.map((slot, index) => {
                              // Parse date correctly without timezone shift
                              const [year, month, day] = slot.date.split('-');
                              const dateObj = new Date(year, month - 1, day);

                              return (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => selectSuggestedSlot(slot)}
                                  style={{
                                    padding: '12px',
                                    background: '#ffffff',
                                    border: '2px solid #dfa974',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#19191a',
                                    transition: 'all 0.3s'
                                  }}
                                  onMouseEnter={(e) => e.target.style.background = '#fff8f0'}
                                  onMouseLeave={(e) => e.target.style.background = '#ffffff'}
                                >
                                  {dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  )}

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
