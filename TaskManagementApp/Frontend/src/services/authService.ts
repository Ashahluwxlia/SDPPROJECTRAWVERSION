import axios from 'axios';
import api from './api';  // Add this import

const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5241'; // Update port to match backend

export interface User {
  id: string;
  fullName: string;  // Ensure this matches the AuthContextTypes
  email: string;
  role: 'admin' | 'manager' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;  // Changed from name to fullName
  email: string;
  password: string;
}

// Register a new user
export const registerUser = async (userData: RegisterData): Promise<User> => {
  const response = await api.post('/auth/register', userData);
  return response.data;  // Ensure response includes fullName
};

// Remove the duplicate loginUser function
export const loginUser = async (credentials: LoginCredentials): Promise<User> => {
  try {
    const response = await api.post('/auth/login', credentials);
    const userData = response.data;
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Update logoutUser function
export const logoutUser = async (): Promise<void> => {
  await api.post('/auth/logout');
  localStorage.removeItem('user');
};

// Update getCurrentUser function
export const getCurrentUser = async (): Promise<User | null> => {
  const user = localStorage.getItem('user');
  if (!user) return null;
  return JSON.parse(user);
};

// Update user profile
export const updateUserProfile = async (userId: string, userData: Partial<User>): Promise<User> => {
  const response = await axios.put(`${API_URL}/users/${userId}`, userData, {
    withCredentials: true
  });
  return response.data.user;
};

// Change password
export const changePassword = async (userId: string, currentPassword: string, newPassword: string): Promise<void> => {
  await axios.put(`${API_URL}/users/${userId}/password`, {
    currentPassword,
    newPassword
  }, {
    withCredentials: true
  });
};

// Request password reset
export const requestPasswordReset = async (email: string): Promise<void> => {
  await axios.post(`${API_URL}/auth/reset-password`, { email });
};

// Reset password with token
export const resetPassword = async (token: string, password: string): Promise<void> => {
  await axios.post(`${API_URL}/auth/reset-password/${token}`, { password });
};