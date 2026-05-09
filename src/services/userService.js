import api from './api';

export const userService = {
  /**
   * Get user profile
   */
  getProfile: async () => {
    try {
      const response = await api.get('/api/v1/user/profile');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update user profile
   * @param {Object} data - Profile update data (fullName, gender, phoneNumber, bio)
   */
  updateProfile: async (data) => {
    try {
      const response = await api.put('/api/v1/user/profile', {
        fullName: data.fullName,
        gender: data.gender || null,
        phoneNumber: data.phoneNumber || null,
        bio: data.bio || null,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Change password
   * @param {Object} data - Password change data (currentPassword, newPassword, confirmNewPassword)
   */
  changePassword: async (data) => {
    try {
      const response = await api.post('/api/v1/user/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Upload avatar
   * @param {File} file - Avatar file
   */
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/api/v1/user/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete avatar
   */
  deleteAvatar: async () => {
    try {
      const response = await api.delete('/api/v1/user/avatar');
      return response;
    } catch (error) {
      throw error;
    }
  },
};
