import api from './api';

export const getHalls = async (params = {}) => {
  const { page = 0, size = 12, capacity, location, amenities, sortBy = 'id' } = params;
  const response = await api.get('/halls', {
    params: { page, size, capacity, location, amenities, sortBy }
  });
  return response.data;
};

export const getHallById = async (id) => {
  const response = await api.get(`/halls/${id}`);
  return response.data;
};

export const searchHalls = async (searchParams) => {
  const response = await api.get('/halls', { params: searchParams });
  return response.data;
};

// Admin operations
export const createHall = async (hallData) => {
  const response = await api.post('/admin/halls', hallData);
  return response.data;
};

export const updateHall = async (id, hallData) => {
  const response = await api.put(`/admin/halls/${id}`, hallData);
  return response.data;
};

export const deleteHall = async (id) => {
  const response = await api.delete(`/admin/halls/${id}`);
  return response.data;
};
