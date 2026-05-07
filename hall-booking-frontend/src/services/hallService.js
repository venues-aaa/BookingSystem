import api from './api';

export const getHalls = async (params = {}) => {
  const { page = 0, size = 12, type = 'Hall', sortBy = 'createdOn', capacity, location, amenities, startDateTime, endDateTime } = params;

  // If search criteria provided, use filter endpoint
  if (capacity || location || amenities || startDateTime || endDateTime) {
    return searchHalls({
      type,
      seatingCapacity: capacity ? parseInt(capacity) : null,
      placeId: location || null,
      // Note: Backend filter doesn't support date/time yet - this will be client-side filtered for now
      startDateTime,
      endDateTime
    });
  }

  // Otherwise use fetch endpoint
  const response = await api.post('/item/fetch',
    { type }, // Request body
    { params: { page, size, sortBy } } // Query params
  );

  // Transform backend structure to flat structure for frontend components
  const transformedHalls = (response.data.halls || []).map(hall => ({
    id: hall.id,
    name: hall.details?.name,
    description: hall.details?.description,
    capacity: hall.details?.qtyAvailable,
    location: hall.details?.address,
    pricePerHour: hall.price?.baseRate,
    imageUrl: hall.details?.mainImageUrl,
    amenities: hall.details?.amenities
      ? Object.values(hall.details.amenities).filter(a => a).join(', ')
      : '',
    status: hall.status,
    availableSlotTypes: hall.details?.availableSlotTypes || {
      fullday: true,
      morning: true,
      evening: true
    },
    // Keep original nested structure for detail pages
    ...hall
  }));

  return {
    ...response.data,
    halls: transformedHalls
  };
};

export const getHallById = async (id) => {
  // Backend returns {halls: {...}} wrapper
  const response = await api.get(`/item/${id}`);
  const hall = response.data.halls || response.data;

  // Transform backend structure to flat structure
  if (hall && hall.details) {
    return {
      id: hall.id,
      name: hall.details?.name,
      description: hall.details?.description,
      capacity: hall.details?.qtyAvailable,
      location: hall.details?.address,
      pricePerHour: hall.price?.baseRate,
      imageUrl: hall.details?.mainImageUrl,
      amenities: hall.details?.amenities
        ? Object.values(hall.details.amenities).filter(a => a).join(', ')
        : '',
      status: hall.status,
      isActive: hall.status === 'Active',
      availableSlotTypes: hall.details?.availableSlotTypes || {
        fullday: true,
        morning: true,
        evening: true
      },
      // Keep original nested structure
      ...hall
    };
  }

  return hall;
};

export const searchHalls = async (searchParams) => {
  // Backend uses POST /item/filter
  const response = await api.post('/item/filter', searchParams);

  // Transform backend structure to flat structure for frontend components
  const transformedHalls = (response.data.halls || []).map(hall => ({
    id: hall.id,
    name: hall.details?.name,
    description: hall.details?.description,
    capacity: hall.details?.qtyAvailable,
    location: hall.details?.address,
    pricePerHour: hall.price?.baseRate,
    imageUrl: hall.details?.mainImageUrl,
    amenities: hall.details?.amenities
      ? Object.values(hall.details.amenities).filter(a => a).join(', ')
      : '',
    status: hall.status,
    availableSlotTypes: hall.details?.availableSlotTypes || {
      fullday: true,
      morning: true,
      evening: true
    },
    // Keep original nested structure for detail pages
    ...hall
  }));

  // If date/time filters provided, check availability
  if (searchParams.startDateTime && searchParams.endDateTime) {
    const startDate = new Date(searchParams.startDateTime);
    const endDate = new Date(searchParams.endDateTime);
    const bookingDate = startDate.toISOString().split('T')[0]; // YYYY-MM-DD

    // Determine which slot type(s) are needed based on time range
    const startHour = startDate.getHours();
    const endHour = endDate.getHours();

    // Map hours to slot types
    // Morning: 6 AM - 3 PM (6-15)
    // Evening: 4 PM - 10 PM (16-22)
    // Full day: All day (0-23)
    let requiredSlotType = 'fullday'; // default

    if (startHour >= 6 && endHour <= 15) {
      requiredSlotType = 'morning';
    } else if (startHour >= 16 && endHour <= 22) {
      requiredSlotType = 'evening';
    }

    // Filter out halls that are booked during the requested time
    const availableHalls = [];

    for (const hall of transformedHalls) {
      // Check if hall supports the required slot type
      const slotTypes = hall.availableSlotTypes || { fullday: true, morning: true, evening: true };
      if (!slotTypes[requiredSlotType]) {
        continue; // Skip this hall if it doesn't offer the required slot
      }

      try {
        const availabilityCheck = await api.post('/bookings/check-availability', {
          itemId: hall.id,
          bookingDate: bookingDate,
          slotType: requiredSlotType
        });

        // If available is true, include the hall
        if (availabilityCheck.data.available) {
          availableHalls.push(hall);
        }
      } catch (error) {
        console.error(`Failed to check availability for hall ${hall.id}:`, error);
        // Include hall if availability check fails (don't hide halls due to errors)
        availableHalls.push(hall);
      }
    }

    return {
      ...response.data,
      halls: availableHalls
    };
  }

  return {
    ...response.data,
    halls: transformedHalls
  };
};

// Admin operations - using /item endpoints (no /admin endpoints exist yet)
export const createHall = async (hallData) => {
  // Get vendorId from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const vendorId = hallData.vendorId || user.id || user._id || 'default-vendor';

  // Transform flat structure to backend's nested structure
  const backendData = {
    type: hallData.type || 'Hall',
    categoryId: hallData.categoryId || null, // Add categoryId support
    vendorId: vendorId,
    placeId: hallData.placeId || 'default-place',
    dynamicData: hallData.dynamicData || null, // Add dynamicData support
    details: {
      name: hallData.name,
      description: hallData.description,
      address: hallData.location,
      qtyAvailable: hallData.capacity,
      mainImageUrl: hallData.imageUrl,
      amenities: hallData.amenities
        ? hallData.amenities.split(',').reduce((acc, amenity, index) => {
            acc[`amenity${index + 1}`] = amenity.trim();
            return acc;
          }, {})
        : {},
      availableSlotTypes: hallData.availableSlotTypes || {
        fullday: true,
        morning: true,
        evening: true
      }
    },
    price: hallData.pricePerHour ? {
      baseRate: hallData.pricePerHour,
      tax: 0.0,
      discount: 0.0,
      subTotal: hallData.pricePerHour,
      otherDiscount: 0.0
    } : {
      baseRate: 0.0,
      tax: 0.0,
      discount: 0.0,
      subTotal: 0.0,
      otherDiscount: 0.0
    },
    status: 'Active'
  };

  const response = await api.post('/item/create', backendData);
  return response.data;
};

export const updateHall = async (id, hallData) => {
  // Get vendorId from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const vendorId = hallData.vendorId || user.id || user._id || 'default-vendor';

  // Transform flat structure to backend's nested structure
  const backendData = {
    id,
    type: 'Hotel',
    vendorId: vendorId,
    placeId: hallData.placeId || 'default-place',
    details: {
      name: hallData.name,
      description: hallData.description,
      address: hallData.location,
      qtyAvailable: hallData.capacity,
      mainImageUrl: hallData.imageUrl,
      amenities: hallData.amenities
        ? hallData.amenities.split(',').reduce((acc, amenity, index) => {
            acc[`amenity${index + 1}`] = amenity.trim();
            return acc;
          }, {})
        : {},
      availableSlotTypes: hallData.availableSlotTypes || {
        fullday: true,
        morning: true,
        evening: true
      }
    },
    price: hallData.pricePerHour ? {
      baseRate: hallData.pricePerHour,
      tax: 0.0,
      discount: 0.0,
      subTotal: hallData.pricePerHour,
      otherDiscount: 0.0
    } : {
      baseRate: 0.0,
      tax: 0.0,
      discount: 0.0,
      subTotal: 0.0,
      otherDiscount: 0.0
    },
    status: hallData.status || 'Active'
  };

  const response = await api.put('/item/update', backendData);
  return response.data;
};

export const deleteHall = async (id) => {
  const response = await api.delete(`/item/${id}`);
  return response.data;
};

/**
 * Generic function to fetch items for any category
 * @param {string} categoryName - Category name (e.g., "Hall", "Categering", "Decoration")
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Page size
 * @param {string} sortBy - Sort field
 * @returns {Promise} - Response with items data
 */
export const fetchItems = async (categoryName, page = 0, size = 12, sortBy = 'createdOn') => {
  const response = await api.post('/item/fetch',
    { type: categoryName }, // Request body with category type
    { params: { page, size, sortBy } } // Query params
  );
  return response.data;
};
