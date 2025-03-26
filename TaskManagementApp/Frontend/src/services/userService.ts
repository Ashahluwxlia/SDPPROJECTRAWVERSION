import api from './api';

export const userService = {
  updateProfile: async (userData: FormData) => {
    const response = await api.put('/users/profile', userData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updatePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.put('/users/password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  updatePreferences: async (preferences: any) => {
    const response = await api.put('/users/preferences', preferences);
    return response.data;
  },

  getActivityHistory: async () => {
    const response = await api.get('/users/activity');
    return response.data;
  },
};