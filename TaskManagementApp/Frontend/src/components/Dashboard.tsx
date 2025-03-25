import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Task } from '../services/taskservice';
import { useAuth } from '../hooks/useAuth';
import '../styles/Dashboard.css';

interface DashboardProps {
  tasks: Task[];
}

const Dashboard: React.FC<DashboardProps> = ({ tasks }) => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0
  });

  useEffect(() => {
    if (tasks.length > 0) {
      const now = new Date();
      
      const completed = tasks.filter(task => task.status === 'completed').length;
      const inProgress = tasks.filter(task => task.status === 'in-progress').length;
      const overdue = tasks.filter(task => {
        if (!task.dueDate || task.status === 'completed') return false;
        return new Date(task.dueDate) < now;
      }).length;

      setStats({
        total: tasks.length,
        completed,
        inProgress,
        overdue
      });
    }
  }, [tasks]);

  // Get tasks due today or tomorrow
  const getUpcomingTasks = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return tasks.filter(task => {
      if (!task.dueDate || task.status === 'completed') return false;
      
      const dueDate = new Date(task.dueDate);
      return (
        dueDate.getDate() === now.getDate() && 
        dueDate.getMonth() === now.getMonth() && 
        dueDate.getFullYear() === now.getFullYear()
      ) || (
        dueDate.getDate() === tomorrow.getDate() && 
        dueDate.getMonth() === tomorrow.getMonth() && 
        dueDate.getFullYear() === tomorrow.getFullYear()
      );
    });
  };

  // Get high priority tasks
  const getHighPriorityTasks = () => {
    return tasks.filter(task => 
      task.priority === 'high' && task.status !== 'completed'
    );
  };

  const upcomingTasks = getUpcomingTasks();
  const highPriorityTasks = getHighPriorityTasks();

  // Get user's name for a more personalized greeting
  const getUserName = () => {
    if (!currentUser) return 'User';
    
    // Use name or email or id depending on what's available in your User type
    return currentUser.name || currentUser.email || currentUser.username || 'User';
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome, {getUserName()}!</h1>
      
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
        <div className="stat-card">
          <h3>Overdue</h3>
          <div className="stat-number">{stats.overdue}</div>
        </div>
      </div>
      
      <div className="dashboard-section">
        <h2>Upcoming Tasks</h2>
        <div className="task-list-mini">
          {upcomingTasks.length > 0 ? (
            upcomingTasks.map(task => (
              <div key={task.id} className="task-item-mini">
                <div className="task-title">{task.title}</div>
                <div className="task-due">
                  Due: {new Date(task.dueDate!).toLocaleDateString()}
                </div>
                <Link to={`/tasks/${task.id}/edit`} className="view-task-btn">
                  View
                </Link>
              </div>
            ))
          ) : (
            <p>No upcoming tasks for today or tomorrow.</p>
          )}
        </div>
        <Link to="/tasks" className="view-all-link">View all tasks</Link>
      </div>
      
      <div className="dashboard-section">
        <h2>High Priority Tasks</h2>
        <div className="task-list-mini">
          {highPriorityTasks.length > 0 ? (
            highPriorityTasks.map(task => (
              <div key={task.id} className="task-item-mini">
                <div className="task-title">{task.title}</div>
                {task.dueDate && (
                  <div className="task-due">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                )}
                <Link to={`/tasks/${task.id}/edit`} className="view-task-btn">
                  View
                </Link>
              </div>
            ))
          ) : (
            <p>No high priority tasks.</p>
          )}
        </div>
      </div>
      
      <div className="dashboard-actions">
        <Link to="/tasks" className="dashboard-btn primary">
          Manage Tasks
        </Link>
        <Link to="/tasks/create" className="dashboard-btn">
          Create New Task
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;