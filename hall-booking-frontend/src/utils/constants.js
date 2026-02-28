export const BOOKING_STATUS = {
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
};

export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
};

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  HALLS: '/halls',
  HALL_DETAILS: '/halls/:id',
  BOOKING: '/booking/:hallId',
  MY_BOOKINGS: '/my-bookings',
  PROFILE: '/profile',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_HALLS: '/admin/halls',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_USERS: '/admin/users',
};
