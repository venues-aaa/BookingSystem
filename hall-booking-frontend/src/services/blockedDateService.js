import api from './api';

const blockedDateService = {
    // Create a new blocked date range
    createBlockedDate: async (blockedDateData, vendorId) => {
        try {
            const response = await api.post(`/api/vendor/blocked-dates?vendorId=${vendorId}`, blockedDateData);
            return response.data;
        } catch (error) {
            throw error.response?.data?.error || 'Failed to create blocked date';
        }
    },

    // Get all blocked dates for a vendor
    getVendorBlockedDates: async (vendorId) => {
        try {
            const response = await api.get(`/api/vendor/blocked-dates?vendorId=${vendorId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data?.error || 'Failed to fetch blocked dates';
        }
    },

    // Get blocked dates for a specific item
    getItemBlockedDates: async (itemId) => {
        try {
            const response = await api.get(`/api/items/${itemId}/blocked-dates`);
            return response.data;
        } catch (error) {
            throw error.response?.data?.error || 'Failed to fetch item blocked dates';
        }
    },

    // Check if dates are available for an item
    checkAvailability: async (itemId, startDate, endDate) => {
        try {
            const response = await api.get(
                `/api/items/${itemId}/availability?startDate=${startDate}&endDate=${endDate}`
            );
            return response.data;
        } catch (error) {
            throw error.response?.data?.error || 'Failed to check availability';
        }
    },

    // Delete a blocked date
    deleteBlockedDate: async (id, vendorId) => {
        try {
            const response = await api.delete(`/api/vendor/blocked-dates/${id}?vendorId=${vendorId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data?.error || 'Failed to delete blocked date';
        }
    }
};

export default blockedDateService;
