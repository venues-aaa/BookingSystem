import api from './api';

export const createBooking = async (bookingData) => {
  // Backend uses /bookings/create
  const response = await api.post('/bookings/create', bookingData);
  console.log('Create booking response:', response.data);

  // Return the booking object (response.data is BookingResponse)
  const booking = response.data;

  // Ensure we have an id field (might be 'id' or 'bookingId')
  if (!booking.id && booking.bookingId) {
    booking.id = booking.bookingId;
  }

  return booking;
};

export const getMyBookings = async (params = {}) => {
  const { userId, page = 0, size = 10, status } = params;
  // Backend endpoint /bookings/user/{userId}
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  console.log('User from localStorage:', user);
  const id = userId || user.id || user._id || user.userId;
  console.log('Extracted user ID:', id);

  if (!id) {
    console.error('User object:', user);
    throw new Error('User ID not found in localStorage');
  }

  // Build query params - only include status if provided
  const queryParams = { page, size };
  if (status) {
    queryParams.status = status;
  }

  console.log('Fetching bookings for user:', id, 'with params:', queryParams);
  const response = await api.get(`/bookings/user/${id}`, {
    params: queryParams
  });

  return response.data;
};

export const getBookingHistory = async (params = {}) => {
  const { page = 0, size = 10 } = params;
  const response = await api.get('/bookings/history', {
    params: { page, size }
  });
  return response.data;
};

export const getBookingById = async (id) => {
  // Backend uses /bookings/bookingById/{id}
  const response = await api.get(`/bookings/bookingById/${id}`);
  return response.data;
};

export const cancelBooking = async (id, cancelReason) => {
  const response = await api.delete(`/bookings/${id}`, {
    params: { cancelReason }
  });
  return response.data;
};

export const checkAvailability = async (bookingData) => {
  // Backend has /bookings/avail/confirm
  const response = await api.post('/bookings/avail/confirm', bookingData);
  return response.data;
};
