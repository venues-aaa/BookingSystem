import api from './api';

// NOTE: Backend doesn't have /admin endpoints yet
// Using available endpoints as workarounds

export const getAllBookings = async (params = {}) => {
  const { page = 0, size = 10, userId, status } = params;
  // Use new admin endpoint to get ALL bookings
  const response = await api.get('/bookings/admin/all', {
    params: { page, size, status }
  });
  return response.data;
};

export const getAllUsers = async (params = {}) => {
  const { page = 0, size = 10 } = params;
  // Backend uses /api/user/retrieveAll
  const response = await api.get('/api/user/retrieveAll', {
    params: { page, size }
  });
  return response.data;
};

export const getStatistics = async () => {
  // Backend doesn't have /admin/statistics
  // Return mock data for now
  return {
    totalHalls: 0,
    totalBookings: 0,
    totalUsers: 0,
    activeBookings: 0
  };
};

// Admin Hall Management - using /item endpoints
export const toggleHallStatus = async (id, currentStatus) => {
  // Fetch full hall data first
  const hallResponse = await api.get(`/item/${id}`);
  const hall = hallResponse.data.halls || hallResponse.data;

  // Update only the status, keeping all other fields
  const response = await api.put('/item/update', {
    ...hall,
    status: currentStatus === 'Active' ? 'Inactive' : 'Active'
  });
  return response.data;
};

export const getAdminHalls = async (params = {}) => {
  const { page = 0, size = 10, type = 'Hotel', sortBy = 'createdOn' } = params;
  // Use POST /item/fetch
  const response = await api.post('/item/fetch',
    { type },
    { params: { page, size, sortBy } }
  );

  // Transform backend structure to flat structure for admin table
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
    isActive: hall.status === 'Active',
    availableSlotTypes: hall.details?.availableSlotTypes || {
      fullday: true,
      morning: true,
      evening: true
    },
    // Keep original nested structure for updates
    vendorId: hall.vendorId,
    placeId: hall.placeId,
    type: hall.type,
    createdBy: hall.createdBy,
    createdById: hall.createdBy // For filtering
  }));

  return {
    ...response.data,
    halls: transformedHalls
  };
};

// User Management APIs - using /api/user endpoints
export const createUser = async (userData) => {
  const response = await api.post('/api/user/create', {
    emailId: userData.email || userData.emailId,
    password: userData.password,
    details: {
      firstName: userData.firstName,
      lastName: userData.lastName,
      phoneNumber: userData.phoneNumber,
      role: userData.role || 'USER'
    }
  });
  return response.data;
};

export const getUserById = async (id) => {
  // Backend uses POST /api/user/retrieve with body
  const response = await api.post('/api/user/retrieve', { userId: id });
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put('/api/user/update', {
    id,
    emailId: userData.email || userData.emailId,
    details: {
      firstName: userData.firstName,
      lastName: userData.lastName,
      phoneNumber: userData.phoneNumber,
      role: userData.role
    }
  });
  return response.data;
};

export const toggleUserStatus = async (id, currentStatus) => {
  // Backend uses PUT /api/user/update/status
  const response = await api.put('/api/user/update/status', {
    userId: id,
    status: currentStatus === 'Active' ? 'Inactive' : 'Active'
  });
  return response.data;
};

export const deleteUser = async (id) => {
  // Backend doesn't have delete user endpoint
  // Use status update as workaround
  return toggleUserStatus(id, 'Active'); // Set to Inactive
};
