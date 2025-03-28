import api from './api';
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
  const response = await api.get('/users/me');
  return response.data;
};

export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', data);
  // Ensure token is properly extracted from response
  if (response.data && !response.data.token && response.data.id) {
    // Handle C# backend response format
    return {
      user: response.data,
      token: response.data.id.toString() // Using ID as token as in Program.cs
    };
  }
  return response.data;
};

export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
  // Map to the format expected by the C# backend
  const backendData = {
    fullName: data.fullName,
    email: data.email,
    password: data.password,
    role: data.role
  };
  
  const response = await api.post('/auth/register', backendData);
  
  // Handle different response formats between Node.js and C# backends
  if (response.data && !response.data.token && response.data.id) {
    // Handle C# backend response format
    return {
      user: response.data,
      token: response.data.id.toString() // Using ID as token as in Program.cs
    };
  }
  
  return response.data;
};

export const logoutUser = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const updateUserProfile = async (formData: FormData): Promise<User> => {
  const response = await api.put('/users/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  await api.put('/users/password', {
    currentPassword,
    newPassword
  });
};

export const refreshUserToken = async (): Promise<{ token: string }> => {
  const response = await api.post('/auth/refresh');
  return response.data;
};

export const resetPassword = async (email: string): Promise<void> => {
  await api.post('/reset-password', { email });
};