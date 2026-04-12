import axios from 'axios';

// Base URL without /api prefix since backend endpoints have different paths
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - JWT disabled, using session-based auth
api.interceptors.request.use(
  (config) => {
    // Backend doesn't use JWT tokens currently
    // Session management is handled by user ID in localStorage
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        // Add user ID to request params for endpoints that need it
        if (userData.id && !config.params) {
          config.params = {};
        }
        if (userData.id && config.params) {
          config.params.userId = userData.id;
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Don't redirect on auth endpoints
      if (!error.config.url.includes('/api/user/validate') &&
          !error.config.url.includes('/api/user/create')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
