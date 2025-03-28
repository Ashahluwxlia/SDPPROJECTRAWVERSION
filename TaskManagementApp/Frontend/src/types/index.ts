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
  id: number;
  email: string;
  name: string; // Maps to FullName in C# model
  role: UserRole;
  status?: UserStatus; // Optional as it doesn't exist in backend models
  profilePicture?: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt?: string; // Optional as it might be null
  recentActivity?: UserActivity[];
}

export type UserRole = 'user' | 'manager' | 'admin'; // Note: Backend models have different role implementations
export type UserStatus = 'active' | 'inactive' | 'pending';

export interface UserPreferences {
  emailNotifications: boolean;
  darkMode: boolean;
  taskReminders: boolean;
  language: string;
  timezone: string;
}

export interface UserActivity {
  id: number; // Changed to match backend Activity model which uses numeric IDs
  userId: number; // Added to match backend model which requires userId
  description: string;
  date: string; // Backend uses createdAt timestamp
  type: 'task' | 'login' | 'profile' | 'other'; // This matches backend enum
  relatedItemId?: string;
}

export type RecurringPattern = 'daily' | 'weekly' | 'biweekly' | 'monthly';

// Remove duplicate interfaces and consolidate them
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'to-do' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  createdBy: string | number;
  assignedTo?: string | number;
  createdAt: string;
  updatedAt?: string;
  tags?: string[];
  comments?: Comment[];
  attachments?: Attachment[];
}

export interface Comment {
  id: string;
  text: string;  // Ensure this matches the taskservice definition
  userId: string;
  userName?: string;  // Made optional for flexibility
  createdAt: string;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  taskId: string;  // Required in most contexts
  uploadedBy: string;  // Required in most contexts
  createdAt: string;
}