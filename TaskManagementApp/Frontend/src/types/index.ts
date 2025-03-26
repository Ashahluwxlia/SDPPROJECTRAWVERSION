export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  register: (email: string, password: string, fullName: string, role: UserRole) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (formData: FormData) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshToken: () => Promise<void>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  profilePicture?: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
  recentActivity?: UserActivity[];
}

export type UserRole = 'user' | 'manager' | 'admin';
export type UserStatus = 'active' | 'inactive' | 'pending';

export interface UserPreferences {
  emailNotifications: boolean;
  darkMode: boolean;
  taskReminders: boolean;
  language: string;
  timezone: string;
}

export interface UserActivity {
  id: string;
  description: string;
  date: string;
  type: 'task' | 'login' | 'profile' | 'other';
  relatedItemId?: string;
}

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  register: (email: string, password: string, fullName: string, role: UserRole) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (formData: FormData) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshToken: () => Promise<void>;
}

export type RecurringPattern = 'daily' | 'weekly' | 'biweekly' | 'monthly';

// Remove duplicate interfaces and consolidate them
export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'to-do' | 'in-progress' | 'completed';
  tags: string[];
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  createdBy: string;
  assignedTo: string;
  comments?: Comment[];
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  taskId: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  taskId: string;
  uploadedBy: string;
  createdAt: string;
}