import api from './api';

export const getAllBookings = async (params = {}) => {
  const { page = 0, size = 10, hallId, userId, status } = params;
  const response = await api.get('/admin/bookings', {
    params: { page, size, hallId, userId, status }
  });
  return response.data;
};

export const getAllUsers = async (params = {}) => {
  const { page = 0, size = 10 } = params;
  const response = await api.get('/admin/users', {
    params: { page, size }
  });
  return response.data;
};

export const getStatistics = async () => {
  const response = await api.get('/admin/statistics');
  return response.data;
};
