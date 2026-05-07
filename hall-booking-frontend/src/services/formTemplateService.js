import api from './api';

/**
 * Form Template Service
 *
 * Handles all API calls related to form templates - saving, loading, and managing
 * reusable form designs.
 */

const BASE_URL = '/api/form-templates';

/**
 * Get all active templates
 */
export const getAllTemplates = async () => {
  const response = await api.get(BASE_URL);
  return response.data.data;
};

/**
 * Get templates by category
 */
export const getTemplatesByCategory = async (category) => {
  const response = await api.get(`${BASE_URL}/category/${category}`);
  return response.data.data;
};

/**
 * Get popular templates
 */
export const getPopularTemplates = async (limit = 5) => {
  const response = await api.get(`${BASE_URL}/popular?limit=${limit}`);
  return response.data.data;
};

/**
 * Search templates
 */
export const searchTemplates = async (query) => {
  const response = await api.get(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
  return response.data.data;
};

/**
 * Get template by ID
 */
export const getTemplateById = async (templateId) => {
  const response = await api.get(`${BASE_URL}/${templateId}`);
  return response.data.data;
};

/**
 * Create a new template
 */
export const createTemplate = async (templateData) => {
  const response = await api.post(BASE_URL, templateData);
  return response.data.data;
};

/**
 * Update an existing template
 */
export const updateTemplate = async (templateId, templateData) => {
  const response = await api.put(`${BASE_URL}/${templateId}`, templateData);
  return response.data.data;
};

/**
 * Apply a template (get schema and increment usage)
 */
export const applyTemplate = async (templateId) => {
  const response = await api.post(`${BASE_URL}/${templateId}/apply`);
  return response.data.data;
};

/**
 * Delete a template
 */
export const deleteTemplate = async (templateId) => {
  const response = await api.delete(`${BASE_URL}/${templateId}`);
  return response.data;
};
