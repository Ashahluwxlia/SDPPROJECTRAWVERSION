import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Task } from '../types/index'; 
import '../styles/TaskCard.css';

interface TaskCardProps {
  task: Task;
  compact?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, compact = false }) => {
  const formatDate = useMemo(() => (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const priorityClass = useMemo(() => 
    `priority-${task.priority.toLowerCase()}`, [task.priority]
  );

  const statusClass = useMemo(() => 
    `status-${task.status.toLowerCase()}`, [task.status]
  );

  const renderTags = useMemo(() => {
    if (!task.tags?.length) return null;
    
    return (
      <div className="task-tags" role="list" aria-label="Task tags">
        {task.tags.map((tag, index) => (
          <span 
            key={`${tag}-${index}`} 
            className="tag"
            role="listitem"
          >
            {tag}
          </span>
        ))}
      </div>
    );
  }, [task.tags]);

  const CompactView = () => (
    <div 
      className={`task-card compact ${priorityClass}`}
      role="article"
      aria-label={`Task: ${task.title}`}
    >
      <div className="task-card-header">
        <h3 className="task-title">{task.title}</h3>
        <span className={`task-status ${statusClass}`} role="status">
          {task.status}
        </span>
      </div>
      {task.dueDate && (
        <time 
          className="task-due-date" 
          dateTime={task.dueDate}
        >
          Due: {formatDate(task.dueDate)}
        </time>
      )}
      <Link 
        to={`/tasks/${task.id}`} 
        className="task-link"
        aria-label={`View details for ${task.title}`}
      >
        View Details
      </Link>
    </div>
  );

  const FullView = () => (
    <div 
      className={`task-card ${priorityClass}`}
      role="article"
      aria-label={`Task: ${task.title}`}
    >
      <div className="task-card-header">
        <h3 className="task-title">{task.title}</h3>
        <span className={`task-status ${statusClass}`} role="status">
          {task.status}
        </span>
      </div>
      
      <div className="task-card-body">
        {task.description && (
          <p className="task-description" role="contentinfo">
            {task.description}
          </p>
        )}
        
        <div className="task-metadata">
          {task.dueDate && (
            <time 
              className="task-due-date" 
              dateTime={task.dueDate}
            >
              Due: {formatDate(task.dueDate)}
            </time>
          )}
          {renderTags}
        </div>
      </div>
      
      <div className="task-card-footer">
        <Link 
          to={`/tasks/${task.id}`} 
          className="task-link"
          aria-label={`View details for ${task.title}`}
        >
          View Details
        </Link>
      </div>
    </div>
  );

  return compact ? <CompactView /> : <FullView />;
};

export default React.memo(TaskCard);