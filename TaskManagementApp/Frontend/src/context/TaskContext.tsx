import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { Task } from '../types';  // Remove TaskContextType from this import
import { getTasks, createTask, updateTask, deleteTask } from '../services/taskservice';

// Add interface definition here
// Add type definitions for API interactions
type CreateTaskData = Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & {
  title: string;  // Make title explicitly required
  description?: string;  // Keep description optional
};

type UpdateTaskData = Partial<CreateTaskData>;

// Update the interface to match
interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  refreshTasks: () => Promise<void>;
  createTask: (taskData: CreateTaskData) => Promise<void>;
  updateTask: (taskId: string, taskData: UpdateTaskData) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTasks = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks as Task[]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTaskHandler = useCallback(async (taskData: CreateTaskData) => {
    setLoading(true);
    try {
      // Ensure required fields with defaults
      await createTask({
          title: taskData.title || 'Untitled Task',
          description: taskData.description || '',
          status: taskData.status || 'todo',
          dueDate: taskData.dueDate || new Date().toISOString(),
          priority: taskData.priority || 'medium',
          createdBy: '',
          assignedTo: '',
          tags: [],
          isRecurring: false
      });
      await refreshTasks();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create task';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [refreshTasks]);

  const updateTaskHandler = useCallback(async (taskId: string, taskData: UpdateTaskData) => {
    setLoading(true);
    try {
      // Filter out undefined values
      const cleanData = Object.fromEntries(
        Object.entries(taskData).filter(([_, v]) => v !== undefined)
      );
      await updateTask(taskId, cleanData);
      await refreshTasks();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update task';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [refreshTasks]);

  const deleteTaskHandler = useCallback(async (taskId: string) => {
    setLoading(true);
    try {
      await deleteTask(taskId);
      await refreshTasks();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete task';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [refreshTasks]);

  const value = useMemo(() => ({
    tasks,
    loading,
    error,
    refreshTasks,
    createTask: createTaskHandler,
    updateTask: updateTaskHandler,
    deleteTask: deleteTaskHandler
  }), [tasks, loading, error, refreshTasks, createTaskHandler, updateTaskHandler, deleteTaskHandler]);

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};