import api from './api';

export const notificationService = {
  getAll: () => api.get('/api/v1/notifications'),
  markRead: (id) => api.put(`/api/v1/notifications/${id}/read`),
};
