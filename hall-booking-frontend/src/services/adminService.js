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

// Admin Hall Management
export const toggleHallStatus = async (id) => {
  const response = await api.patch(`/admin/halls/${id}/toggle-status`);
  return response.data;
};

export const getAdminHalls = async (params = {}) => {
  const { page = 0, size = 10, name, capacity, location, createdById, isActive, sortBy = 'id', sortDirection = 'asc' } = params;
  const response = await api.get('/admin/halls', {
    params: { page, size, name, capacity, location, createdById, isActive, sortBy, sortDirection }
  });
  return response.data;
};

// User Management APIs
export const createUser = async (userData) => {
  const response = await api.post('/admin/users', userData);
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/admin/users/${id}`);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`/admin/users/${id}`, userData);
  return response.data;
};

export const toggleUserStatus = async (id) => {
  const response = await api.patch(`/admin/users/${id}/toggle-status`);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};
