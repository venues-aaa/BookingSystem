import api from './api';

// Get vendor's halls
export const getVendorHalls = async (params = {}) => {
  const { vendorId, page = 0, size = 10, sortBy = 'createdOn' } = params;

  // Get vendorId from localStorage if not provided
  let id = vendorId;
  if (!id) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    id = user.id || user._id;
    if (!id) throw new Error('Vendor ID not found');
  }

  // Backend uses GET /item/vendor/{vendorId}
  const response = await api.get(`/item/vendor/${id}`, {
    params: { page, size, sortBy }
  });
  return response.data;
};

// Toggle vendor's hall active status
export const toggleVendorHallStatus = async (id, currentStatus, fullItemData) => {
  // Backend doesn't have toggle endpoint, use update with full item data
  // We need to send the complete item object to avoid setting other fields to null
  const response = await api.put('/item/update', {
    ...fullItemData, // Keep all existing fields
    status: currentStatus === 'Active' ? 'Inactive' : 'Active'
  });
  return response.data;
};

// NOTE: Create, update, and delete operations now use hallService
// This keeps the code DRY and ensures consistency between admin and vendor
