import api from './api';

/**
 * Generic Item Service - Works for ALL categories
 * Schema-driven, no hardcoded category names or types
 *
 * This service replaces hallService.js and provides generic
 * operations for items of any category (Hall, Catering, Decoration, etc.)
 */

/**
 * Fetch items for a specific category
 * @param {string} categoryName - Category name from ItemType.name
 * @param {Object} params - Pagination and filter params
 * @returns {Promise<Object>} Response with items array and pagination info
 */
export const getItemsByCategory = async (categoryName, params = {}) => {
  const { page = 0, size = 12, sortBy = 'createdOn' } = params;

  const response = await api.post('/item/fetch',
    { type: categoryName }, // Category name from database
    { params: { page, size, sortBy } }
  );

  return response.data;
};

/**
 * Get item by ID (generic for all categories)
 * @param {string} itemId - Item ID
 * @returns {Promise<Object>} Item data
 */
export const getItemById = async (itemId) => {
  const response = await api.get(`/item/${itemId}`);
  return response.data.data || response.data;
};

/**
 * Create item (vendor)
 * @param {string} categoryId - Category ID
 * @param {Object} dynamicData - Data matching category's formSchema
 * @param {Object} category - Category object with name
 * @returns {Promise<Object>} Created item
 */
export const createItem = async (categoryId, dynamicData, category) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const itemData = {
    categoryId,
    type: category.name, // Category name, not hardcoded
    vendorId: user.id || 'default-vendor',
    placeId: 'default-place',
    dynamicData, // Schema-driven data
    status: 'Active'
  };

  console.log('=== Creating Item ===');
  console.log('Category ID:', categoryId);
  console.log('Category Name:', category.name);
  console.log('Dynamic Data:', JSON.stringify(dynamicData, null, 2));
  console.log('Full Item Data:', JSON.stringify(itemData, null, 2));
  console.log('===================');

  const response = await api.post('/item/create', itemData);
  return response.data;
};

/**
 * Update item (vendor)
 * @param {string} itemId - Item ID
 * @param {string} categoryId - Category ID
 * @param {Object} dynamicData - Updated data
 * @param {Object} category - Category object (for type)
 * @returns {Promise<Object>} Updated item
 */
export const updateItem = async (itemId, categoryId, dynamicData, category) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // CRITICAL: Include all required fields to prevent data loss
  // MongoDB's save() replaces the entire document, so we must send all fields
  const itemData = {
    categoryId,
    type: category.name, // Category name is required
    vendorId: user.id || 'default-vendor', // Must preserve vendorId
    placeId: 'default-place', // Must preserve placeId
    dynamicData,
    status: 'Active'
  };

  console.log('=== Updating Item ===');
  console.log('Item ID:', itemId);
  console.log('Category ID:', categoryId);
  console.log('Category Name (type):', category.name);
  console.log('Vendor ID:', user.id);
  console.log('Dynamic Data:', JSON.stringify(dynamicData, null, 2));
  console.log('===================');

  const response = await api.put(`/item/${itemId}`, itemData);
  return response.data;
};

/**
 * Delete item
 * - If no bookings: Permanently deletes the item
 * - If bookings exist: Throws error with hasBookings flag
 * @param {string} itemId - Item ID
 * @returns {Promise<Object>} Delete response
 * @throws {Error} With hasBookings flag if item has bookings
 */
export const deleteItem = async (itemId) => {
  const response = await api.delete(`/item/${itemId}`);
  return response.data;
};

/**
 * Deactivate item (soft delete)
 * Use this when item has existing bookings
 * @param {string} itemId - Item ID
 * @returns {Promise<Object>} Deactivate response
 */
export const deactivateItem = async (itemId) => {
  const response = await api.put(`/item/${itemId}/deactivate`);
  return response.data;
};

/**
 * Get vendor's items (all categories or filtered by category)
 * @param {string} vendorId - Vendor user ID
 * @param {string} categoryId - Optional category filter
 * @returns {Promise<Object>} Vendor's items
 */
export const getVendorItems = async (vendorId, categoryId = null) => {
  let url = `/item/vendor/${vendorId}`;
  if (categoryId) {
    url += `?categoryId=${categoryId}`;
  }

  const response = await api.get(url);
  return response.data;
};

/**
 * Search/filter items
 * @param {Object} searchParams - Search parameters
 * @returns {Promise<Object>} Filtered items
 */
export const searchItems = async (searchParams) => {
  const response = await api.post('/item/filter', searchParams);
  return response.data;
};

/**
 * Get schema-driven display name for an item
 * Checks dynamicData for common field patterns, then falls back to first text field
 * @param {Object} item - Item object
 * @returns {string} Display name
 */
export const getItemDisplayName = (item) => {
  if (!item) return 'Unknown Item';

  const dynamicData = item.dynamicData || {};

  // Priority 1: Check common naming patterns (schema-driven)
  const commonName = dynamicData.name ||
                     dynamicData.restaurant_name ||
                     dynamicData.service_name ||
                     dynamicData.field_hall_name ||
                     dynamicData.venue_name ||
                     dynamicData.company_name ||
                     dynamicData.business_name ||
                     item.details?.name;

  if (commonName && commonName.trim()) {
    return commonName.trim();
  }

  // Priority 2: Search for any field with "name" in the key (case-insensitive)
  const nameKeys = Object.keys(dynamicData).filter(key =>
    key.toLowerCase().includes('name') && dynamicData[key]
  );

  if (nameKeys.length > 0 && dynamicData[nameKeys[0]]) {
    const value = dynamicData[nameKeys[0]];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  // Priority 3: Use the first text field value (likely the primary identifier)
  const firstTextField = Object.keys(dynamicData).find(key => {
    const value = dynamicData[key];
    return typeof value === 'string' &&
           value.trim() &&
           !key.toLowerCase().includes('description') &&
           !key.toLowerCase().includes('image') &&
           !key.toLowerCase().includes('photo') &&
           !key.toLowerCase().includes('url') &&
           !Array.isArray(value);
  });

  if (firstTextField && dynamicData[firstTextField]) {
    return dynamicData[firstTextField].trim();
  }

  // Last resort: Unnamed Item
  return 'Unnamed Item';
};

/**
 * Get schema-driven description for an item
 * @param {Object} item - Item object
 * @returns {string} Description
 */
export const getItemDescription = (item) => {
  if (!item) return '';

  const dynamicData = item.dynamicData || {};

  return dynamicData.description ||
         dynamicData.field_hall_description ||
         dynamicData.service_description ||
         item.details?.description ||
         '';
};

/**
 * Get schema-driven capacity for an item
 * @param {Object} item - Item object
 * @returns {number|null} Capacity
 */
export const getItemCapacity = (item) => {
  if (!item) return null;

  const dynamicData = item.dynamicData || {};

  const capacity = dynamicData.capacity ||
                   dynamicData.maximum_capacity ||
                   dynamicData.field_hall_capacity ||
                   dynamicData.seating_capacity ||
                   item.details?.qtyAvailable;

  return capacity ? parseInt(capacity) : null;
};

/**
 * Get schema-driven price for an item
 * Checks dynamicData for common price patterns, then falls back to first numeric field
 * @param {Object} item - Item object
 * @returns {number|null} Price
 */
export const getItemPrice = (item) => {
  if (!item) return null;

  const dynamicData = item.dynamicData || {};

  // Priority 1: Check common price patterns
  const commonPrice = dynamicData.price ||
                      dynamicData.price_per_person ||
                      dynamicData.field_hall_price ||
                      dynamicData.base_price ||
                      dynamicData.rate ||
                      dynamicData.cost ||
                      dynamicData.amount ||
                      item.price?.baseRate;

  if (commonPrice && !isNaN(parseFloat(commonPrice))) {
    return parseFloat(commonPrice);
  }

  // Priority 2: Search for any field with price-related keywords (case-insensitive)
  const priceKeywords = ['price', 'cost', 'rate', 'amount', 'fee', 'charge'];
  const priceKeys = Object.keys(dynamicData).filter(key => {
    const lowerKey = key.toLowerCase();
    return priceKeywords.some(keyword => lowerKey.includes(keyword)) &&
           dynamicData[key] &&
           !isNaN(parseFloat(dynamicData[key]));
  });

  if (priceKeys.length > 0 && dynamicData[priceKeys[0]]) {
    const value = dynamicData[priceKeys[0]];
    if (!isNaN(parseFloat(value))) {
      return parseFloat(value);
    }
  }

  // Priority 3: Use the first numeric field (likely a price/rate)
  const firstNumericField = Object.keys(dynamicData).find(key => {
    const value = dynamicData[key];
    return typeof value === 'number' ||
           (typeof value === 'string' && !isNaN(parseFloat(value)) && value.trim());
  });

  if (firstNumericField && dynamicData[firstNumericField]) {
    const value = dynamicData[firstNumericField];
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
};

/**
 * Get schema-driven location for an item
 * @param {Object} item - Item object
 * @returns {string} Location
 */
export const getItemLocation = (item) => {
  if (!item) return '';

  const dynamicData = item.dynamicData || {};

  return dynamicData.location ||
         dynamicData.field_hall_location ||
         dynamicData.address ||
         dynamicData.field_hall_address ||
         item.details?.address ||
         '';
};

/**
 * Get item image URL (exported for backward compatibility)
 * Prefer using imageUtils.getItemImage() directly for better control
 */
export { getItemImage, getItemImages } from '../utils/imageUtils';
