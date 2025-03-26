import axios from 'axios';
import type { User, UserRole } from '../types';

interface AuthResponse {
  user: User;
  token: string;
}

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

interface LoginData {
  email: string;
  password: string;
}

export const getCurrentUser = async (): Promise<User> => {
  const response = await axios.get('/api/users/me');
  return response.data;
};

export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  const response = await axios.post('/api/auth/login', data);
  return response.data;
};

export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await axios.post('/api/auth/register', data);
  return response.data;
};

export const logoutUser = async (): Promise<void> => {
  await axios.post('/api/auth/logout');
};

export const updateUserProfile = async (formData: FormData): Promise<User> => {
  const response = await axios.put('/api/users/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  await axios.put(`/api/users/${userId}/password`, {
    currentPassword,
    newPassword
  });
};

export const refreshUserToken = async (): Promise<{ token: string }> => {
  const response = await axios.post('/api/auth/refresh');
  return response.data;
};

// Add this to your existing authService.ts
export const resetPassword = async (email: string): Promise<void> => {
  await axios.post('/api/auth/reset-password', { email });
};