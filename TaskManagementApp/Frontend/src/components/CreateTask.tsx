import { useState } from 'react';
import { createTask } from '../services/taskservice';
import { useAuth } from '../hooks/useAuth';
type TaskPriority = 'low' | 'medium' | 'high';
type TaskStatus = 'to-do' | 'in-progress' | 'completed';
type RecurringPattern = 'daily' | 'weekly' | 'biweekly' | 'monthly';
import '../styles/TaskForm.css';

interface CreateTaskProps {
  refreshTasks: () => Promise<void>;
}

const CreateTask: React.FC<CreateTaskProps> = ({ refreshTasks }) => {
  const { currentUser } = useAuth();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as TaskPriority,
    status: 'to-do' as TaskStatus,
    tags: '',
    recurringPattern: 'daily' as RecurringPattern,
    assignedTo: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    if (name === 'isRecurring') {
      setIsRecurring(checked);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentUser?.id) {
      setError('User not authenticated');
      return;
    }

    try {
      const taskData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        isRecurring,
        createdBy: currentUser.id,
        assignedTo: formData.assignedTo || currentUser.id,
      };

      await createTask(taskData);
      await refreshTasks();
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        status: 'to-do',
        tags: '',
        recurringPattern: 'daily',
        assignedTo: '',
      });
      setIsRecurring(false);
      setIsFormVisible(false);
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task. Please try again.');
    }
  };

  return (
    <div className="create-task-container">
      {!isFormVisible ? (
        <button 
          className="create-task-btn" 
          onClick={() => setIsFormVisible(true)}
        >
          + Create New Task
        </button>
      ) : (
        <div className="task-form-container">
          <h2>Create New Task</h2>
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="task-form">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
              />
            </div>
            
            <div className="form-row">
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
            </div>
            
            <div className="form-group">
              <label htmlFor="tags">Tags (comma separated)</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g. work, important, project"
              />
            </div>
            
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="isRecurring"
                name="isRecurring"
                checked={isRecurring}
                onChange={handleCheckboxChange}
              />
              <label htmlFor="isRecurring">Recurring Task</label>
            </div>
            
            {isRecurring && (
              <div className="form-group">
                <label htmlFor="recurringPattern">Recurring Pattern</label>
                <select
                  id="recurringPattern"
                  name="recurringPattern"
                  value={formData.recurringPattern}
                  onChange={handleChange}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            )}
            
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => setIsFormVisible(false)}
              >
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                Create Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CreateTask;