import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Task, updateTask, deleteTask } from '../services/taskservice';
import { useAuth } from '../context/AuthContext'; // Updated from '../hooks/useAuth'
import '../styles/TaskList.css';
import { FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

interface TaskFilters {
  status: string;
  priority: string;
  assignee: string;
  search: string;
  tags: string[];
}

interface TaskListProps {
  tasks: Task[];
  refreshTasks: () => Promise<void>;
  searchTerm: string;
  filters: {
    status: string;
    priority: string;
    assignee: string;
  };
  onFilterChange: (filters: { status: string; priority: string; assignee: string }) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, refreshTasks, onFilterChange }) => {
  const { currentUser } = useAuth();
  const [sortField, setSortField] = useState<string>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<TaskFilters>({
    status: 'all',
    priority: 'all',
    assignee: 'all',
    search: '',
    tags: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(10);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    onFilterChange({
    status: filters.status,
    priority: filters.priority,
    assignee: filters.assignee
  });
  }, [filters, onFilterChange]);

  // Extract all unique tags from tasks
  useEffect(() => {
    const tags = new Set<string>();
    tasks.forEach(task => {
      if (task.tags && task.tags.length > 0) {
        task.tags.forEach(tag => tags.add(tag));
      }
    });
    setAvailableTags(Array.from(tags));
  }, [tasks]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentPage(1); // Reset to first page when filter changes
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagFilter = (tag: string) => {
    setCurrentPage(1); // Reset to first page when filter changes
    setFilters(prev => {
      const updatedTags = prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag];
      return {
        ...prev,
        tags: updatedTags
      };
    });
  };

  const handleSearchClear = () => {
    setFilters(prev => ({
      ...prev,
      search: ''
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

  // Filter tasks based on all criteria
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Status filter
      if (filters.status !== 'all' && task.status !== filters.status) {
        return false;
      }
      
      // Priority filter
      if (filters.priority !== 'all' && task.priority !== filters.priority) {
        return false;
      }
      
      // Assignee filter
      if (filters.assignee !== 'all') {
        if (filters.assignee === currentUser?.id && task.assignedTo !== currentUser?.id) {
          return false;
        } else if (filters.assignee === '' && task.assignedTo) {
          return false;
        }
      }
      
      // Tags filter
      if (filters.tags.length > 0) {
        if (!task.tags?.length || !filters.tags.some(tag => task.tags?.includes(tag))) {
          return false;
        }
      }
      
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const titleMatch = task.title.toLowerCase().includes(searchLower);
        const descMatch = task.description?.toLowerCase().includes(searchLower);
        const tagMatch = task.tags?.some(tag => tag.toLowerCase().includes(searchLower));
        
        if (!titleMatch && !descMatch && !tagMatch) {
          return false;
        }
      }
      
      return true;
    });
  }, [tasks, filters, currentUser]);

  // Sort filtered tasks
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
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
      
      // For other fields, safely handle the property access
      const valueA = a[sortField as keyof Task];
      const valueB = b[sortField as keyof Task];
      return sortDirection === 'asc' 
        ? String(valueA || '').localeCompare(String(valueB || '')) 
        : String(valueB || '').localeCompare(String(valueA || ''));
    });
  }, [filteredTasks, sortField, sortDirection]);

  // Pagination
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = sortedTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(sortedTasks.length / tasksPerPage);

  const paginate = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
  }, []);

  // Get sort icon based on current sort state
  const getSortIcon = useCallback((field: string) => {
    if (sortField !== field) return <FaSort size={14} />;
    return sortDirection === 'asc' ? <FaSortUp size={14} /> : <FaSortDown size={14} />;
  }, [sortField, sortDirection]);

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h2>My Tasks</h2>
        
        <div className="search-container">
          <div className="search-input-wrapper">
            <FaSearch size={14} />
            <input
              type="text"
              placeholder="Search tasks..."
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="search-input"
              aria-label="Search tasks"
            />
            {filters.search && (
              <button 
                className="search-clear-btn" 
                onClick={handleSearchClear}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>
        
        <div className="task-filters">
          <div className="filter-group">
            <label htmlFor="status">Status:</label>
            <select 
              id="status" 
              name="status" 
              value={filters.status}
              onChange={handleFilterChange}
              aria-label="Filter by status"
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
              aria-label="Filter by priority"
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
                aria-label="Filter by assignee"
              >
                <option value="all">All</option>
                <option value={currentUser?.id}>Me</option>
                <option value="">Unassigned</option>
                {/* This would be populated with team members from an API */}
              </select>
            </div>
          )}
        </div>
        
        {availableTags.length > 0 && (
          <div className="tags-filter">
            <span className="tags-filter-label">Filter by tags:</span>
            <div className="tags-list">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagFilter(tag)}
                  className={`tag-filter-btn ${filters.tags.includes(tag) ? 'active' : ''}`}
                  aria-pressed={filters.tags.includes(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="task-table-container">
        {sortedTasks.length > 0 ? (
          <>
            <table className="task-table">
              <thead>
                <tr>
                  <th 
                    className="sortable" 
                    onClick={() => handleSort('title')}
                    aria-sort={sortField === 'title' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <div className="th-content">
                      <span>Title</span>
                      {getSortIcon('title')}
                    </div>
                  </th>
                  <th 
                    className="sortable" 
                    onClick={() => handleSort('priority')}
                    aria-sort={sortField === 'priority' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <div className="th-content">
                      <span>Priority</span>
                      {getSortIcon('priority')}
                    </div>
                  </th>
                  <th 
                    className="sortable" 
                    onClick={() => handleSort('dueDate')}
                    aria-sort={sortField === 'dueDate' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <div className="th-content">
                      <span>Due Date</span>
                      {getSortIcon('dueDate')}
                    </div>
                  </th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentTasks.map(task => (
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
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="pagination-btn"
                  aria-label="Previous page"
                >
                  &laquo; Prev
                </button>
                
                <div className="pagination-info">
                  Page {currentPage} of {totalPages} ({sortedTasks.length} tasks)
                </div>
                
                <button 
                  onClick={() => paginate(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                  aria-label="Next page"
                >
                  Next &raquo;
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-tasks">
            <p>No tasks found. {filters.search || filters.status !== 'all' || filters.priority !== 'all' || filters.tags.length > 0 ? 'Try adjusting your filters.' : 'Create a new task to get started!'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;