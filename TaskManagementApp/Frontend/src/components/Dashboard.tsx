import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTask } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import TaskCard from '../components/TaskCard';
import '../styles/Dashboard.css';
import { User } from '../types/index';

interface DashboardStats {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
}

interface DashboardProps {
  searchTerm: string;
  filters: {
    status: string;
    priority: string;
    assignee: string;
  };
}


const Dashboard: React.FC<DashboardProps> = ({ searchTerm, filters }) => {
  const { tasks, loading, error } = useTask();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Remove the duplicate userName declaration and fix type assertion
  const displayName = currentUser && ((currentUser as unknown as User).name || currentUser.email.split('@')[0]);

  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0
  });

  const calculateStats = useMemo(() => {
    if (!tasks.length) return stats;

    const now = new Date();
    return {
      total: tasks.length,
      completed: tasks.filter(task => task.status === 'completed').length,
      inProgress: tasks.filter(task => task.status === 'in-progress').length,
      overdue: tasks.filter(task => {
        if (!task.dueDate || task.status === 'completed') return false;
        return new Date(task.dueDate) < now;
      }).length
    };
  }, [tasks]);

  useEffect(() => {
    setStats(calculateStats);
  }, [calculateStats]);

  const upcomingTasks = useMemo(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return tasks.filter(task => {
      if (!task.dueDate || task.status === 'completed') return false;
      
      const dueDate = new Date(task.dueDate);
      const isToday = dueDate.toDateString() === now.toDateString();
      const isTomorrow = dueDate.toDateString() === tomorrow.toDateString();
      
      return isToday || isTomorrow;
    });
  }, [tasks]);

  const highPriorityTasks = useMemo(() => {
    return tasks.filter(task => 
      task.priority === 'high' && task.status !== 'completed'
    ).slice(0, 5);
  }, [tasks]);

 

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Error loading dashboard</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Welcome, {displayName}!</h1>
        </div>
        <div className="header-right">
          <Link to="/tasks/create" className="create-task-btn">
            Create New Task
          </Link>
          <button onClick={handleLogout} className="logout-btn">
            Sign Out
          </button>
        </div>
      </header>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <div className="stat-number">{stats.total}</div>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <div className="stat-number">{stats.completed}</div>
        </div>
        <div className="stat-card">
          <h3>In Progress</h3>
          <div className="stat-number">{stats.inProgress}</div>
        </div>
        <div className="stat-card warning">
          <h3>Overdue</h3>
          <div className="stat-number">{stats.overdue}</div>
        </div>
      </div>
      
      <div className="dashboard-grid">
        <section className="dashboard-section">
          <header className="section-header">
            <h2>Upcoming Tasks</h2>
            <Link to="/tasks?filter=upcoming" className="view-all-link">
              View all
            </Link>
          </header>
          <div className="task-list-mini">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map(task => (
                <TaskCard key={task.id} task={task} compact />
              ))
            ) : (
              <p className="empty-state">No upcoming tasks for today or tomorrow</p>
            )}
          </div>
        </section>

        <section className="dashboard-section">
          <header className="section-header">
            <h2>High Priority Tasks</h2>
            <Link to="/tasks?filter=high-priority" className="view-all-link">
              View all
            </Link>
          </header>
          <div className="task-list-mini">
            {highPriorityTasks.length > 0 ? (
              highPriorityTasks.map(task => (
                <TaskCard key={task.id} task={task} compact />
              ))
            ) : (
              <p className="empty-state">No high priority tasks</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;