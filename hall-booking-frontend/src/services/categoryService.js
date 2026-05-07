import api from './api';

/**
 * Category Service - API calls for category management
 *
 * Handles all category-related API operations including CRUD operations
 * and form schema management.
 */

/**
 * Create a new category (Admin only)
 * @param {Object} category - Category data with formSchema
 * @returns {Promise<Object>} Created category
 */
export const createCategory = async (category) => {
  const response = await api.post('/api/categories', category);
  return response.data;
};

/**
 * Update an existing category and its form schema (Admin only)
 * @param {string} id - Category ID
 * @param {Object} category - Updated category data
 * @returns {Promise<Object>} Updated category
 */
export const updateCategory = async (id, category) => {
  const response = await api.put(`/api/categories/${id}`, category);
  return response.data;
};

/**
 * Get all active categories (Public)
 * @returns {Promise<Array>} List of active categories
 */
export const getCategories = async () => {
  const response = await api.get('/api/categories');
  return response.data;
};

/**
 * Get all categories including inactive (Admin only)
 * @returns {Promise<Array>} List of all categories
 */
export const getAllCategories = async () => {
  const response = await api.get('/api/categories/all');
  return response.data;
};

/**
 * Get category by ID (Public)
 * @param {string} id - Category ID
 * @returns {Promise<Object>} Category with form schema
 */
export const getCategoryById = async (id) => {
  const response = await api.get(`/api/categories/${id}`);
  return response.data;
};

/**
 * Get category by name (Public)
 * @param {string} name - Category name
 * @returns {Promise<Object>} Category with form schema
 */
export const getCategoryByName = async (name) => {
  const response = await api.get(`/api/categories/by-name/${name}`);
  return response.data;
};

/**
 * Deactivate a category (soft delete - marks as inactive) (Admin only)
 * @param {string} id - Category ID
 * @returns {Promise<Object>} Success message
 */
export const deactivateCategory = async (id) => {
  const response = await api.put(`/api/categories/${id}/deactivate`);
  return response.data;
};

/**
 * Delete a category permanently (hard delete) (Admin only)
 * Can only delete if category has no items
 * @param {string} id - Category ID
 * @returns {Promise<Object>} Success message
 */
export const deleteCategory = async (id) => {
  const response = await api.delete(`/api/categories/${id}`);
  return response.data;
};

/**
 * Validate item data against category schema (Public - for client-side validation)
 * @param {string} categoryId - Category ID
 * @param {Object} data - Data to validate
 * @returns {Promise<Object>} Validation result {valid: boolean, errors: {}}
 */
export const validateItemData = async (categoryId, data) => {
  const response = await api.post(`/api/categories/${categoryId}/validate`, data);
  return response.data;
};

/**
 * Get category statistics (Admin only)
 * @param {string} id - Category ID
 * @returns {Promise<Object>} Category statistics
 */
export const getCategoryStats = async (id) => {
  const response = await api.get(`/api/categories/${id}/stats`);
  return response.data;
};
