import api from './api';

/**
 * Wishlist Service - Connect to real API endpoints
 */
export const wishlistService = {
  /**
   * Get user's wishlist
   * @returns {Promise} Response with wishlist items array
   */
  getWishlist: async (params = {}) => {
    try {
      const page = params.page || 1;
      const size = params.size || 10;
      console.log('[wishlistService.getWishlist] Fetching wishlist');
      const response = await api.get(`/api/v1/wishlist?page=${page}&size=${size}`);
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[wishlistService.getWishlist] Error:', error);
      throw error;
    }
  },

  /**
   * Add course to wishlist
   * @param {string} courseId - Course ID to add
   * @returns {Promise} Response with wishlist item
   */
  add: async (courseId) => {
    try {
      console.log('[wishlistService.add] Adding to wishlist:', courseId);
      const response = await api.post('/api/v1/wishlist/add', { courseId });
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[wishlistService.add] Error:', error);
      throw error;
    }
  },

  /**
   * Remove course from wishlist
   * @param {string} courseId - Course ID to remove
   * @returns {Promise} Response
   */
  remove: async (courseId) => {
    try {
      console.log('[wishlistService.remove] Removing from wishlist:', courseId);
      const response = await api.delete(`/api/v1/wishlist/${courseId}`);
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[wishlistService.remove] Error:', error);
      throw error;
    }
  },

  /**
   * Check if course is in wishlist
   * @param {Array} wishlistItems - Current wishlist items
   * @param {string} courseId - Course ID to check
   * @returns {boolean} True if course is in wishlist
   */
  isInWishlist: (wishlistItems, courseId) => {
    return wishlistItems?.some(item => item.courseId === courseId) || false;
  },
};
