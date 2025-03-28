// Remove duplicate imports and use single source for Task type
import React, { useState, useCallback } from 'react';
import { createTask } from '../services/taskservice';
import { Task, RecurringPattern } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/TaskForm.css';

// Update interface to use Task directly
interface TaskFormData extends Omit<Task, 'id' | 'createdAt' | 'updatedAt'> {
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
}

const initialFormData: TaskFormData = {
  title: '',
  description: '',
  dueDate: '',
  priority: 'medium',
  status: 'to-do',
  tags: [],
  isRecurring: false,
  recurringPattern: undefined,
  assignedTo: '',
  createdBy: ''
};

const TaskForm: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState<TaskFormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    setError(null);
    setSuccessMessage(null);
  }, []);

  const validateForm = useCallback((): boolean => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.assignedTo.trim()) {
      setError('Assignee is required');
      return false;
    }
    if (formData.isRecurring && !formData.recurringPattern) {
      setError('Please select a recurring pattern');
      return false;
    }
    return true;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await createTask({
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate,
        priority: formData.priority,
        status: formData.status,
        assignedTo: formData.assignedTo,
        createdBy: currentUser?.id || '',
        tags: formData.tags || [],
        comments: [], // Initialize with empty array matching the service type
        attachments: [] // Initialize with empty array matching the service type
        ,
        isRecurring: false
      });
      
      setFormData(initialFormData);
      setSuccessMessage('Task created successfully!');
      
      // Navigate to tasks list after successful creation
      setTimeout(() => {
        navigate('/tasks');
      }, 1500); // Give user time to see success message
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-form" noValidate>
      {(error || successMessage) && (
        <div className={`alert ${error ? 'alert-error' : 'alert-success'}`} role="alert">
          {error || successMessage}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="Enter task title"
          className={error && !formData.title ? 'error' : ''}
          aria-required="true"
          aria-invalid={error && !formData.title ? 'true' : 'false'}
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter task description"
          rows={4}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="dueDate">Due Date</label>
          <input
            type="datetime-local"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="to-do">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="assignedTo">Assign To *</label>
          <input
            type="text"
            id="assignedTo"
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            required
            placeholder="Enter user ID to assign"
            className={error && !formData.assignedTo ? 'error' : ''}
            aria-required="true"
            aria-invalid={error && !formData.assignedTo ? 'true' : 'false'}
          />
        </div>
      </div>

      <div className="form-group checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="isRecurring"
            checked={formData.isRecurring}
            onChange={handleChange}
          />
          <span>Recurring Task</span>
        </label>
      </div>

      {formData.isRecurring && (
        <div className="form-group">
          <label htmlFor="recurringPattern">Recurring Pattern *</label>
          <select
            id="recurringPattern"
            name="recurringPattern"
            value={formData.recurringPattern || ''}
            onChange={handleChange}
            className={error && formData.isRecurring && !formData.recurringPattern ? 'error' : ''}
          >
            <option value="">Select Pattern</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      )}

      <button 
        type="submit" 
        className={`submit-button ${isSubmitting ? 'loading' : ''}`}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className="spinner"></span>
            Creating...
          </>
        ) : (
          'Create Task'
        )}
      </button>
    </form>
  );
};

export default React.memo(TaskForm);