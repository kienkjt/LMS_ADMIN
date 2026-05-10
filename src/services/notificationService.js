import api from './api';

export const notificationService = {
  getMyNotifications: (page = 0, size = 10) => api.get('/v1/notifications', { params: { page, size } }),
  getUnreadCount: () => api.get('/v1/notifications/unread-count'),
  markAsRead: (id) => api.post(`/v1/notifications/${id}/read`),
  markAllAsRead: () => api.post('/v1/notifications/read-all'),
  createNotification: (data) => api.post('/v1/notifications', data),
};
