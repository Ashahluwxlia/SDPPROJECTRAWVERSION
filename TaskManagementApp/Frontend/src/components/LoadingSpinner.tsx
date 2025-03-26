import React, { memo } from 'react';
import '../styles/LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  thickness?: number;
  speed?: number;
  label?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(({ 
  size = 'medium',
  color = '#007bff',
  thickness = 4,
  speed = 1,
  label = 'Loading...',
  fullScreen = false
}) => {
  const spinnerStyle = {
    borderColor: `${color} transparent transparent transparent`,
    borderWidth: `${thickness}px`,
    animationDuration: `${1.2 / speed}s`
  };

  const content = (
    <div 
      className={`loading-spinner ${size}`}
      role="status"
      aria-label={label}
    >
      <div className="spinner" style={spinnerStyle} />
      <span className="sr-only">{label}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loading-spinner-overlay">
        {content}
      </div>
    );
  }

  return content;
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;