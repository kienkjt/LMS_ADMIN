import api from './api';
import { mockCart, mockCourses } from '../utils/mockData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const cartService = {
  /**
   * Get current user's cart
   * @returns Response with CartResponseDto
   */
  getCart: async () => {
    try {
      console.log('[cartService.getCart] Fetching cart from backend');
      const response = await api.get('/api/v1/cart');
      const cart = response.data?.data || response.data;
      console.log('[cartService.getCart] Success');
      return { data: cart };
    } catch (error) {
      console.error('[cartService.getCart] API error, using mock data:', error);
      // Fallback to mock
      await delay(200);
      return { data: mockCart };
    }
  },

  /**
   * Add course to cart
   * @param {string} courseId - Course ID
   * @returns Response with CartResponseDto
   */
  addItem: async (courseId) => {
    try {
      console.log('[cartService.addItem] Adding course to cart:', courseId);
      const response = await api.post('/api/v1/cart/add', { courseId });
      const cart = response.data?.data || response.data;
      console.log('[cartService.addItem] Success');
      return { data: cart };
    } catch (error) {
      console.error('[cartService.addItem] API error, using mock data:', error);
      // Fallback to mock
      await delay(200);
      const course = mockCourses.find(c => c.id === courseId);
      if (!course) throw { response: { status: 404, data: { message: 'Khóa học không tìm thấy' } } };
      const exists = mockCart.some(item => item.courseId === courseId);
      if (exists) throw { response: { data: { message: 'Khóa học đã có trong giỏ hàng' } } };
      const cartItem = {
        id: `cart-${Date.now()}`,
        courseId,
        course,
        addedAt: new Date().toISOString().split('T')[0],
      };
      mockCart.push(cartItem);
      return { data: cartItem };
    }
  },

  /**
   * Remove item from cart
   * @param {string} cartItemId - Cart item ID
   * @returns Response with CartResponseDto
   */
  removeItem: async (cartItemId) => {
    try {
      console.log('[cartService.removeItem] Removing from cart:', cartItemId);
      const response = await api.delete(`/api/v1/cart/items/${cartItemId}`);
      const cart = response.data?.data || response.data;
      console.log('[cartService.removeItem] Success');
      return { data: cart };
    } catch (error) {
      console.error('[cartService.removeItem] API error, using mock data:', error);
      // Fallback to mock
      await delay(200);
      const index = mockCart.findIndex(item => item.id === cartItemId);
      if (index === -1) throw { response: { status: 404, data: { message: 'Khóa học không có trong giỏ hàng' } } };
      mockCart.splice(index, 1);
      return { data: { message: 'Xóa khỏi giỏ hàng thành công' } };
    }
  },

  /**
   * Clear entire cart
   * @returns Response
   */
  clearCart: async () => {
    try {
      console.log('[cartService.clearCart] Clearing cart');
      const response = await api.delete('/api/v1/cart/clear');
      console.log('[cartService.clearCart] Success');
      return { data: response.data?.data || response.data || { message: 'Xóa toàn bộ giỏ hàng thành công' } };
    } catch (error) {
      console.error('[cartService.clearCart] API error, using mock data:', error);
      // Fallback to mock
      await delay(200);
      mockCart.length = 0;
      return { data: { message: 'Xóa toàn bộ giỏ hàng thành công' } };
    }
  },
};
