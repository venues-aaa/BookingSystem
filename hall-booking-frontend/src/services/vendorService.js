import api from './api';

// Get vendor's halls
export const getVendorHalls = async (params = {}) => {
  const { page = 0, size = 10, sortBy = 'id' } = params;
  const response = await api.get('/vendor/halls', {
    params: { page, size, sortBy }
  });
  return response.data;
};

// Create hall as vendor
export const createVendorHall = async (hallData) => {
  const response = await api.post('/vendor/halls', hallData);
  return response.data;
};

// Update vendor's hall
export const updateVendorHall = async (id, hallData) => {
  const response = await api.put(`/vendor/halls/${id}`, hallData);
  return response.data;
};

// Toggle vendor's hall active status
export const toggleVendorHallStatus = async (id) => {
  const response = await api.patch(`/vendor/halls/${id}/toggle-status`);
  return response.data;
};

// Delete vendor's hall
export const deleteVendorHall = async (id) => {
  const response = await api.delete(`/vendor/halls/${id}`);
  return response.data;
};
