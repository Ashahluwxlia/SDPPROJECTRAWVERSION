// First, let's define proper types for our Task interface
export interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'to-do' | 'in-progress' | 'completed';
  tags: string[];
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  assignedTo: string;
  createdBy: string;
  comments: Comment[];
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}