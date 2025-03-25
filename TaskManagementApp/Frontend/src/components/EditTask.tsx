import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTaskById, updateTask, deleteTask, addComment, addAttachment, Task } from '../services/taskservice';
import { useAuth } from '../hooks/useAuth';
import '../styles/TaskForm.css';

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
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'to-do',
    tags: '',
    recurringPattern: 'daily',
    assignedTo: '',
  });
  const [newComment, setNewComment] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  // Define fetchTask with useCallback to prevent infinite loops
  const fetchTask = useCallback(async () => {
    try {
      setLoading(true);
      const taskData = await getTaskById(taskId!);
      setTask(taskData);
      setIsRecurring(taskData.isRecurring || false);
      
      setFormData({
        title: taskData.title || '',
        description: taskData.description || '',
        dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString().split('T')[0] : '',
        priority: taskData.priority || 'medium',
        status: taskData.status || 'to-do',
        tags: taskData.tags ? taskData.tags.join(', ') : '',
        recurringPattern: taskData.recurringPattern || 'daily',
        assignedTo: taskData.assignedTo || '',
      });
    } catch (err) {
      console.error('Error fetching task:', err);
      setError('Failed to load task. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  // Use a single useEffect with proper dependencies
  useEffect(() => {
    if (taskId) {
      fetchTask();
    }
  }, [taskId, fetchTask]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate || undefined,
        priority: formData.priority as 'low' | 'medium' | 'high',
        status: formData.status as 'to-do' | 'in-progress' | 'completed',
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        isRecurring: isRecurring,
        recurringPattern: isRecurring ? formData.recurringPattern as 'daily' | 'weekly' | 'monthly' : undefined,
        assignedTo: formData.assignedTo || undefined,
      };

      await updateTask(taskId!, taskData);
      await refreshTasks();
      navigate('/tasks');
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task. Please try again.');
    }
  };

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

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await addComment(taskId!, newComment);
      // Refresh the task data to get the updated comments
      await fetchTask();
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment. Please try again.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a file to upload');
      return;
    }

    try {
      setUploadError('');
      await addAttachment(taskId!, selectedFile);
      // Refresh the task data to get the updated attachments
      await fetchTask();
      setSelectedFile(null);
      // Reset the file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err) {
      console.error('Error uploading file:', err);
      setUploadError('Failed to upload file. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading task...</div>;
  }

  if (error && !task) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="edit-task-container">
      <div className="task-header">
        <h2>Edit Task</h2>
        <button onClick={() => navigate('/tasks')} className="back-btn">
          Back to Tasks
        </button>
      </div>

      <div className="task-tabs">
        <button 
          className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Task Details
        </button>
        <button 
          className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          Comments
        </button>
        <button 
          className={`tab-btn ${activeTab === 'attachments' ? 'active' : ''}`}
          onClick={() => setActiveTab('attachments')}
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
                    {/* This would be populated with team members from an API */}
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
            {task?.comments && task.comments.length > 0 ? (
              task.comments.map(comment => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <span className="comment-author">User {comment.userId}</span>
                    <span className="comment-date">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="comment-text">{comment.text}</div>
                </div>
              ))
            ) : (
              <p className="no-comments">No comments yet.</p>
            )}
          </div>
          
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              required
            />
            <button type="submit" className="submit-btn">
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
                    {attachment.name}
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
    </div>
  );
};

export default EditTask;