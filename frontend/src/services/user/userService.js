import axiosInstance from '../../api/config/axiosConfig';
import { API_ENDPOINTS } from '../../api/endpoints/index';

export const userService = {
  // Get current user profile
  getProfile: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data) => {
    const response = await axiosInstance.put('/auth/me', data);
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await axiosInstance.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await axiosInstance.post('/auth/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Delete avatar
  deleteAvatar: async () => {
    const response = await axiosInstance.delete('/auth/delete-avatar');
    return response.data;
  },

  // Get user activities
  getActivities: async (params = {}) => {
    const response = await axiosInstance.get('/activities/user', { params });
    return response.data;
  },

  // Get user activity statistics
  getActivityStats: async () => {
    const response = await axiosInstance.get('/activities/user/stats');
    return response.data;
  },

  // Search users (for project team management)
  searchUsers: async (query, params = {}) => {
    const searchParams = { ...params, search: query };
    const response = await axiosInstance.get('/users/search', { params: searchParams });
    return response.data;
  },

  // Get user preferences
  getPreferences: async () => {
    const response = await axiosInstance.get('/users/preferences');
    return response.data;
  },

  // Update user preferences
  updatePreferences: async (preferences) => {
    const response = await axiosInstance.put('/users/preferences', preferences);
    return response.data;
  },

  // Get user notifications
  getNotifications: async (params = {}) => {
    const response = await axiosInstance.get('/users/notifications', { params });
    return response.data;
  },

  // Mark notification as read
  markNotificationRead: async (notificationId) => {
    const response = await axiosInstance.put(`/users/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllNotificationsRead: async () => {
    const response = await axiosInstance.put('/users/notifications/read-all');
    return response.data;
  }
};
