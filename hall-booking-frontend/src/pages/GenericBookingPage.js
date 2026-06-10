import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getCategoryById } from '../services/categoryService';
import { createBooking } from '../services/bookingService';
import { getValidCouponsForItem, validateCoupon } from '../services/couponService';
import blockedDateService from '../services/blockedDateService';
import { getItemDisplayName } from '../services/itemService';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import DynamicForm from '../components/formBuilder/DynamicForm';
import './GenericBookingPage.css';

/**
 * GenericBookingPage - Universal booking page with date range and price calculation
 *
 * Features:
 * - Date range selection (check-in to check-out) for all categories
 * - Automatic price calculation based on:
 *   - Number of days/nights
 *   - Daily rate
 *   - Weekly/monthly discounts
 *   - Cleaning fees
 *   - Additional charges
 * - Schema-driven custom fields via bookingFormSchema
 * - Real-time price updates
 *
 * Works for: Home Rentals, Hall Bookings, Equipment Rentals, Service Bookings
 *
 * URL: /booking/:itemId
 */
const GenericBookingPage = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const [item, setItem] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [blockedDates, setBlockedDates] = useState([]);
  const [dateAvailabilityError, setDateAvailabilityError] = useState('');

  // Coupon state
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Bundle offers state
  const [bundleItems, setBundleItems] = useState([]);

  // Pricing breakdown state
  const [pricing, setPricing] = useState({
    numberOfNights: 0,
    baseRate: 0,
    subtotal: 0,
    discount: 0,
    discountPercent: 0,
    couponDiscount: 0,
    couponDiscountPercent: 0,
    cleaningFee: 0,
    additionalFees: 0,
    total: 0
  });

  // Form data
  const [formData, setFormData] = useState({
    booking_duration_type: 'Single Day',
    event_date: '',
    start_date: '',
    end_date: '',
    checkin_date: '',
    checkout_date: '',
    number_of_guests: '',
    special_requests: '',
    house_rules_agreement: [],
    selectedMenuItems: {}, // For catering menu selections
    // Legacy fields for backward compatibility
    bookingDate: '',
    numberOfAttendees: '',
    eventType: '',
    specialRequirements: '',
  });

  useEffect(() => {
    loadItemAndCategory();
  }, [itemId]);

  // Load blocked dates for this item
  useEffect(() => {
    if (itemId) {
      loadBlockedDates();
    }
  }, [itemId]);

  // Load available coupons for this item
  useEffect(() => {
    if (itemId && user?.id) {
      loadAvailableCoupons();
    }
  }, [itemId, user]);

  // Handle pre-applied coupon from navigation state (e.g., from BookingSuccessPage)
  useEffect(() => {
    if (location.state?.couponCode && location.state?.fromCoupon) {
      console.log('Pre-applying coupon from navigation:', location.state.couponCode);
      setCouponCode(location.state.couponCode);

      // Auto-validate the coupon after a short delay to ensure item/user are loaded
      const timer = setTimeout(() => {
        if (user?.id) {
          handleValidateCoupon(location.state.couponCode);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [location.state, user, itemId]);

  const loadBlockedDates = async () => {
    try {
      const blocked = await blockedDateService.getItemBlockedDates(itemId);
      console.log('Loaded blocked dates:', blocked); // Debug
      setBlockedDates(blocked);
    } catch (err) {
      console.error('Failed to load blocked dates:', err);
      // Don't show error to user, just continue without blocked dates
    }
  };

  /**
   * Check if a specific date falls within any blocked date range
   */
  const isDateBlocked = (dateString) => {
    if (!dateString || blockedDates.length === 0) return false;

    const checkDate = new Date(dateString);
    checkDate.setHours(0, 0, 0, 0);

    return blockedDates.some(blocked => {
      const blockStart = new Date(blocked.startDate);
      const blockEnd = new Date(blocked.endDate);
      blockStart.setHours(0, 0, 0, 0);
      blockEnd.setHours(0, 0, 0, 0);

      return checkDate >= blockStart && checkDate <= blockEnd;
    });
  };

  // Recalculate pricing whenever dates or guests change
  useEffect(() => {
    if (item) {
      // For single day: use event_date
      // For multiple days: use start_date and end_date
      const isSingleDay = formData.booking_duration_type === 'Single Day';
      const hasValidDates = isSingleDay
        ? formData.event_date
        : (formData.start_date && formData.end_date);

      if (hasValidDates) {
        calculatePricing();
      }
    }
  }, [item, formData.booking_duration_type, formData.event_date, formData.start_date, formData.end_date, formData.number_of_guests, appliedCoupon]);

  const loadItemAndCategory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch item details
      const itemResponse = await api.get(`/item/${itemId}`);
      const itemData = itemResponse.data.data;

      console.log('=== ITEM DATA LOADED ===');
      console.log('Item ID:', itemData.id);
      console.log('Item Type:', itemData.type);
      console.log('Item price field:', itemData.price);
      console.log('Item dynamicData:', itemData.dynamicData);
      console.log('Available dynamicData fields:', Object.keys(itemData.dynamicData || {}));
      console.log('=======================');

      setItem(itemData);

      // Fetch category details (to get bookingFormSchema)
      const categoryData = await getCategoryById(itemData.categoryId);
      setCategory(categoryData);

      // Load bundle offer items if available
      if (itemData.discountedBundledItems && itemData.discountedBundledItems.length > 0) {
        loadBundleItems(itemData.discountedBundledItems);
      }

      setLoading(false);
    } catch (err) {
      console.error('Failed to load item:', err);
      setError('Failed to load item details. Please try again.');
      setLoading(false);
    }
  };

  const loadBundleItems = async (bundledItems) => {
    try {
      const itemPromises = bundledItems.map(async (bundledItem) => {
        try {
          const response = await api.get(`/item/${bundledItem.itemId}`);
          return {
            ...response.data.data,
            discountPercentage: bundledItem.discountPercentage
          };
        } catch (err) {
          console.error(`Failed to load bundle item ${bundledItem.itemId}:`, err);
          return null;
        }
      });

      const loadedItems = await Promise.all(itemPromises);
      setBundleItems(loadedItems.filter(item => item !== null));
    } catch (err) {
      console.error('Failed to load bundle items:', err);
    }
  };

  const loadAvailableCoupons = async () => {
    try {
      const response = await getValidCouponsForItem(itemId, user.id);
      if (response.success && response.data) {
        setAvailableCoupons(response.data);
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
    }
  };

  /**
   * Extract price from item data
   * For dynamic forms, uses category schema to identify price field
   * For legacy items, searches common field names
   */
  const getItemPrice = (itemData, categoryData) => {
    if (!itemData) return 0;

    // First try top-level price field
    if (itemData.price) {
      return parseFloat(itemData.price);
    }

    if (!itemData.dynamicData) return 0;

    // If we have category schema, find the price field from schema
    if (categoryData?.formSchema?.fields) {
      const priceField = categoryData.formSchema.fields.find(field => {
        const lowerLabel = (field.label || '').toLowerCase();
        return field.type === 'number' && (
          lowerLabel.includes('price') ||
          lowerLabel.includes('cost') ||
          lowerLabel.includes('rate') ||
          lowerLabel.includes('fee') ||
          lowerLabel.includes('charge') ||
          lowerLabel.includes('amount')
        );
      });

      if (priceField && itemData.dynamicData[priceField.id]) {
        const price = parseFloat(itemData.dynamicData[priceField.id]);
        if (!isNaN(price) && price > 0) {
          console.log(`Found price from schema: ${priceField.label} (${priceField.id}) = ${price}`);
          return price;
        }
      }
    }

    // Fallback: Try common semantic field names (for legacy items)
    const priceFields = [
      'price_per_day',
      'daily_rate',
      'field_hall_price',
      'price',
      'base_price',
      'price_per_person',
      'service_charge',
      'package_price',
      'rental_price',
      'cost',
      'rate',
      'amount',
      'fee'
    ];

    for (const fieldName of priceFields) {
      if (itemData.dynamicData[fieldName]) {
        const price = parseFloat(itemData.dynamicData[fieldName]);
        if (!isNaN(price) && price > 0) {
          return price;
        }
      }
    }

    // Last resort: Search all numeric fields for price-related names
    for (const [key, value] of Object.entries(itemData.dynamicData)) {
      if (typeof value !== 'object' && value !== null && value !== '') {
        const price = parseFloat(value);
        if (!isNaN(price) && price > 0) {
          console.log(`Found numeric value in field: ${key} = ${price}`);
          return price;
        }
      }
    }

    return 0;
  };

  // Validate coupon with optional code parameter (for auto-apply)
  const handleValidateCoupon = async (codeToValidate = null) => {
    const code = codeToValidate || couponCode;

    if (!code.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    try {
      setValidatingCoupon(true);
      setCouponError('');

      // Extract booking date for same-day validation
      const isSingleDay = formData.booking_duration_type === 'Single Day';
      const rawDate = isSingleDay
        ? formData.event_date
        : formData.start_date;

      // Normalize to YYYY-MM-DD format to ensure consistency
      let normalizedDate = null;
      if (rawDate) {
        try {
          // If already in YYYY-MM-DD format, use it directly (avoid timezone conversion)
          if (typeof rawDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
            normalizedDate = rawDate;
          } else {
            // Handle Date objects or datetime strings
            const dateObj = typeof rawDate === 'string' ? new Date(rawDate) : rawDate;

            // Validate it's a valid date
            if (!isNaN(dateObj.getTime())) {
              // Extract YYYY-MM-DD in local timezone
              const year = dateObj.getFullYear();
              const month = String(dateObj.getMonth() + 1).padStart(2, '0');
              const day = String(dateObj.getDate()).padStart(2, '0');
              normalizedDate = `${year}-${month}-${day}`;
            }
          }
        } catch (e) {
          console.error('Failed to normalize booking date:', e);
          // Continue with null - backend will handle validation
        }
      }

      console.log('Coupon validation:', {
        code: code.trim(),
        rawDate,
        normalizedDate
      });

      const response = await validateCoupon(code.trim(), user.id, itemId, normalizedDate);

      console.log('Coupon validation response:', response);

      // Backend returns: {success: true, valid: true, coupon: {...}}
      if (response.success && response.valid && response.coupon) {
        setAppliedCoupon(response.coupon);
        setCouponError('');
        // Recalculate pricing with discount
        calculatePricing();
      } else {
        setCouponError(response.message || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Failed to validate coupon');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  // Alias for backward compatibility
  const handleApplyCoupon = () => handleValidateCoupon();

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    calculatePricing();
  };

  /**
   * Calculate pricing based on dates, daily rate, and discounts
   */
  const calculatePricing = () => {
    const isSingleDay = formData.booking_duration_type === 'Single Day';

    let startDateTime, endDateTime, numberOfNights;

    if (isSingleDay) {
      // Single day booking: event_date for both start and end
      if (!formData.event_date) {
        setPricing({
          numberOfNights: 0,
          baseRate: 0,
          subtotal: 0,
          discount: 0,
          discountPercent: 0,
          cleaningFee: 0,
          additionalFees: 0,
          total: 0
        });
        return;
      }
      startDateTime = new Date(formData.event_date);
      endDateTime = new Date(formData.event_date);
      numberOfNights = 1; // Single day = 1 day charge
    } else {
      // Multiple days booking: start_date to end_date
      if (!formData.start_date || !formData.end_date) {
        setPricing({
          numberOfNights: 0,
          baseRate: 0,
          subtotal: 0,
          discount: 0,
          discountPercent: 0,
          cleaningFee: 0,
          additionalFees: 0,
          total: 0
        });
        return;
      }
      startDateTime = new Date(formData.start_date);
      endDateTime = new Date(formData.end_date);

      if (endDateTime <= startDateTime) {
        setPricing({
          numberOfNights: 0,
          baseRate: 0,
          subtotal: 0,
          discount: 0,
          discountPercent: 0,
          cleaningFee: 0,
          additionalFees: 0,
          total: 0
        });
        return;
      }

      // Calculate number of nights
      const timeDiff = endDateTime.getTime() - startDateTime.getTime();
      numberOfNights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    }

    // Get pricing from item data (uses category schema to identify price field)
    const dailyRate = getItemPrice(item, category);

    // Debug: Log pricing info to help identify the correct field
    if (dailyRate === 0) {
      console.warn('⚠️ Price not found in item data.');
      console.warn('Available dynamicData fields:', Object.keys(item.dynamicData || {}));
      console.warn('Category schema fields:', category?.formSchema?.fields?.map(f => ({ id: f.id, label: f.label, type: f.type })));
      console.warn('Item dynamicData:', item.dynamicData);
    }

    const weeklyDiscount = parseFloat(item.dynamicData?.weekly_discount || 0);
    const monthlyDiscount = parseFloat(item.dynamicData?.monthly_discount || 0);
    const cleaningFee = parseFloat(item.dynamicData?.cleaning_fee || 0);

    // Calculate base subtotal
    const subtotal = dailyRate * numberOfNights;

    // Determine applicable discount
    let discountPercent = 0;
    let discountLabel = '';

    if (numberOfNights >= 30 && monthlyDiscount > 0) {
      discountPercent = monthlyDiscount;
      discountLabel = 'Monthly Discount';
    } else if (numberOfNights >= 7 && weeklyDiscount > 0) {
      discountPercent = weeklyDiscount;
      discountLabel = 'Weekly Discount';
    }

    const discount = (subtotal * discountPercent) / 100;

    // Apply coupon discount if available
    let couponDiscount = 0;
    if (appliedCoupon) {
      couponDiscount = (subtotal * appliedCoupon.discountPercentage) / 100;
    }

    const total = subtotal - discount - couponDiscount + cleaningFee;

    setPricing({
      numberOfNights,
      baseRate: dailyRate,
      subtotal,
      discount,
      discountPercent,
      discountLabel,
      couponDiscount,
      couponDiscountPercent: appliedCoupon?.discountPercentage || 0,
      cleaningFee,
      additionalFees: 0,
      total
    });
  };

  /**
   * Check date availability in real-time
   */
  const checkDateAvailability = async (startDate, endDate) => {
    if (!startDate || !endDate || !itemId) return;

    try {
      setDateAvailabilityError('');

      const startDateTime = `${startDate}T14:00:00`;
      const endDateTime = `${endDate}T11:00:00`;

      const availabilityCheck = await blockedDateService.checkAvailability(
        itemId,
        startDateTime,
        endDateTime
      );

      if (!availabilityCheck.available) {
        const blockedInfo = availabilityCheck.blockedDates && availabilityCheck.blockedDates.length > 0
          ? availabilityCheck.blockedDates[0]
          : null;

        const reason = blockedInfo?.reason ? ` (Reason: ${blockedInfo.reason})` : '';
        const dateRange = blockedInfo
          ? ` Blocked from ${new Date(blockedInfo.startDate).toLocaleDateString()} to ${new Date(blockedInfo.endDate).toLocaleDateString()}`
          : '';

        setDateAvailabilityError(`⚠️ Selected dates are not available.${dateRange}${reason}`);
      }
    } catch (err) {
      console.error('Failed to check availability:', err);
      // Don't show error to user for availability check failures
    }
  };

  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));

    // Clear applied coupon if date fields change (especially for same-day coupons)
    if (fieldId === 'event_date' || fieldId === 'start_date' || fieldId === 'end_date' || fieldId === 'booking_duration_type') {
      if (appliedCoupon) {
        setAppliedCoupon(null);
        setCouponCode('');

        // Show warning message if it was a same-day coupon
        if (appliedCoupon.sameDayOnly) {
          alert('⚠️ Your same-day coupon has been removed because you changed the booking date.\n\nPlease reapply the coupon after selecting your final date.');
        } else {
          alert('ℹ️ Your coupon has been removed because you changed the booking date.\n\nPlease reapply the coupon after selecting your final date.');
        }
      }
    }

    // Client-side blocked date check (instant feedback)
    if (fieldId === 'event_date' || fieldId === 'start_date' || fieldId === 'end_date') {
      if (isDateBlocked(value)) {
        const blockedInfo = blockedDates.find(blocked => {
          const checkDate = new Date(value);
          const blockStart = new Date(blocked.startDate);
          const blockEnd = new Date(blocked.endDate);
          checkDate.setHours(0, 0, 0, 0);
          blockStart.setHours(0, 0, 0, 0);
          blockEnd.setHours(0, 0, 0, 0);
          return checkDate >= blockStart && checkDate <= blockEnd;
        });

        const reason = blockedInfo?.reason ? ` (${blockedInfo.reason})` : '';
        const dateRange = blockedInfo
          ? ` Blocked: ${new Date(blockedInfo.startDate).toLocaleDateString()} - ${new Date(blockedInfo.endDate).toLocaleDateString()}`
          : '';

        setDateAvailabilityError(`⚠️ This date is not available.${dateRange}${reason}`);
        return; // Don't proceed with server check if already blocked
      } else {
        setDateAvailabilityError(''); // Clear error if date is not blocked
      }
    }

    // Server-side availability check when dates change
    if (fieldId === 'event_date') {
      // Single day: check-in on event_date, check-out next day
      const eventDate = new Date(value);
      const nextDay = new Date(eventDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const checkoutDate = nextDay.toISOString().split('T')[0];

      checkDateAvailability(value, checkoutDate);
    } else if (fieldId === 'start_date') {
      // Multiple days: check when we have both dates
      if (formData.end_date) {
        checkDateAvailability(value, formData.end_date);
      }
    } else if (fieldId === 'end_date') {
      // Multiple days: check when we have both dates
      if (formData.start_date) {
        checkDateAvailability(formData.start_date, value);
      }
    }
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

      // Validate dates based on booking type
      const isSingleDay = formData.booking_duration_type === 'Single Day';

      if (isSingleDay) {
        if (!formData.event_date) {
          setError('Please select an event date');
          setSubmitting(false);
          return;
        }
      } else {
        if (!formData.start_date || !formData.end_date) {
          setError('Please select start and end dates');
          setSubmitting(false);
          return;
        }

        const startDate = new Date(formData.start_date);
        const endDate = new Date(formData.end_date);

        if (endDate <= startDate) {
          setError('End date must be after start date');
          setSubmitting(false);
          return;
        }
      }

      // Validate guest capacity
      if (item.dynamicData?.max_guests && formData.number_of_guests) {
        const maxGuests = parseInt(item.dynamicData.max_guests);
        const requestedGuests = parseInt(formData.number_of_guests);

        if (requestedGuests > maxGuests) {
          setError(`Maximum ${maxGuests} guests allowed`);
          setSubmitting(false);
          return;
        }
      }

      // Prepare booking data based on duration type
      let bookingStartDate, bookingEndDate;

      if (isSingleDay) {
        // Single day rental: check-in on event_date, check-out next day
        // (e.g., check-in May 15 at 2 PM, check-out May 16 at 11 AM)
        bookingStartDate = formData.event_date;

        // Calculate next day for checkout
        const eventDate = new Date(formData.event_date);
        const nextDay = new Date(eventDate);
        nextDay.setDate(nextDay.getDate() + 1);
        bookingEndDate = nextDay.toISOString().split('T')[0];
      } else {
        // Multiple days: use start_date and end_date
        bookingStartDate = formData.start_date;
        bookingEndDate = formData.end_date;
      }

      // Check for blocked dates (final validation before submission)
      try {
        const startDateTime = `${bookingStartDate}T14:00:00`;
        const endDateTime = `${bookingEndDate}T11:00:00`;

        const availabilityCheck = await blockedDateService.checkAvailability(
          itemId,
          startDateTime,
          endDateTime
        );

        if (!availabilityCheck.available) {
          const blockedInfo = availabilityCheck.blockedDates && availabilityCheck.blockedDates.length > 0
            ? availabilityCheck.blockedDates[0]
            : null;

          const reason = blockedInfo?.reason ? ` Reason: ${blockedInfo.reason}` : '';
          const dateRange = blockedInfo
            ? ` (${new Date(blockedInfo.startDate).toLocaleDateString()} - ${new Date(blockedInfo.endDate).toLocaleDateString()})`
            : '';

          setError(`This item is not available for the selected dates.${dateRange}${reason}`);
          setSubmitting(false);
          return;
        }
      } catch (err) {
        console.error('Failed to check availability:', err);
        setError('Failed to verify date availability. Please try again.');
        setSubmitting(false);
        return;
      }

      // Use the dates we already set
      const startDateTime = `${bookingStartDate}T14:00:00`; // Default 2 PM check-in
      const endDateTime = `${bookingEndDate}T11:00:00`;     // Default 11 AM check-out

      const bookingData = {
        itemId: item.id,
        userId: user.id,
        startDateTime: startDateTime,
        endDateTime: endDateTime,
        numberOfAttendees: parseInt(formData.number_of_guests || formData.numberOfAttendees || 1),
        functionType: formData.eventType || 'Rental',
        couponCode: appliedCoupon?.code || null,
        // Include pricing and booking details
        details: {
          categoryId: category.id,
          categoryName: category.name,
          itemName: getItemName(item),
          // Booking duration type
          booking_duration_type: formData.booking_duration_type,
          // Date details
          event_date: formData.event_date,
          start_date: formData.start_date,
          end_date: formData.end_date,
          numberOfDays: pricing.numberOfNights,
          // Guest details
          number_of_guests: formData.number_of_guests,
          special_requests: formData.special_requests,
          event_type: formData.event_type,
          // CRITICAL: Total booking amount for display on confirmation page
          totalBookingAmount: pricing.total,
          // Pricing breakdown
          pricing: {
            baseRate: pricing.baseRate,
            numberOfDays: pricing.numberOfNights,
            subtotal: pricing.subtotal,
            discount: pricing.discount,
            discountPercent: pricing.discountPercent,
            discountLabel: pricing.discountLabel,
            cleaningFee: pricing.cleaningFee,
            total: pricing.total
          },
          // Legacy fields for backward compatibility
          bookingDate: bookingStartDate,
          checkin_date: bookingStartDate,
          checkout_date: bookingEndDate,
          specialRequirements: formData.special_requests || formData.specialRequirements,
          // All form data
          ...formData
        },
        status: 'PENDING'
      };

      // Create booking
      const createdBooking = await createBooking(bookingData);

      console.log('=== Booking Created Successfully ===');
      console.log('Created booking:', createdBooking);
      console.log('Booking ID:', createdBooking.id);
      console.log('===================================');

      if (!createdBooking || !createdBooking.id) {
        throw new Error('Booking created but ID is missing from response');
      }

      // Navigate to booking success page with booking ID
      navigate('/booking-success', {
        state: { bookingId: createdBooking.id }
      });

    } catch (err) {
      console.error('Failed to create booking:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to extract item name from dynamicData
  const getItemName = (item) => {
    if (!item) return 'Item';

    // Use the centralized getItemDisplayName function with category context
    // This respects the category's primaryNameFieldId setting
    return getItemDisplayName(item, category);
  };

  // Helper to get item image
  const getItemImage = (item) => {
    if (!item) return null;

    const imageUrl = item.dynamicData?.property_images ||
                     item.dynamicData?.field_hall_image ||
                     item.dynamicData?.restaurant_image ||
                     item.dynamicData?.image ||
                     item.details?.mainImageUrl;

    // Handle comma-separated URLs (take first one)
    if (imageUrl && imageUrl.includes(',')) {
      return imageUrl.split(',')[0].trim();
    }

    return imageUrl;
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

  if (error && !item) {
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

  // Filter out fields we're handling manually in the UI
  const getFilteredBookingSchema = () => {
    if (!hasCustomSchema) return null;

    const fieldsToExclude = [
      'booking_duration_type',
      'event_date',
      'start_date',
      'end_date',
      'number_of_guests',
      'event_type',
      'special_requests' // Exclude because we have a hardcoded field for this
    ];

    const filteredFields = category.bookingFormSchema.fields.filter(
      field => !fieldsToExclude.includes(field.id)
    );

    return {
      ...category.bookingFormSchema,
      fields: filteredFields
    };
  };

  const filteredBookingSchema = getFilteredBookingSchema();

  const itemImage = getItemImage(item);

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

        <div className="booking-content row">
          {/* Left Column - Booking Form */}
          <div className="col-lg-8">
            <div className="booking-form-section">
              <h3>Booking Details</h3>

              {/* Blocked Dates Warning */}
              {blockedDates.length > 0 && (
                <div className="blocked-dates-warning" style={{
                  background: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <i className="fas fa-exclamation-triangle" style={{ color: '#856404' }}></i>
                    <strong style={{ color: '#856404' }}>Some dates are blocked</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#856404' }}>
                    This item has {blockedDates.length} blocked date {blockedDates.length === 1 ? 'range' : 'ranges'}.
                    Please avoid booking during these periods:
                  </p>
                  <ul style={{ marginTop: '8px', marginBottom: 0, paddingLeft: '20px', fontSize: '13px', color: '#856404' }}>
                    {blockedDates.slice(0, 3).map((blocked, index) => (
                      <li key={index}>
                        {new Date(blocked.startDate).toLocaleDateString()} - {new Date(blocked.endDate).toLocaleDateString()}
                        {blocked.reason && ` (${blocked.reason})`}
                      </li>
                    ))}
                    {blockedDates.length > 3 && (
                      <li style={{ fontStyle: 'italic' }}>... and {blockedDates.length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}

              <form onSubmit={handleSubmit} className="booking-form">
                {/* Booking Duration Type Selection - FIRST FIELD */}
                <div className="form-group" style={{ marginBottom: '30px' }}>
                  <label htmlFor="booking_duration_type">
                    Booking Duration <span className="required">*</span>
                  </label>
                  <select
                    id="booking_duration_type"
                    value={formData.booking_duration_type}
                    onChange={(e) => handleInputChange('booking_duration_type', e.target.value)}
                    required
                  >
                    <option value="Single Day">Single Day</option>
                    <option value="Multiple Days">Multiple Days</option>
                  </select>
                  <small className="form-text">
                    Choose whether you want to book for one day or multiple days
                  </small>
                </div>

                {/* Date Selection Section */}
                <div className="date-range-section">
                  <h4><i className="fas fa-calendar-alt"></i> Select Dates</h4>

                  {/* Blocked Dates Info */}
                  {blockedDates.length > 0 && (
                    <div className="alert alert-info" style={{ marginBottom: '15px', fontSize: '0.9em' }}>
                      <strong>⚠️ Unavailable Dates:</strong>
                      <ul style={{ marginBottom: 0, marginTop: '5px', paddingLeft: '20px' }}>
                        {blockedDates.map((blocked, idx) => (
                          <li key={idx}>
                            {new Date(blocked.startDate).toLocaleDateString()} - {new Date(blocked.endDate).toLocaleDateString()}
                            {blocked.reason && ` (${blocked.reason})`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Date Availability Error */}
                  {dateAvailabilityError && (
                    <div className="alert alert-warning" style={{ marginBottom: '15px' }}>
                      {dateAvailabilityError}
                    </div>
                  )}

                  {/* Conditional Date Fields */}
                  {formData.booking_duration_type === 'Single Day' ? (
                    // Single Day: Event Date
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="event_date">
                            Event Date <span className="required">*</span>
                          </label>
                          <input
                            type="date"
                            id="event_date"
                            value={formData.event_date}
                            onChange={(e) => handleInputChange('event_date', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            required
                          />
                          <small className="form-text">
                            Date of your event
                          </small>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Multiple Days: Start Date and End Date
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="start_date">
                            Start Date <span className="required">*</span>
                          </label>
                          <input
                            type="date"
                            id="start_date"
                            value={formData.start_date}
                            onChange={(e) => handleInputChange('start_date', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            required
                          />
                          <small className="form-text">
                            {item.dynamicData?.checkin_time && `Check-in: ${item.dynamicData.checkin_time}`}
                          </small>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="end_date">
                            End Date <span className="required">*</span>
                          </label>
                          <input
                            type="date"
                            id="end_date"
                            value={formData.end_date}
                            onChange={(e) => handleInputChange('end_date', e.target.value)}
                            min={formData.start_date || new Date().toISOString().split('T')[0]}
                            required
                          />
                          <small className="form-text">
                            {item.dynamicData?.checkout_time && `Check-out: ${item.dynamicData.checkout_time}`}
                          </small>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show number of days */}
                  {pricing.numberOfNights > 0 && (
                    <div className="nights-info">
                      <i className="fas fa-calendar-day"></i>
                      <strong>{pricing.numberOfNights}</strong> day{pricing.numberOfNights !== 1 ? 's' : ''}
                      {formData.booking_duration_type === 'Multiple Days' && pricing.numberOfNights > 1 && (
                        <span> ({pricing.numberOfNights} nights)</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Vendor's Offerings (Menu Items, Services, etc.) */}
                {item.dynamicData?.menu_items && item.dynamicData.menu_items.length > 0 && (
                  <div className="vendor-offerings-section">
                    <h4><i className="fas fa-utensils"></i> Select Menu Items</h4>
                    <p className="section-description">
                      Choose items from our menu and specify quantity (number of people)
                    </p>
                    <div className="menu-items-list">
                      {item.dynamicData.menu_items.map((menuItem, index) => (
                        <div key={index} className="menu-item-card">
                          <div className="menu-item-header">
                            <div className="menu-item-info">
                              <h5>{menuItem.menu_item_name}</h5>
                              <span className="menu-category-badge">{menuItem.menu_category}</span>
                              <span className={`food-type-badge ${menuItem.food_type_item?.toLowerCase()}`}>
                                {menuItem.food_type_item}
                              </span>
                            </div>
                            <div className="menu-item-price">
                              ₹{menuItem.price_per_person}
                              <span className="per-person">/person</span>
                            </div>
                          </div>
                          {menuItem.item_description && (
                            <p className="menu-item-description">{menuItem.item_description}</p>
                          )}
                          <div className="menu-item-selection">
                            <label className="checkbox-container">
                              <input
                                type="checkbox"
                                checked={formData.selectedMenuItems?.[index]?.selected || false}
                                onChange={(e) => {
                                  const newSelections = { ...formData.selectedMenuItems };
                                  if (e.target.checked) {
                                    newSelections[index] = {
                                      selected: true,
                                      item: menuItem,
                                      quantity: formData.number_of_guests || 10
                                    };
                                  } else {
                                    delete newSelections[index];
                                  }
                                  handleInputChange('selectedMenuItems', newSelections);
                                }}
                              />
                              <span>Select this item</span>
                            </label>
                            {formData.selectedMenuItems?.[index]?.selected && (
                              <div className="quantity-input">
                                <label>Quantity (people):</label>
                                <input
                                  type="number"
                                  min={item.dynamicData?.minimum_order || 1}
                                  max={item.dynamicData?.maximum_capacity || 1000}
                                  value={formData.selectedMenuItems[index].quantity}
                                  onChange={(e) => {
                                    const newSelections = { ...formData.selectedMenuItems };
                                    newSelections[index].quantity = parseInt(e.target.value);
                                    handleInputChange('selectedMenuItems', newSelections);
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category-Specific Fields from bookingFormSchema */}
                {filteredBookingSchema && filteredBookingSchema.fields.length > 0 && (
                  <div className="category-specific-section">
                    <h4><i className="fas fa-list"></i> Additional Details</h4>
                    <DynamicForm
                      schema={filteredBookingSchema}
                      data={formData}
                      onChange={handleInputChange}
                    />
                  </div>
                )}

                {/* Special Requests */}
                <div className="form-group full-width">
                  <label htmlFor="special_requests">
                    <i className="fas fa-comment-alt"></i> Special Requests / Notes
                  </label>
                  <textarea
                    id="special_requests"
                    value={formData.special_requests}
                    onChange={(e) => handleInputChange('special_requests', e.target.value)}
                    rows="4"
                    placeholder="Any special requirements or notes for your booking..."
                  />
                </div>

                {/* House Rules Agreement */}
                {item.dynamicData?.house_rules && item.dynamicData.house_rules.length > 0 && (
                  <div className="house-rules-section">
                    <h4><i className="fas fa-clipboard-list"></i> House Rules</h4>
                    <ul className="house-rules-list">
                      {item.dynamicData.house_rules.map((rule, index) => (
                        <li key={index}>{rule}</li>
                      ))}
                    </ul>
                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          required
                        />
                        <span>I agree to follow the house rules</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Coupon Section */}
                <div className="coupon-section">
                  <h4><i className="fas fa-ticket-alt"></i> Apply Coupon</h4>

                  {/* Available Coupons */}
                  {availableCoupons.length > 0 && !appliedCoupon && (
                    <div className="available-coupons" style={{
                      marginBottom: '15px',
                      padding: '15px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '8px',
                      color: 'white'
                    }}>
                      <p style={{ margin: '0 0 10px 0', fontWeight: '600' }}>
                        <i className="fas fa-gift"></i> You have {availableCoupons.length} coupon{availableCoupons.length !== 1 ? 's' : ''} available for this item!
                      </p>
                      {availableCoupons.map((coupon) => {
                        const timeRemaining = coupon.expiryTime
                          ? Math.max(0, Math.floor((new Date(coupon.expiryTime) - new Date()) / (1000 * 60 * 60)))
                          : null;

                        return (
                          <div key={coupon.id} style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            padding: '12px',
                            borderRadius: '6px',
                            marginBottom: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '700', fontFamily: 'monospace', letterSpacing: '1px', fontSize: '15px', marginBottom: '4px' }}>
                                  {coupon.code}
                                </div>
                                <div style={{ fontSize: '0.85em', opacity: 0.9 }}>
                                  {coupon.discountPercentage}% OFF - {coupon.description}
                                </div>
                                {timeRemaining !== null && (
                                  <div style={{ fontSize: '0.8em', opacity: 0.85, marginTop: '4px' }}>
                                    ⏰ Expires in {timeRemaining}h
                                  </div>
                                )}
                              </div>
                              <div style={{
                                background: '#10b981',
                                color: 'white',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                fontSize: '13px',
                                fontWeight: '700',
                                marginLeft: '10px'
                              }}>
                                {coupon.discountPercentage}% OFF
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setCouponCode(coupon.code);
                                  handleApplyCoupon();
                                }}
                                style={{
                                  flex: 1,
                                  background: '#10b981',
                                  color: 'white',
                                  border: 'none',
                                  padding: '8px 15px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.9em',
                                  fontWeight: '600'
                                }}
                              >
                                Apply Now
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(coupon.code);
                                  alert(`Coupon code "${coupon.code}" copied to clipboard!`);
                                }}
                                style={{
                                  background: 'rgba(255, 255, 255, 0.2)',
                                  color: 'white',
                                  border: '1px solid rgba(255, 255, 255, 0.3)',
                                  padding: '8px 15px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.9em',
                                  fontWeight: '600',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                📋 Copy Code
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Coupon Input */}
                  {!appliedCoupon && (
                    <div className="form-group">
                      <label htmlFor="coupon_code">
                        Coupon Code
                      </label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                          type="text"
                          id="coupon_code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Enter coupon code"
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          className="btn-secondary"
                          disabled={validatingCoupon || !couponCode.trim()}
                          style={{ minWidth: '100px' }}
                        >
                          {validatingCoupon ? 'Validating...' : 'Apply'}
                        </button>
                      </div>
                      {couponError && (
                        <div style={{
                          marginTop: '8px',
                          padding: '8px 12px',
                          background: '#fee',
                          color: '#c33',
                          borderRadius: '4px',
                          fontSize: '0.9em'
                        }}>
                          <i className="fas fa-exclamation-triangle"></i> {couponError}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Applied Coupon */}
                  {appliedCoupon && (
                    <div style={{
                      padding: '15px',
                      background: '#d4edda',
                      border: '1px solid #c3e6cb',
                      borderRadius: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontWeight: '700', color: '#155724' }}>
                          <i className="fas fa-check-circle"></i> Coupon Applied!
                        </div>
                        <div style={{ fontSize: '0.9em', color: '#155724', marginTop: '4px' }}>
                          {appliedCoupon.code} - {appliedCoupon.discountPercentage}% OFF
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        style={{
                          background: 'transparent',
                          color: '#721c24',
                          border: '1px solid #721c24',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.9em'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Cancellation Policy */}
                {item.dynamicData?.cancellation_policy && (
                  <div className="cancellation-policy">
                    <h4><i className="fas fa-undo"></i> Cancellation Policy</h4>
                    <p>{item.dynamicData.cancellation_policy}</p>
                  </div>
                )}

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

          {/* Right Column - Price Summary & Item Details */}
          <div className="col-lg-4">
            {/* Item Card */}
            <div className="item-card sticky-top">
              {itemImage && (
                <div className="item-image">
                  <img src={itemImage} alt={getItemName(item)} />
                </div>
              )}
              <div className="item-details">
                <h4>{getItemName(item)}</h4>
                {item.dynamicData?.property_type && (
                  <p className="item-type">
                    <i className="fas fa-home"></i> {item.dynamicData.property_type}
                  </p>
                )}
                {item.dynamicData?.city && (
                  <p className="item-location">
                    <i className="fas fa-map-marker-alt"></i> {item.dynamicData.city}
                  </p>
                )}
                {item.dynamicData?.bedrooms && item.dynamicData?.bathrooms && (
                  <p className="item-specs">
                    <i className="fas fa-bed"></i> {item.dynamicData.bedrooms} Bedrooms •{' '}
                    <i className="fas fa-bath"></i> {item.dynamicData.bathrooms} Bathrooms
                  </p>
                )}
              </div>

              {/* Bundle Offers */}
              {bundleItems.length > 0 && (
                <div className="bundle-offers-section" style={{
                  marginTop: '20px',
                  padding: '15px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '10px',
                  color: 'white'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fas fa-gift"></i>
                    Special Bundle Offers!
                  </h4>
                  <p style={{ margin: '0 0 12px 0', fontSize: '13px', opacity: 0.9 }}>
                    Book this item and get exclusive discounts on these items:
                  </p>
                  {bundleItems.map((bundleItem, index) => (
                    <div key={index} style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(10px)',
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '3px' }}>
                          {getItemName(bundleItem)}
                        </div>
                        <div style={{ fontSize: '12px', opacity: 0.85 }}>
                          {bundleItem.type}
                        </div>
                      </div>
                      <div style={{
                        background: '#10b981',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '700',
                        whiteSpace: 'nowrap',
                        marginLeft: '10px'
                      }}>
                        {bundleItem.discountPercentage}% OFF
                      </div>
                    </div>
                  ))}
                  <div style={{
                    marginTop: '12px',
                    padding: '10px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    lineHeight: '1.5'
                  }}>
                    <i className="fas fa-info-circle" style={{ marginRight: '6px' }}></i>
                    <strong>How it works:</strong> After booking, you'll receive coupon codes valid for 48 hours to get these discounts!
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              {pricing.numberOfNights > 0 && (
                <div className="price-breakdown">
                  <h4>Price Details</h4>

                  <div className="price-row">
                    <span>₹{pricing.baseRate.toFixed(2)} × {pricing.numberOfNights} day{pricing.numberOfNights !== 1 ? 's' : ''}</span>
                    <span>₹{pricing.subtotal.toFixed(2)}</span>
                  </div>

                  {pricing.discount > 0 && (
                    <div className="price-row discount">
                      <span>
                        {pricing.discountLabel || 'Discount'} ({pricing.discountPercent}%)
                      </span>
                      <span className="discount-amount">-₹{pricing.discount.toFixed(2)}</span>
                    </div>
                  )}

                  {pricing.couponDiscount > 0 && (
                    <div className="price-row discount">
                      <span>
                        <i className="fas fa-ticket-alt"></i> Coupon Discount ({pricing.couponDiscountPercent}%)
                      </span>
                      <span className="discount-amount">-₹{pricing.couponDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  {pricing.cleaningFee > 0 && (
                    <div className="price-row">
                      <span>Cleaning Fee</span>
                      <span>₹{pricing.cleaningFee.toFixed(2)}</span>
                    </div>
                  )}

                  <hr />

                  <div className="price-row total">
                    <span><strong>Total</strong></span>
                    <span><strong>₹{pricing.total.toFixed(2)}</strong></span>
                  </div>

                  {item.dynamicData?.minimum_stay && pricing.numberOfNights < parseInt(item.dynamicData.minimum_stay) && (
                    <div className="price-warning">
                      <i className="fas fa-exclamation-triangle"></i>
                      Minimum stay: {item.dynamicData.minimum_stay} night{parseInt(item.dynamicData.minimum_stay) !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              )}

              {/* Amenities Preview */}
              {item.dynamicData?.amenities && item.dynamicData.amenities.length > 0 && (
                <div className="amenities-preview">
                  <h4>Amenities</h4>
                  <div className="amenities-list">
                    {item.dynamicData.amenities.slice(0, 5).map((amenity, index) => (
                      <div key={index} className="amenity-item">
                        <i className="fas fa-check"></i> {amenity}
                      </div>
                    ))}
                    {item.dynamicData.amenities.length > 5 && (
                      <div className="amenity-item more">
                        +{item.dynamicData.amenities.length - 5} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenericBookingPage;
