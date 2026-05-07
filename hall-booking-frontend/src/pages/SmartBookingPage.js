import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCategoryById } from '../services/categoryService';
import { createBooking } from '../services/bookingService';
import { getItemImage } from '../utils/imageUtils';
import MultiSelectDropdown from '../components/common/MultiSelectDropdown';
import api from '../services/api';
import './SmartBookingPage.css';

/**
 * SmartBookingPage - Schema-driven booking that reads vendor's item data
 *
 * This page analyzes what the vendor offers (from dynamicData) and
 * creates a booking form where users can select from those offerings.
 *
 * Examples:
 * - Catering: Select menu items + quantities
 * - Hall: Select time slot + amenities
 * - Decoration: Select theme + color scheme
 *
 * Completely schema-driven - works for ANY category!
 */
const SmartBookingPage = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Booking form data
  const [bookingData, setBookingData] = useState({
    bookingDate: '',
    numberOfAttendees: '',
    eventType: '',
    eventStartTime: '', // For catering/services with custom timing
    eventEndTime: '',   // For catering/services with custom timing
    // Dynamic selections based on item's offerings
    selections: {},
    // Payment workflow
    paymentOption: 'BLOCK_DATE_PARTIAL' // Default to block date
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

      // Fetch category details
      const categoryData = await getCategoryById(itemData.categoryId);
      setCategory(categoryData);

      setLoading(false);
    } catch (err) {
      console.error('Failed to load item:', err);
      setError('Failed to load item details. Please try again.');
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectionChange = (key, value) => {
    setBookingData(prev => ({
      ...prev,
      selections: {
        ...prev.selections,
        [key]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) {
        setError('Please login to make a booking');
        setSubmitting(false);
        return;
      }

      // Prepare booking payload
      // Backend expects startDateTime and endDateTime in LocalDateTime format

      let startTime, endTime;

      // Check if customer provided custom event timing (for catering/services)
      if (bookingData.eventStartTime && bookingData.eventEndTime) {
        // Use customer's custom times
        startTime = bookingData.eventStartTime + ':00'; // Add seconds
        endTime = bookingData.eventEndTime + ':00';
      } else {
        // Use time slot selection (for halls)
        const timeSlot = bookingData.selections.timeSlot || 'Full Day';

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

      const startDateTime = `${bookingData.bookingDate}T${startTime}`;
      const endDateTime = `${bookingData.bookingDate}T${endTime}`;

      const payload = {
        itemId: item.id,
        userId: user.id,
        startDateTime: startDateTime,
        endDateTime: endDateTime,
        numberOfAttendees: parseInt(bookingData.numberOfAttendees) || 0,
        functionType: bookingData.eventType, // Backend expects 'functionType' not 'eventType'
        paymentOption: bookingData.paymentOption, // Payment workflow
        details: {
          categoryId: category.id,
          categoryName: category.name,
          itemName: getItemName(item),
          vendorId: item.vendorId,
          bookingDate: bookingData.bookingDate, // Keep for reference
          // All user selections
          ...bookingData.selections
        },
        status: 'PENDING'
      };

      await createBooking(payload);
      alert('Booking request submitted successfully! The vendor will contact you soon.');
      navigate('/my-bookings');

    } catch (err) {
      console.error('Failed to create booking:', err);
      setError(err.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getItemName = (item) => {
    return item?.dynamicData?.restaurant_name ||
           item?.dynamicData?.name ||
           item?.dynamicData?.field_hall_name ||
           item?.details?.name ||
           'Service';
  };

  // Render booking form based on item's offerings
  const renderBookingOptions = () => {
    if (!item || !item.dynamicData) return null;

    const dynamicData = item.dynamicData;
    const options = [];

    // Check for event timing FIRST (Catering/Services) - appears right after description
    // Vendor specifies available hours, customer selects within those hours
    if (dynamicData.event_timing || dynamicData.field_catering_event_timing) {
      options.push(renderEventTimingInput());
    }

    // Check for time slots (Hall) - Check multiple field patterns
    if (dynamicData.field_hall_available_slots ||
        dynamicData.available_slots ||
        dynamicData.availableSlotTypes ||
        item.details?.availableSlotTypes) {
      options.push(renderTimeSlotSelection());
    }

    // Check for menu items (Catering)
    if (dynamicData.menu_items && Array.isArray(dynamicData.menu_items)) {
      options.push(renderMenuItemsSelection(dynamicData.menu_items));
    }

    // Check for food types (Catering)
    if (dynamicData.food_type && Array.isArray(dynamicData.food_type)) {
      options.push(renderFoodTypeSelection(dynamicData.food_type));
    }

    // Check for special services
    if (dynamicData.special_services && Array.isArray(dynamicData.special_services)) {
      options.push(renderSpecialServicesSelection(dynamicData.special_services));
    }

    // Check for amenities (Hall)
    if (dynamicData.amenities || (item.details?.amenities && Object.keys(item.details.amenities).length > 0)) {
      options.push(renderAmenitiesSelection());
    }

    return options;
  };

  const renderMenuItemsSelection = (menuItems) => {
    const selectedItems = bookingData.selections.selectedMenuItems || [];

    return (
      <div key="menu-items" className="booking-section">
        <h3>📋 Select Menu Items</h3>
        <p className="section-description">
          Choose the dishes you'd like for your event. Specify quantity for each item.
        </p>
        <div className="menu-items-grid">
          {menuItems.map((item, index) => {
            const isSelected = selectedItems.some(si => si.name === item.menu_item_name);
            const selectedItem = selectedItems.find(si => si.name === item.menu_item_name);
            const quantity = selectedItem?.quantity || 0;

            return (
              <div key={index} className={`menu-item-card ${isSelected ? 'selected' : ''}`}>
                <div className="menu-item-header">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        let newSelectedItems = [...selectedItems];
                        if (e.target.checked) {
                          newSelectedItems.push({
                            name: item.menu_item_name,
                            category: item.menu_category,
                            type: item.food_type_item,
                            pricePerPerson: item.price_per_person,
                            quantity: 1
                          });
                        } else {
                          newSelectedItems = newSelectedItems.filter(si => si.name !== item.menu_item_name);
                        }
                        handleSelectionChange('selectedMenuItems', newSelectedItems);
                      }}
                    />
                    <span className="checkmark"></span>
                  </label>
                  <div className="menu-item-info">
                    <h4>{item.menu_item_name}</h4>
                    <span className={`food-type-badge ${item.food_type_item?.toLowerCase()}`}>
                      {item.food_type_item}
                    </span>
                  </div>
                </div>
                <div className="menu-item-details">
                  <p className="category">{item.menu_category}</p>
                  {item.item_description && (
                    <p className="description">{item.item_description}</p>
                  )}
                  <p className="price">₹{item.price_per_person} per person</p>
                </div>
                {isSelected && (
                  <div className="quantity-selector">
                    <label>Quantity (servings):</label>
                    <div className="quantity-controls">
                      <button
                        type="button"
                        onClick={() => {
                          const newItems = selectedItems.map(si =>
                            si.name === item.menu_item_name
                              ? { ...si, quantity: Math.max(1, si.quantity - 1) }
                              : si
                          );
                          handleSelectionChange('selectedMenuItems', newItems);
                        }}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => {
                          const newItems = selectedItems.map(si =>
                            si.name === item.menu_item_name
                              ? { ...si, quantity: parseInt(e.target.value) || 1 }
                              : si
                          );
                          handleSelectionChange('selectedMenuItems', newItems);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newItems = selectedItems.map(si =>
                            si.name === item.menu_item_name
                              ? { ...si, quantity: si.quantity + 1 }
                              : si
                          );
                          handleSelectionChange('selectedMenuItems', newItems);
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderFoodTypeSelection = (foodTypes) => {
    return (
      <div key="food-type" className="booking-section">
        <h3>🍽️ Food Type Preference</h3>
        <p className="section-description">Select your preferred food type</p>
        <div className="options-grid">
          {foodTypes.map((type, index) => (
            <label key={index} className="option-card">
              <input
                type="radio"
                name="foodTypePreference"
                value={type}
                checked={bookingData.selections.foodTypePreference === type}
                onChange={(e) => handleSelectionChange('foodTypePreference', e.target.value)}
              />
              <span className="option-label">{type}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const renderSpecialServicesSelection = (services) => {
    const selectedServices = bookingData.selections.additionalServices || [];

    return (
      <div key="special-services" className="booking-section">
        <h3>✨ Additional Services</h3>
        <p className="section-description">Select any additional services you need</p>
        <div className="options-grid">
          {services.map((service, index) => (
            <label key={index} className="option-card">
              <input
                type="checkbox"
                value={service}
                checked={selectedServices.includes(service)}
                onChange={(e) => {
                  const newServices = e.target.checked
                    ? [...selectedServices, service]
                    : selectedServices.filter(s => s !== service);
                  handleSelectionChange('additionalServices', newServices);
                }}
              />
              <span className="option-label">{service}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const renderTimeSlotSelection = () => {
    // Get available slots from vendor's item data (schema-driven)
    const dynamicData = item?.dynamicData || {};
    const details = item?.details || {};

    // Check multiple field patterns for available slots
    let availableSlots = [];

    // Pattern 1: dynamicData.field_hall_available_slots (array)
    if (dynamicData.field_hall_available_slots && Array.isArray(dynamicData.field_hall_available_slots)) {
      availableSlots = dynamicData.field_hall_available_slots;
    }
    // Pattern 2: dynamicData.available_slots (array)
    else if (dynamicData.available_slots && Array.isArray(dynamicData.available_slots)) {
      availableSlots = dynamicData.available_slots;
    }
    // Pattern 3: details.availableSlotTypes (object with boolean values)
    else if (details.availableSlotTypes) {
      const slotTypes = details.availableSlotTypes;
      availableSlots = [];
      if (slotTypes.fullday) availableSlots.push('Full Day');
      if (slotTypes.morning) availableSlots.push('Morning');
      if (slotTypes.evening) availableSlots.push('Evening');
    }
    // Fallback: Default slots
    else {
      availableSlots = ['Full Day', 'Morning', 'Evening'];
    }

    // If no slots available, don't render this section
    if (availableSlots.length === 0) {
      return null;
    }

    return (
      <div key="time-slot" className="booking-section">
        <h3>⏰ Available Time Slots</h3>
        <p className="section-description">
          Select your preferred time slot ({availableSlots.length} option{availableSlots.length !== 1 ? 's' : ''} available)
        </p>
        <div className="options-grid">
          {availableSlots.map((slot) => (
            <label key={slot} className="option-card">
              <input
                type="radio"
                name="timeSlot"
                value={slot}
                checked={bookingData.selections.timeSlot === slot}
                onChange={(e) => handleSelectionChange('timeSlot', e.target.value)}
                required
              />
              <span className="option-label">{slot}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const renderAmenitiesSelection = () => {
    const amenities = item.dynamicData?.amenities ||
                     Object.values(item.details?.amenities || {}).filter(Boolean);

    if (!amenities || amenities.length === 0) return null;

    return (
      <div key="amenities" className="booking-section">
        <h3>🎯 Available Amenities</h3>
        <div className="amenities-list">
          {amenities.map((amenity, index) => (
            <span key={index} className="amenity-badge">
              ✓ {amenity}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderEventTimingInput = () => {
    // Get vendor's available hours from dynamicData
    const dynamicData = item?.dynamicData || {};

    // Check multiple field patterns for available hours
    const availableStartTime = dynamicData.event_timing_start ||
                               dynamicData.field_catering_event_timing_start ||
                               dynamicData.available_start_time ||
                               '06:00'; // Default: 6 AM

    const availableEndTime = dynamicData.event_timing_end ||
                            dynamicData.field_catering_event_timing_end ||
                            dynamicData.available_end_time ||
                            '23:00'; // Default: 11 PM

    return (
      <div key="event-timing" className="booking-section">
        <h3>⏰ Event Timing</h3>
        <p className="section-description">
          Please specify your event start and end times
          <br />
          <small style={{ color: '#707079', fontSize: '13px' }}>
            Available hours: {formatTime(availableStartTime)} - {formatTime(availableEndTime)}
          </small>
        </p>
        <div className="basic-fields">
          <div className="form-group">
            <label htmlFor="eventStartTime">
              Event Start Time <span className="required">*</span>
            </label>
            <input
              type="time"
              id="eventStartTime"
              value={bookingData.eventStartTime}
              onChange={(e) => handleInputChange('eventStartTime', e.target.value)}
              min={availableStartTime}
              max={availableEndTime}
              required
            />
            <small style={{ color: '#707079', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              Select between {formatTime(availableStartTime)} - {formatTime(availableEndTime)}
            </small>
          </div>
          <div className="form-group">
            <label htmlFor="eventEndTime">
              Event End Time <span className="required">*</span>
            </label>
            <input
              type="time"
              id="eventEndTime"
              value={bookingData.eventEndTime}
              onChange={(e) => handleInputChange('eventEndTime', e.target.value)}
              min={bookingData.eventStartTime || availableStartTime}
              max={availableEndTime}
              required
            />
            <small style={{ color: '#707079', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              Must be after start time and before {formatTime(availableEndTime)}
            </small>
          </div>
        </div>
      </div>
    );
  };

  // Helper function to format time for display
  const formatTime = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Extract payment terms from vendor's item data
  const getVendorPaymentTerms = () => {
    if (!item || !item.dynamicData) return null;

    // Check for payment terms field
    const paymentTerms = item.dynamicData.payment_terms || item.dynamicData.field_payment_terms;
    return paymentTerms;
  };

  // Calculate booking amount based on item price and attendees
  const calculateBookingAmount = () => {
    let basePrice = 0;

    // Try to get price from item
    if (item?.price?.baseRate) {
      basePrice = item.price.baseRate;
    } else if (item?.dynamicData) {
      const priceField = item.dynamicData.price ||
                        item.dynamicData.price_per_person ||
                        item.dynamicData.field_hall_price ||
                        item.dynamicData.field_price;
      if (priceField) {
        basePrice = parseFloat(priceField) || 0;
      }
    }

    const attendees = parseInt(bookingData.numberOfAttendees) || 1;
    return basePrice * attendees;
  };

  // Extract partial payment percentage from vendor's payment terms
  const getPartialPaymentPercentage = () => {
    const paymentTerms = getVendorPaymentTerms();
    if (!paymentTerms || !paymentTerms.selectedOption) {
      return 30; // Default to 30%
    }

    const selectedOption = paymentTerms.selectedOption;

    // Parse percentage from options like "30% Advance + 70% on Event"
    if (selectedOption.includes('%')) {
      const parts = selectedOption.split('%');
      if (parts.length > 0) {
        const percentage = parseInt(parts[0].trim());
        if (!isNaN(percentage)) {
          return percentage;
        }
      }
    }

    return 30; // Default fallback
  };

  // Get dynamic submit button text based on payment option
  const getSubmitButtonText = () => {
    switch (bookingData.paymentOption) {
      case 'BLOCK_DATE_PARTIAL':
        return 'Pay to Block Date';
      case 'CONFIRM_FULL_PAYMENT':
        return 'Confirm Booking';
      case 'PAY_OFFLINE':
        return 'Request to Block Date';
      default:
        return 'Confirm Booking';
    }
  };

  // Render payment options section
  const renderPaymentOptions = () => {
    const vendorPaymentTerms = getVendorPaymentTerms();
    const totalAmount = calculateBookingAmount();
    const partialPercentage = getPartialPaymentPercentage();
    const partialAmount = (totalAmount * partialPercentage) / 100;

    return (
      <div className="booking-section payment-options-section">
        <h3>💳 Payment Options</h3>

        {/* Display vendor's payment terms */}
        {vendorPaymentTerms && vendorPaymentTerms.selectedOption && (
          <div className="vendor-payment-terms">
            <p className="terms-label">Vendor's Payment Terms:</p>
            <p className="terms-value">{vendorPaymentTerms.selectedOption}</p>
            {vendorPaymentTerms.selectedOption === 'Custom Terms' && vendorPaymentTerms.customTerms && (
              <p className="custom-terms">{vendorPaymentTerms.customTerms}</p>
            )}
          </div>
        )}

        {/* Payment amount display */}
        {totalAmount > 0 && (
          <div className="payment-amount-info">
            <p className="total-amount">Total Booking Amount: <strong>₹{totalAmount.toFixed(2)}</strong></p>
          </div>
        )}

        {/* Payment option dropdown */}
        <div className="basic-fields">
          <div className="form-group">
            <label htmlFor="paymentOption">
              Select Payment Option <span className="required">*</span>
            </label>
            <select
              id="paymentOption"
              value={bookingData.paymentOption}
              onChange={(e) => handleInputChange('paymentOption', e.target.value)}
              required
            >
              <option value="BLOCK_DATE_PARTIAL">
                Block Date ({partialPercentage}% advance - ₹{partialAmount.toFixed(2)})
              </option>
              <option value="CONFIRM_FULL_PAYMENT">
                Confirm Booking (Full payment - ₹{totalAmount.toFixed(2)})
              </option>
              <option value="PAY_OFFLINE">
                Pay Offline (Vendor confirmation required)
              </option>
            </select>
            <small className="help-text">
              {bookingData.paymentOption === 'BLOCK_DATE_PARTIAL' &&
                `Pay ${partialPercentage}% advance to block this date. Remaining amount to be paid later.`}
              {bookingData.paymentOption === 'CONFIRM_FULL_PAYMENT' &&
                'Pay full amount to confirm your booking immediately.'}
              {bookingData.paymentOption === 'PAY_OFFLINE' &&
                'Submit booking request. Vendor will confirm after receiving offline payment.'}
            </small>
          </div>
        </div>
      </div>
    );
  };

  // Render dynamic booking form fields from category's bookingFormSchema
  const renderBookingFormFields = () => {
    // Check if category has a custom booking form schema
    if (!category?.bookingFormSchema?.fields || category.bookingFormSchema.fields.length === 0) {
      // Fallback to default "Number of People" field
      return (
        <div className="form-group">
          <label>Number of People <span className="required">*</span></label>
          <input
            type="number"
            value={bookingData.numberOfAttendees}
            onChange={(e) => handleInputChange('numberOfAttendees', e.target.value)}
            min="1"
            placeholder="How many people?"
            required
          />
        </div>
      );
    }

    // Render fields from booking form schema, sorted by grid position
    const fields = category.bookingFormSchema.fields.sort((a, b) => {
      // Sort by row (y) first
      const aY = a.position?.y ?? 999;
      const bY = b.position?.y ?? 999;
      if (aY !== bY) {
        return aY - bY;
      }

      // Then by column (x) if same row
      const aX = a.position?.x ?? 999;
      const bX = b.position?.x ?? 999;
      return aX - bX;
    });

    return fields.map((field, index) => {
      const fieldKey = field.id || field.label?.toLowerCase().replace(/\s+/g, '_');
      const fieldValue = bookingData.selections[fieldKey] || '';

      switch (field.type) {
        case 'text':
          return (
            <div key={index} className="form-group">
              <label>
                {field.label}
                {field.required && <span className="required">*</span>}
              </label>
              <input
                type="text"
                value={fieldValue}
                onChange={(e) => handleSelectionChange(fieldKey, e.target.value)}
                placeholder={field.placeholder || field.label}
                required={field.required}
              />
              {field.helpText && (
                <small style={{ color: '#707079', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  {field.helpText}
                </small>
              )}
            </div>
          );

        case 'number':
          return (
            <div key={index} className="form-group">
              <label>
                {field.label}
                {field.required && <span className="required">*</span>}
              </label>
              <input
                type="number"
                value={fieldValue}
                onChange={(e) => {
                  const value = e.target.value;
                  handleSelectionChange(fieldKey, value);
                  // Also update numberOfAttendees if this is a people/attendees field
                  if (field.label?.toLowerCase().includes('people') ||
                      field.label?.toLowerCase().includes('attendees') ||
                      field.label?.toLowerCase().includes('guests')) {
                    handleInputChange('numberOfAttendees', value);
                  }
                }}
                min={field.min || 1}
                max={field.max}
                placeholder={field.placeholder || field.label}
                required={field.required}
              />
              {field.helpText && (
                <small style={{ color: '#707079', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  {field.helpText}
                </small>
              )}
            </div>
          );

        case 'select':
          return (
            <div key={index} className="form-group">
              <label>
                {field.label}
                {field.required && <span className="required">*</span>}
              </label>
              <select
                value={fieldValue}
                onChange={(e) => handleSelectionChange(fieldKey, e.target.value)}
                required={field.required}
              >
                <option value="">Select {field.label}</option>
                {field.options && field.options.map((option, optIndex) => (
                  <option key={optIndex} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {field.helpText && (
                <small style={{ color: '#707079', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  {field.helpText}
                </small>
              )}
            </div>
          );

        case 'radio':
          return (
            <div key={index} className="form-group">
              <label>
                {field.label}
                {field.required && <span className="required">*</span>}
              </label>
              <div className="options-grid" style={{ marginTop: '8px' }}>
                {field.options && field.options.map((option, optIndex) => (
                  <label key={optIndex} className="option-card">
                    <input
                      type="radio"
                      name={fieldKey}
                      value={option}
                      checked={fieldValue === option}
                      onChange={(e) => handleSelectionChange(fieldKey, e.target.value)}
                      required={field.required}
                    />
                    <span className="option-label">{option}</span>
                  </label>
                ))}
              </div>
              {field.helpText && (
                <small style={{ color: '#707079', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  {field.helpText}
                </small>
              )}
            </div>
          );

        case 'checkbox':
          return (
            <div key={index} className="form-group">
              <MultiSelectDropdown
                label={field.label}
                options={field.options || []}
                value={Array.isArray(fieldValue) ? fieldValue : []}
                onChange={(newValue) => handleSelectionChange(fieldKey, newValue)}
                placeholder={field.placeholder || `Select ${field.label}...`}
                required={field.required}
                helpText={field.helpText}
              />
            </div>
          );

        case 'textarea':
          return (
            <div key={index} className="form-group">
              <label>
                {field.label}
                {field.required && <span className="required">*</span>}
              </label>
              <textarea
                value={fieldValue}
                onChange={(e) => handleSelectionChange(fieldKey, e.target.value)}
                placeholder={field.placeholder || field.label}
                required={field.required}
                rows={field.rows || 3}
              />
              {field.helpText && (
                <small style={{ color: '#707079', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  {field.helpText}
                </small>
              )}
            </div>
          );

        default:
          return null;
      }
    });
  };

  if (loading) {
    return (
      <div className="smart-booking-page">
        <div className="container">
          <div className="loading-state">
            <div className="spinner-border"></div>
            <p>Loading booking options...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !item) {
    return (
      <div className="smart-booking-page">
        <div className="container">
          <div className="error-state">
            <i className="fas fa-exclamation-triangle"></i>
            <h3>Error</h3>
            <p>{error}</p>
            <button onClick={() => navigate(-1)} className="primary-btn">Go Back</button>
          </div>
        </div>
      </div>
    );
  }

  const itemImage = getItemImage(item);

  return (
    <div className="smart-booking-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div className="breadcrumb">
            <a href="/">Home</a>
            <span> / </span>
            <a href={`/category/${category?.id}/items`}>{category?.displayName}</a>
            <span> / </span>
            <span>Book Now</span>
          </div>
          <h1>Book {getItemName(item)}</h1>
          <p className="provider-info">
            <span className="category-icon">{category?.icon}</span>
            {category?.displayName}
          </p>
        </div>

        {/* Item Image */}
        <div style={{ marginBottom: '30px' }}>
          <img
            src={itemImage}
            alt={getItemName(item)}
            style={{
              width: '100%',
              maxHeight: '400px',
              objectFit: 'cover',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
            }}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80';
            }}
          />
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          {/* Basic Details */}
          <div className="booking-section">
            <h3>📅 Event Details</h3>
            <div className="basic-fields">
              <div className="form-group">
                <label>Event Date <span className="required">*</span></label>
                <input
                  type="date"
                  value={bookingData.bookingDate}
                  onChange={(e) => handleInputChange('bookingDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              {/* Dynamic booking fields from category's booking form schema */}
              {renderBookingFormFields()}

              <div className="form-group">
                <label>Event Type <span className="required">*</span></label>
                <select
                  value={bookingData.eventType}
                  onChange={(e) => handleInputChange('eventType', e.target.value)}
                  required
                >
                  <option value="">Select event type</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Birthday">Birthday Party</option>
                  <option value="Corporate">Corporate Event</option>
                  <option value="Conference">Conference</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dynamic Options based on item's offerings */}
          {renderBookingOptions()}

          {/* Payment Options */}
          {renderPaymentOptions()}

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="form-actions">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? 'Submitting...' : getSubmitButtonText()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SmartBookingPage;
