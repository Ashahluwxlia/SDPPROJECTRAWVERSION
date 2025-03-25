import { createContext } from 'react';

export interface User {
  id: string;
  fullName: string;  // Changed from name to fullName
  email: string;
  role: string;
  createdAt?: string;
}

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;  // Changed parameter name
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);