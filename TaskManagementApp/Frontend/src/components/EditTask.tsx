import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTaskById, updateTask, deleteTask, addComment, addAttachment, Task } from '../services/taskservice';
import { useAuth } from '../context/AuthContext'; // Updated import path
import '../styles/TaskForm.css';

// Define constants for form defaults and validation
// Update the FORM_DEFAULTS type definitions
const FORM_DEFAULTS = {
  title: '',
  description: '',
  dueDate: '',
  priority: 'medium' as 'low' | 'medium' | 'high',
  status: 'to-do' as 'to-do' | 'in-progress' | 'completed',
  tags: '',
  recurringPattern: 'daily' as 'daily' | 'weekly' | 'monthly' | 'biweekly',
  assignedTo: '',
};

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface EditTaskProps {
  refreshTasks: () => Promise<void>;
}

const EditTask: React.FC<EditTaskProps> = ({ refreshTasks }) => {
  const { taskId } = useParams<{ taskId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [formData, setFormData] = useState(FORM_DEFAULTS);
  const [newComment, setNewComment] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  // Memoize form validation
  const formValidation = useMemo(() => {
    const errors: string[] = [];
    if (!formData.title.trim()) errors.push('Title is required');
    if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
      errors.push('Due date cannot be in the past');
    }
    return errors;
  }, [formData.title, formData.dueDate]);

  const fetchTask = useCallback(async () => {
    if (!taskId) return;
    
    try {
      setLoading(true);
      const taskData = await getTaskById(taskId);
      
      if (!taskData) {
        throw new Error('Task not found');
      }

      setTask(taskData);
      setIsRecurring(taskData.isRecurring || false);
      
      // Update the setFormData section in fetchTask
      setFormData({
        title: taskData.title || FORM_DEFAULTS.title,
        description: taskData.description || FORM_DEFAULTS.description,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString().split('T')[0] : '',
        priority: (taskData.priority as 'low' | 'medium' | 'high') || FORM_DEFAULTS.priority,
        status: (taskData.status as 'to-do' | 'in-progress' | 'completed') || FORM_DEFAULTS.status,
        tags: taskData.tags ? taskData.tags.join(', ') : '',
        recurringPattern: (taskData.recurringPattern as 'daily' | 'weekly' | 'monthly' | 'biweekly') || FORM_DEFAULTS.recurringPattern,
        assignedTo: taskData.assignedTo || FORM_DEFAULTS.assignedTo,
      });
    } catch (err) {
      console.error('Error fetching task:', err);
      setError(err instanceof Error ? err.message : 'Failed to load task');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formValidation.length > 0) {
      setError(formValidation.join(', '));
      return;
    }

    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        dueDate: formData.dueDate || undefined,
        priority: formData.priority as 'low' | 'medium' | 'high',
        status: formData.status as 'to-do' | 'in-progress' | 'completed',
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        isRecurring,
        recurringPattern: isRecurring ? formData.recurringPattern as 'daily' | 'weekly' | 'monthly' : undefined,
        assignedTo: formData.assignedTo || undefined,
      };

      await updateTask(taskId!, taskData);
      await refreshTasks();
      navigate('/tasks');
    } catch (err) {
      setError('Failed to update task. Please try again.');
    }
  };

  // Remove the duplicate handleFileChange and combine the functionality
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setUploadError('Invalid file type. Please upload an image, PDF, or Word document.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File size exceeds 5MB limit.');
      return;
    }

    setSelectedFile(file);
    setUploadError('');
  }, []);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId!);
        await refreshTasks();
        navigate('/tasks');
      } catch (err) {
        console.error('Error deleting task:', err);
        setError('Failed to delete task. Please try again.');
      }
    }
  };

  // Add memoized comment handling
  const handleCommentSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedComment = newComment.trim();
    if (!trimmedComment) return;

    try {
      setError('');
      await addComment(taskId!, trimmedComment);
      await fetchTask();
      setNewComment('');
    } catch (err) {
      setError('Failed to add comment. Please try again.');
    }
  }, [taskId, newComment, fetchTask]);

  // Add memoized file upload handling
  const handleFileUpload = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a file to upload');
      return;
    }

    try {
      setUploadError('');
      await addAttachment(taskId!, selectedFile);
      await fetchTask();
      setSelectedFile(null);
      (document.getElementById('file-upload') as HTMLInputElement).value = '';
    } catch (err) {
      setUploadError('Failed to upload file. Please try again.');
    }
  }, [taskId, selectedFile, fetchTask]);

  // Add memoized tab switching
  // Define tab types for better type safety
  type TabType = 'details' | 'comments' | 'attachments';

  // Add memoized tab switching with proper typing
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    // Clear errors only when switching away from their respective tabs
    if (tab !== 'details') setError('');
    if (tab !== 'attachments') setUploadError('');
  }, []);

  // Remove the standalone tab buttons JSX (around line 250)
  // Update tab buttons to use the new typed handler
  <div className="task-tabs">
    <button 
      className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
      onClick={() => handleTabChange('details')}
    >
      Task Details
    </button>
    <button 
      className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
      onClick={() => handleTabChange('comments')}
    >
      Comments
    </button>
    <button 
      className={`tab-btn ${activeTab === 'attachments' ? 'active' : ''}`}
      onClick={() => handleTabChange('attachments')}
    >
      Attachments
    </button>
  </div>

  // Memoize the comments list rendering
  const renderComments = useMemo(() => {
    if (!task?.comments?.length) {
      return <p className="no-comments">No comments yet.</p>;
    }

    return task.comments.map(comment => (
      <div key={comment.id} className="comment-item">
        <div className="comment-header">
          <span className="comment-author">{comment.userId}</span>
          <span className="comment-date">
            {new Date(comment.createdAt).toLocaleString()}
          </span>
        </div>
        <div className="comment-text">{comment.text}</div>
      </div>
    ));
  }, [task?.comments]);

  // Keep the tab buttons in the return statement and update them to use handleTabChange
  
  return (
    <div className="edit-task-container">
      {loading ? (
        <div className="loading">Loading task...</div>
      ) : error && !task ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="task-header">
            <h2>Edit Task</h2>
            <button onClick={() => navigate('/tasks')} className="back-btn">
              Back to Tasks
            </button>
          </div>
  
          <div className="task-tabs">
            <button 
              className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => handleTabChange('details' as TabType)}
            >
              Task Details
            </button>
            <button 
              className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
              onClick={() => handleTabChange('comments' as TabType)}
            >
              Comments
            </button>
            <button 
              className={`tab-btn ${activeTab === 'attachments' ? 'active' : ''}`}
              onClick={() => handleTabChange('attachments' as TabType)}
            >
              Attachments
            </button>
          </div>
  
          {activeTab === 'details' && (
            <div className="task-form-container">
              {error && <div className="error-message">{error}</div>}
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
  
                  {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
                    <div className="form-group">
                      <label htmlFor="assignedTo">Assign To</label>
                      <select
                        id="assignedTo"
                        name="assignedTo"
                        value={formData.assignedTo}
                        onChange={handleChange}
                      >
                        <option value="">Unassigned</option>
                        <option value={currentUser?.id}>Me</option>
                      </select>
                    </div>
                  )}
                </div>
  
                <div className="form-group">
                  <label htmlFor="tags">Tags (comma separated)</label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="e.g. work, urgent, project"
                  />
                </div>
  
                <div className="form-group checkbox-group">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={isRecurring}
                    onChange={() => setIsRecurring(!isRecurring)}
                  />
                  <label htmlFor="isRecurring">Recurring Task</label>
                </div>
  
                {isRecurring && (
                  <div className="form-group">
                    <label htmlFor="recurringPattern">Repeat</label>
                    <select
                      id="recurringPattern"
                      name="recurringPattern"
                      value={formData.recurringPattern}
                      onChange={handleChange}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                )}
  
                <div className="form-actions">
                  <button type="button" onClick={handleDelete} className="delete-btn">
                    Delete Task
                  </button>
                  <button type="submit" className="submit-btn">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}
  
          {activeTab === 'comments' && (
            <div className="comments-section">
              <h3>Comments</h3>
              <div className="comments-list">
                {renderComments}
              </div>
              <form onSubmit={handleCommentSubmit} className="comment-form">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  required
                />
                <button type="submit" className="submit-btn" disabled={!newComment.trim()}>
                  Add Comment
                </button>
              </form>
            </div>
          )}
  
          {activeTab === 'attachments' && (
            <div className="attachments-section">
              <h3>Attachments</h3>
  
              <div className="attachments-list">
                {task?.attachments && task.attachments.length > 0 ? (
                  task.attachments.map(attachment => (
                    <div key={attachment.id} className="attachment-item">
                      <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                        {attachment.filename} {/* Changed from name to filename */}
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="no-attachments">No attachments yet.</p>
                )}
              </div>
  
              <form onSubmit={handleFileUpload} className="upload-form">
                {uploadError && <div className="error-message">{uploadError}</div>}
                <div className="file-input-container">
                  <input
                    type="file"
                    id="file-upload"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="file-upload" className="file-input-label">
                    {selectedFile ? selectedFile.name : 'Choose a file'}
                  </label>
                </div>
                <button type="submit" className="submit-btn" disabled={!selectedFile}>
                  Upload Attachment
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default EditTask;