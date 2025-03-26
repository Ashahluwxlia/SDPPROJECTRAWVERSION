export interface UserPreferences {
  emailNotifications: boolean;
  darkMode: boolean;
}

export interface UserActivity {
  id: string;
  description: string;
  date: string;
  type: 'task' | 'profile' | 'login' | 'other';
}