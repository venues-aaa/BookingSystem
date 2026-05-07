import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCategoryById } from '../services/categoryService';
import { createBooking } from '../services/bookingService';
import api from '../services/api';
import DynamicForm from '../components/formBuilder/DynamicForm';
import './GenericBookingPage.css';

/**
 * GenericBookingPage - Schema-driven booking page for ALL categories
 *
 * This page works for any category (Hall, Catering, Decoration, etc.)
 * by rendering a dynamic form based on the category's bookingFormSchema.
 *
 * If no bookingFormSchema exists, shows default booking fields.
 *
 * URL: /booking/:itemId
 */
const GenericBookingPage = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form data - starts with default fields, extended by schema
  const [formData, setFormData] = useState({
    bookingDate: '',
    numberOfAttendees: '',
    eventType: '',
    eventStartTime: '', // For catering/services with custom timing
    eventEndTime: '',   // For catering/services with custom timing
    specialRequirements: '',
    // Dynamic fields from bookingFormSchema will be added here
  });

  useEffect(() => {
    loadItemAndCategory();
  }, [itemId]);

  const loadItemAndCategory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch item details
      const itemResponse = await api.get(`/item/${itemId}`);
      const itemData = itemResponse.data.data;
      setItem(itemData);

      // Fetch category details (to get bookingFormSchema)
      const categoryData = await getCategoryById(itemData.categoryId);
      setCategory(categoryData);

      setLoading(false);
    } catch (err) {
      console.error('Failed to load item:', err);
      setError('Failed to load item details. Please try again.');
      setLoading(false);
    }
  };

  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);

      // Get user from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (!user.id) {
        setError('Please login to make a booking');
        setSubmitting(false);
        return;
      }

      // Prepare booking data
      // Backend expects startDateTime and endDateTime in LocalDateTime format

      let startTime, endTime;

      // Check if customer provided custom event timing (for catering/services)
      if (formData.eventStartTime && formData.eventEndTime) {
        // Use customer's custom times
        startTime = formData.eventStartTime + ':00'; // Add seconds
        endTime = formData.eventEndTime + ':00';
      } else {
        // Use time slot selection (for halls)
        const timeSlot = formData.timeSlot || formData.selectedTimeSlot || 'Full Day';

        switch (timeSlot) {
          case 'Full Day':
            startTime = '07:00:00'; // 7 AM
            endTime = '22:00:00';   // 10 PM
            break;
          case 'Morning':
            startTime = '07:00:00'; // 7 AM
            endTime = '16:00:00';   // 4 PM
            break;
          case 'Evening':
            startTime = '17:00:00'; // 5 PM
            endTime = '22:00:00';   // 10 PM
            break;
          default:
            startTime = '07:00:00'; // Default to Full Day
            endTime = '22:00:00';
        }
      }

      const startDateTime = `${formData.bookingDate}T${startTime}`;
      const endDateTime = `${formData.bookingDate}T${endTime}`;

      const bookingData = {
        itemId: item.id,
        userId: user.id,
        startDateTime: startDateTime,
        endDateTime: endDateTime,
        numberOfAttendees: parseInt(formData.numberOfAttendees) || 0,
        functionType: formData.eventType, // Backend expects 'functionType' not 'eventType'
        // Include all dynamic form data in details
        details: {
          categoryId: category.id,
          categoryName: category.name,
          itemName: getItemName(item),
          bookingDate: formData.bookingDate, // Keep for reference
          specialRequirements: formData.specialRequirements,
          ...formData // All form fields
        },
        status: 'PENDING'
      };

      // Create booking
      await createBooking(bookingData);

      // Show success message
      alert('Booking created successfully! We will contact you soon.');

      // Navigate to my bookings
      navigate('/my-bookings');

    } catch (err) {
      console.error('Failed to create booking:', err);
      setError(err.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to extract item name from dynamicData
  const getItemName = (item) => {
    if (!item) return 'Item';

    return item.dynamicData?.restaurant_name ||
           item.dynamicData?.name ||
           item.dynamicData?.field_hall_name ||
           item.details?.name ||
           'Item';
  };

  if (loading) {
    return (
      <div className="generic-booking-page">
        <div className="container">
          <div className="loading-state">
            <div className="spinner-border text-gold"></div>
            <p>Loading booking form...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="generic-booking-page">
        <div className="container">
          <div className="error-state">
            <i className="fas fa-exclamation-triangle"></i>
            <h3>Error</h3>
            <p>{error}</p>
            <button onClick={() => navigate(-1)} className="primary-btn">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!item || !category) {
    return (
      <div className="generic-booking-page">
        <div className="container">
          <div className="error-state">
            <i className="fas fa-question-circle"></i>
            <h3>Item Not Found</h3>
            <p>The item you're trying to book doesn't exist.</p>
            <button onClick={() => navigate('/')} className="primary-btn">
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if category has a custom booking form schema
  const hasCustomSchema = category.bookingFormSchema &&
                          category.bookingFormSchema.fields &&
                          category.bookingFormSchema.fields.length > 0;

  return (
    <div className="generic-booking-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <div className="breadcrumb">
            <a href="/">Home</a>
            <span> / </span>
            <a href={`/category/${category.id}/items`}>{category.displayName}</a>
            <span> / </span>
            <span>Book {getItemName(item)}</span>
          </div>
          <h1>Book {getItemName(item)}</h1>
          <p className="category-badge">
            <span className="category-icon">{category.icon}</span>
            {category.displayName}
          </p>
        </div>

        <div className="booking-content">
          {/* Item Summary */}
          <div className="item-summary">
            <h3>Booking Summary</h3>
            <div className="summary-details">
              <div className="summary-row">
                <span className="label">Service:</span>
                <span className="value">{category.displayName}</span>
              </div>
              <div className="summary-row">
                <span className="label">Provider:</span>
                <span className="value">{getItemName(item)}</span>
              </div>
              {item.dynamicData?.description && (
                <div className="summary-row">
                  <span className="label">Description:</span>
                  <span className="value">{item.dynamicData.description}</span>
                </div>
              )}
            </div>
          </div>

          {/* Booking Form */}
          <div className="booking-form-section">
            <h3>Booking Details</h3>

            <form onSubmit={handleSubmit} className="booking-form">
              {/* Default booking fields (always shown) */}
              <div className="default-fields">
                <div className="form-group">
                  <label htmlFor="bookingDate">
                    Event Date <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    id="bookingDate"
                    value={formData.bookingDate}
                    onChange={(e) => handleInputChange('bookingDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="numberOfAttendees">
                    Number of Attendees <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="numberOfAttendees"
                    value={formData.numberOfAttendees}
                    onChange={(e) => handleInputChange('numberOfAttendees', e.target.value)}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="eventType">
                    Event Type <span className="required">*</span>
                  </label>
                  <select
                    id="eventType"
                    value={formData.eventType}
                    onChange={(e) => handleInputChange('eventType', e.target.value)}
                    required
                  >
                    <option value="">Select event type</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Birthday Party">Birthday Party</option>
                    <option value="Corporate Event">Corporate Event</option>
                    <option value="Conference">Conference</option>
                    <option value="Reception">Reception</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Custom fields from bookingFormSchema */}
              {hasCustomSchema && (
                <div className="custom-fields">
                  <h4>Additional Requirements</h4>
                  <DynamicForm
                    schema={category.bookingFormSchema}
                    data={formData}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {/* Special Requirements */}
              <div className="form-group full-width">
                <label htmlFor="specialRequirements">
                  Special Requirements / Notes
                </label>
                <textarea
                  id="specialRequirements"
                  value={formData.specialRequirements}
                  onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                  rows="4"
                  placeholder="Any special requirements or notes for your booking..."
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="error-message">
                  <i className="fas fa-exclamation-circle"></i>
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm mr-2"></span>
                      Creating Booking...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check-circle"></i>
                      Confirm Booking
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenericBookingPage;
