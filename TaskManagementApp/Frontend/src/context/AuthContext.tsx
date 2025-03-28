import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { 
  getCurrentUser, 
  loginUser, 
  logoutUser, 
  registerUser, 
  changePassword, 
  updateUserProfile as updateUserProfileAPI,
  refreshUserToken 
} from '../services/authService';
import type { User, UserRole, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: false,
  error: null,
  register: async () => {},
  login: async () => {},
  logout: async () => {},
  updateUserProfile: async () => {},
  updatePassword: async () => {},
  refreshToken: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        const userData = await getCurrentUser();
        const defaultPreferences = {
          emailNotifications: true,
          darkMode: false,
          taskReminders: true,
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        setCurrentUser({
          id: userData.id,
          name: userData.name || '',
          email: userData.email,
          role: userData.role,
          status: userData.status || 'active',
          profilePicture: userData.profilePicture,
          preferences: userData.preferences || defaultPreferences,
          createdAt: userData.createdAt || new Date().toISOString(),
          updatedAt: userData.updatedAt || new Date().toISOString(),
          recentActivity: userData.recentActivity || []
        } as User);
      } catch (err) {
        console.error('Failed to fetch current user:', err);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { user, token } = await loginUser({ email, password });
      setCurrentUser(user); // Ensure 'user' is of type 'User'
      if (token) {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string, role: UserRole) => {
    try {
      setLoading(true);
      setError(null);
      const { user, token } = await registerUser({ fullName, email, password, role });
      setCurrentUser(user);
      if (token) {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await logoutUser();
      setCurrentUser(null);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (formData: FormData) => {
    try {
      setLoading(true);
      const updatedUserData = await updateUserProfileAPI(formData);
      setCurrentUser({
        ...updatedUserData,
        name: updatedUserData.name || currentUser?.name || '',
        status: updatedUserData.status || 'active',
        role: updatedUserData.role || currentUser?.role || 'user',
        preferences: {
          ...currentUser?.preferences,
          ...updatedUserData.preferences
        },
        createdAt: updatedUserData.createdAt || currentUser?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as User);
    } catch (err) {
      console.error('Update profile error:', err);
      setError('Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setLoading(true);
      await changePassword(currentPassword, newPassword);
    } catch (err) {
      console.error('Update password error:', err);
      setError('Failed to update password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      setLoading(true);
      const { token } = await refreshUserToken();
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (err) {
      console.error('Token refresh error:', err);
      setError('Failed to refresh token');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    updateUserProfile,
    updatePassword,
    refreshToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export the useAuth hook with proper typing
const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext, useAuth };
export default AuthContext;