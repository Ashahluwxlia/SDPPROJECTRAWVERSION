import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Task, updateTask, deleteTask } from '../services/taskservice';
import { useAuth } from '../hooks/useAuth';
import '../styles/TaskList.css';

interface TaskFilters {
  status: string;
  priority: string;
  assignee: string;
}

interface TaskListProps {
  tasks: Task[];
  refreshTasks: () => Promise<void>;
  onFilterChange: (filters: TaskFilters) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, refreshTasks, onFilterChange }) => {
  const { currentUser } = useAuth();
  const [sortField, setSortField] = useState<string>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<TaskFilters>({
    status: 'all',
    priority: 'all',
    assignee: 'all',
  });

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTask(taskId, { status: newStatus as 'to-do' | 'in-progress' | 'completed' });
      await refreshTasks();
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
        await refreshTasks();
      } catch (err) {
        console.error('Error deleting task:', err);
      }
    }
  };

  // Sort tasks
  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortField === 'dueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      return sortDirection === 'asc' 
        ? dateA.getTime() - dateB.getTime() 
        : dateB.getTime() - dateA.getTime();
    }
    
    if (sortField === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      return sortDirection === 'asc' 
        ? priorityA - priorityB 
        : priorityB - priorityA;
    }
    
    // Default sort by title
    // In the sortedTasks function:
    
    // For other fields, safely handle the property access
    const valueA = a[sortField as keyof Task];
    const valueB = b[sortField as keyof Task];
    return sortDirection === 'asc' 
      ? String(valueA || '').localeCompare(String(valueB || '')) 
      : String(valueB || '').localeCompare(String(valueA || ''));
  });

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h2>My Tasks</h2>
        
        <div className="task-filters">
          <div className="filter-group">
            <label htmlFor="status">Status:</label>
            <select 
              id="status" 
              name="status" 
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="all">All</option>
              <option value="to-do">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="priority">Priority:</label>
            <select 
              id="priority" 
              name="priority" 
              value={filters.priority}
              onChange={handleFilterChange}
            >
              <option value="all">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
            <div className="filter-group">
              <label htmlFor="assignee">Assignee:</label>
              <select 
                id="assignee" 
                name="assignee" 
                value={filters.assignee}
                onChange={handleFilterChange}
              >
                <option value="all">All</option>
                <option value={currentUser?.id}>Me</option>
                <option value="">Unassigned</option>
                {/* This would be populated with team members from an API */}
              </select>
            </div>
          )}
        </div>
      </div>
      
      <div className="task-table-container">
        {sortedTasks.length > 0 ? (
          <table className="task-table">
            <thead>
              <tr>
                <th 
                  className="sortable" 
                  onClick={() => handleSort('title')}
                >
                  Title {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="sortable" 
                  onClick={() => handleSort('priority')}
                >
                  Priority {sortField === 'priority' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="sortable" 
                  onClick={() => handleSort('dueDate')}
                >
                  Due Date {sortField === 'dueDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedTasks.map(task => (
                <tr 
                  key={task.id} 
                  className={`task-row ${task.status}`}>
                  <td className="task-title">
                    <Link to={`/tasks/${task.id}/edit`}>{task.title}</Link>
                    {task.tags && task.tags.length > 0 && (
                      <div className="task-tags">
                        {task.tags.map(tag => (
                          <span key={tag} className="task-tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`priority-badge ${task.priority}`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  </td>
                  <td>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                  </td>
                  <td>
                    <select 
                      value={task.status} 
                      onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                      className={`status-select ${task.status}`}
                    >
                      <option value="to-do">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  <td className="task-actions">
                    <Link to={`/tasks/${task.id}/edit`} className="action-btn edit">
                      Edit
                    </Link>
                    <button 
                      onClick={() => handleDeleteTask(task.id)} 
                      className="action-btn delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-tasks">
            <p>No tasks found. Create a new task to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;