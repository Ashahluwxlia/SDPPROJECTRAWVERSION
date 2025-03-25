import api from './api';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'to-do' | 'in-progress' | 'completed';
  tags?: string[];
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  createdBy: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  comments?: {
    id: string;
    text: string;
    userId: string;
    createdAt: string;
  }[];
  attachments?: {
    id: string;
    name: string;
    url: string;
    createdAt: string;
  }[];
}

export interface Comment {
  id: string;
  text: string;
  createdBy: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  createdBy: string;
  createdAt: string;
}

export interface TaskHistoryEntry {
  id: string;
  taskId: string;
  changeType: 'created' | 'updated' | 'deleted';
  changes: Record<string, { oldValue: unknown; newValue: unknown }>;
  timestamp: string;
  userId: string;
}

export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get('/tasks');
  return response.data;
};

export const getTaskById = async (taskId: string): Promise<Task> => {
  const response = await api.get(`/tasks/${taskId}`);
  return response.data;
};

export const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    try {
        const response = await api.post('/tasks', {
            ...taskData,
            createdBy: String(taskData.createdBy),  // Ensure createdBy is a string
            assignedTo: String(taskData.assignedTo)  // Ensure assignedTo is a string
        });
        return response.data;
    } catch (error) {
        console.error('Error creating task:', error);
        throw error;
    }
};

export const updateTask = async (taskId: string, taskData: Partial<Task>): Promise<Task> => {
  const response = await api.put(`/tasks/${taskId}`, taskData);
  return response.data;
};

export const deleteTask = async (taskId: string): Promise<void> => {
  await api.delete(`/tasks/${taskId}`);
};

export const addComment = async (taskId: string, text: string): Promise<Comment> => {
  const response = await api.post(`/tasks/${taskId}/comments`, { text });
  return response.data;
};

export const addAttachment = async (taskId: string, file: File): Promise<Attachment> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post(`/tasks/${taskId}/attachments`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deleteAttachment = async (taskId: string, attachmentId: string): Promise<void> => {
  await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
};

export const getTaskHistory = async (taskId: string): Promise<TaskHistoryEntry[]> => {
  const response = await api.get(`/tasks/${taskId}/history`);
  return response.data;
};

export const getOverdueTasks = async (): Promise<Task[]> => {
  const response = await api.get('/tasks/overdue');
  return response.data;
};

export const assignTask = async (taskId: string, userId: string): Promise<Task> => {
  const response = await api.put(`/tasks/${taskId}/assign`, { userId });
  return response.data;
};
