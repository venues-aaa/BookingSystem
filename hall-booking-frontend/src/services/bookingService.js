import api from './api';

export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

export const getMyBookings = async (params = {}) => {
  const { page = 0, size = 10, status } = params;
  const response = await api.get('/bookings/my-bookings', {
    params: { page, size, status }
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
  const response = await api.get(`/bookings/${id}`);
  return response.data;
};

export const cancelBooking = async (id) => {
  const response = await api.delete(`/bookings/${id}`);
  return response.data;
};
