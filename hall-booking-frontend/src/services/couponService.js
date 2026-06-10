import api from './api';

/**
 * Get all coupons for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} List of coupons
 */
export const getUserCoupons = async (userId) => {
  const response = await api.get(`/coupons/user/${userId}`);
  return response.data;
};

/**
 * Get valid coupons for a specific item and user
 * @param {string} itemId - Item ID
 * @param {string} userId - User ID
 * @returns {Promise<Array>} List of valid coupons
 */
export const getValidCouponsForItem = async (itemId, userId) => {
  const response = await api.get(`/coupons/item/${itemId}/user/${userId}`);
  return response.data;
};

/**
 * Validate a coupon code
 * @param {string} code - Coupon code
 * @param {string} userId - User ID
 * @param {string} itemId - Item ID
 * @param {string} bookingDate - Booking date in YYYY-MM-DD format (optional, for same-day validation)
 * @returns {Promise<Object>} Validation result with coupon data
 */
export const validateCoupon = async (code, userId, itemId, bookingDate = null) => {
  const response = await api.post('/coupons/validate', {
    code,
    userId,
    itemId,
    bookingDate
  });
  return response.data;
};

/**
 * Get coupons generated from a booking
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Array>} List of coupons
 */
export const getCouponsByBooking = async (bookingId) => {
  const response = await api.get(`/coupons/booking/${bookingId}`);
  return response.data;
};
