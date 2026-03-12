import api from './api';

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const verifyOtp = async (otpData) => {
  const response = await api.post('/auth/verify-otp', otpData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/validateUser', credentials);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
