import { useState, useEffect, createContext, useContext } from 'react';
import { User } from '../types';
import api from '../services/api';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<User>('/users/login', { email, password });
      setCurrentUser(response.data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to login');
    }
  };

  const logout = async () => {
    try {
      const response = await api.post('/users/logout');
      setCurrentUser(response.data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to logout');
    }
  };

  const updateUserProfile = async (formData: FormData) => {
    try {
      const response = await api.put('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setCurrentUser(response.data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update profile');
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await api.put('/users/password', { currentPassword, newPassword });
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update password');
    }
  };

  return {
    currentUser,
    login,
    logout,
    updateUserProfile,
    updatePassword,
  };
};