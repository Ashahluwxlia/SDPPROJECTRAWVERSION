import React, { useState } from 'react';
import { createTask } from '../services/taskservice';
import { useAuth } from '../hooks/useAuth';
import './TaskForm.css';

const TaskForm: React.FC = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as const,
    status: 'to-do' as const,
    tags: [] as string[],
    isRecurring: false,
    recurringPattern: undefined as 'daily' | 'weekly' | 'biweekly' | 'monthly' | undefined,  // Updated type
    assignedTo: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await createTask({
        ...formData,
        createdBy: String(currentUser?.id),
        assignedTo: String(formData.assignedTo)
      });
      
      // Reset form after successful submission
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        status: 'to-do',
        tags: [],
        isRecurring: false,
        recurringPattern: undefined,  // Reset to undefined
        assignedTo: ''
      });
    } catch (err) {
      setError('Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
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
        />
      </div>

      <div className="form-group">
        <label htmlFor="dueDate">Due Date</label>
        <input
          type="date"
          id="dueDate"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
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
        />
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            name="isRecurring"
            checked={formData.isRecurring}
            onChange={handleChange}
          />
          Recurring Task
        </label>
      </div>

      {formData.isRecurring && (
        <div className="form-group">
          <label htmlFor="recurringPattern">Recurring Pattern</label>
          <select
            id="recurringPattern"
            name="recurringPattern"
            value={formData.recurringPattern || ''}
            onChange={handleChange}
          >
            <option value="">Select Pattern</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Biweekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Task'}
      </button>
    </form>
  );
};

export default TaskForm;