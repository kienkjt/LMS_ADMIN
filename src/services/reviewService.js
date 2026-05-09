import api from './api';

export const reviewService = {
  /**
   * Create a review for a course
   * @param {object} data - Review data { courseId, rating, comment }
   * @returns Response with review data
   */
  create: async (data) => {
    try {
      console.log('[reviewService.create] Creating review');
      const response = await api.post('/api/v1/reviews', {
        courseId: data.courseId,
        rating: data.rating,
        comment: data.comment || '',
      });
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[reviewService.create] Error:', error);
      throw error;
    }
  },

  /**
   * Get reviews for a course
   * @param {string} courseId - Course ID
   * @param {object} params - Pagination params { page, size }
   * @returns Response with list of reviews
   */
  getByCourse: async (courseId, params) => {
    try {
      const page = params?.page || 1;
      const size = params?.size || 10;
      console.log('[reviewService.getByCourse] Fetching reviews for course:', courseId);
      const response = await api.get(`/api/v1/courses/${courseId}/reviews?page=${page}&size=${size}`);
      const data = response.data?.data || response.data;
      return { data: data };
    } catch (error) {
      console.error('[reviewService.getByCourse] Error:', error);
      throw error;
    }
  },

  /**
   * Get my review for a course
   * @param {string} courseId - Course ID
   * @returns Response with review data or null
   */
  getMyReview: async (courseId) => {
    try {
      console.log('[reviewService.getMyReview] Fetching my review for course:', courseId);
      const response = await api.get(`/api/v1/courses/${courseId}/my-review`);
      return { data: response.data?.data || response.data };
    } catch (error) {
      // If not found, it's not an error
      return { data: null };
    }
  },

  /**
   * Delete a review
   * @param {string} reviewId - Review ID
   * @returns Response
   */
  delete: async (reviewId) => {
    try {
      console.log('[reviewService.delete] Deleting review:', reviewId);
      const response = await api.delete(`/api/v1/reviews/${reviewId}`);
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[reviewService.delete] Error:', error);
      throw error;
    }
  },

  /**
   * Update a review
   * @param {string} reviewId - Review ID
   * @param {object} data - Update data { rating, comment }
   * @returns Response with updated review
   */
  update: async (reviewId, data) => {
    try {
      console.log('[reviewService.update] Updating review:', reviewId);
      const response = await api.put(`/api/v1/reviews/${reviewId}`, {
        rating: data.rating,
        comment: data.comment || '',
      });
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[reviewService.update] Error:', error);
      throw error;
    }
  },

  /**
   * Get course rating statistics
   * @param {string} courseId - Course ID
   * @returns Response with rating stats
   */
  getRatingStats: async (courseId) => {
    try {
      console.log('[reviewService.getRatingStats] Fetching stats for course:', courseId);
      const response = await api.get(`/api/v1/courses/${courseId}/rating-stats`);
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[reviewService.getRatingStats] Error:', error);
      throw error;
    }
  },
};
