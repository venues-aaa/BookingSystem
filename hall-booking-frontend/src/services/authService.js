import api from './api';

export const register = async (userData) => {
  // Backend expects: firstName, lastName, emailId, password, phoneNumber
  const response = await api.post('/api/user/create', {
    emailId: userData.email || userData.emailId,
    password: userData.password,
    details: {
      firstName: userData.firstName,
      lastName: userData.lastName,
      phoneNumber: userData.phoneNumber,
      role: 'USER'
    }
  });
  return response.data;
};

export const login = async (credentials) => {
  // Backend expects: emailId and password
  const response = await api.post('/api/user/validate', {
    emailId: credentials.usernameOrEmail || credentials.emailId || credentials.email,
    password: credentials.password
  });
  console.log('Raw API response:', response);
  console.log('Response data:', response.data);
  return response.data;
};

export const getCurrentUser = async () => {
  // Get user from localStorage since backend doesn't have /auth/me
  const user = localStorage.getItem('user');
  if (user) {
    return JSON.parse(user);
  }
  throw new Error('No user found');
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
