import api from './api';

export const notificationService = {
  getAll: () => api.get('/v1/notifications'),
  markRead: (id) => api.put(`/v1/notifications/${id}/read`),
};
