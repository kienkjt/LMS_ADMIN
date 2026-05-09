import api from './api';

export const orderService = {
  /**
   * Create/checkout an order from cart
   * @param {object} data - Checkout data { paymentMethod, note? }
   * @returns Response with OrderResponseDto
   */
  checkout: async (data) => {
    try {
      console.log('[orderService.checkout] Creating order');
      const response = await api.post('/api/v1/orders/checkout', {
        paymentMethod: data.paymentMethod, // VNPAY, BANK_TRANSFER, FREE
        note: data.note || '',
      });
      const order = response.data?.data || response.data;
      console.log('[orderService.checkout] Success:', order.id);
      return { data: order };
    } catch (error) {
      console.error('[orderService.checkout] Error:', error);
      throw error;
    }
  },

  /**
   * Pay for an order
   * @param {string} orderId - Order ID
   * @param {object} data - Payment data { transactionId }
   * @returns Response with OrderResponseDto
   */
  payOrder: async (orderId, data) => {
    try {
      console.log('[orderService.payOrder] Paying for order:', orderId);
      const response = await api.post(`/api/v1/orders/${orderId}/pay`, {
        transactionId: data.transactionId,
      });
      const order = response.data?.data || response.data;
      console.log('[orderService.payOrder] Success');
      return { data: order };
    } catch (error) {
      console.error('[orderService.payOrder] Error:', error);
      throw error;
    }
  },

  /**
   * Cancel an order (only for PENDING orders)
   * @param {string} orderId - Order ID
   * @returns Response with OrderResponseDto
   */
  cancelOrder: async (orderId) => {
    try {
      console.log('[orderService.cancelOrder] Cancelling order:', orderId);
      const response = await api.post(`/api/v1/orders/${orderId}/cancel`);
      const order = response.data?.data || response.data;
      console.log('[orderService.cancelOrder] Success');
      return { data: order };
    } catch (error) {
      console.error('[orderService.cancelOrder] Error:', error);
      throw error;
    }
  },

  /**
   * Refund an order (only for COMPLETED orders)
   * @param {string} orderId - Order ID
   * @returns Response with OrderResponseDto
   */
  refundOrder: async (orderId) => {
    try {
      console.log('[orderService.refundOrder] Refunding order:', orderId);
      const response = await api.post(`/api/v1/orders/${orderId}/refund`);
      const order = response.data?.data || response.data;
      console.log('[orderService.refundOrder] Success');
      return { data: order };
    } catch (error) {
      console.error('[orderService.refundOrder] Error:', error);
      throw error;
    }
  },

  /**
   * Get a specific order by ID
   * @param {string} orderId - Order ID
   * @returns Response with OrderResponseDto
   */
  getOrder: async (orderId) => {
    try {
      console.log('[orderService.getOrder] Fetching order:', orderId);
      const response = await api.get(`/api/v1/orders/${orderId}`);
      const order = response.data?.data || response.data;
      console.log('[orderService.getOrder] Success');
      return { data: order };
    } catch (error) {
      console.error('[orderService.getOrder] Error:', error);
      throw error;
    }
  },

  /**
   * Get all orders for current user
   * @param {object} params - Pagination params { page, size }
   * @returns Response with paginated list of OrderResponseDto
   */
  getMyOrders: async (params) => {
    try {
      const page = params?.page || 0; // Backend uses 0-based indexing for orders
      const size = params?.size || 10;
      console.log('[orderService.getMyOrders] Fetching orders');
      const response = await api.get(`/api/v1/orders/my-orders?page=${page}&size=${size}`);
      
      // Backend may return list directly or paginated response
      const data = response.data?.data || response.data;
      const orders = Array.isArray(data) ? data : (data?.content || []);
      
      console.log('[orderService.getMyOrders] Success, found:', orders.length);
      return { 
        data: Array.isArray(data) ? orders : { content: orders, totalElements: data?.totalElements || orders.length } 
      };
    } catch (error) {
      console.error('[orderService.getMyOrders] Error:', error);
      throw error;
    }
  },
};
