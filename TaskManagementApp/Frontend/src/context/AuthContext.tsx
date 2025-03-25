import { useState, useEffect } from 'react';
import { getCurrentUser, loginUser, logoutUser, registerUser } from '../services/authService';
import { AuthContext, User } from './AuthContextTypes';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        const user = await getCurrentUser();
        setCurrentUser(user);
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
      const user = await loginUser({ email, password });
      setCurrentUser(user);
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const user = await registerUser({ fullName, email, password });  // Changed from name to fullName
      setCurrentUser(user);
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
    } catch (err) {
      console.error('Logout error:', err);
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
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};