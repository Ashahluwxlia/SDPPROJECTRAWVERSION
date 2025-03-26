import { Component, ErrorInfo, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ErrorBoundary.css';
import { logError } from '../services/errorService';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    logError(error, errorInfo).catch(err => {
      console.error('Failed to log error:', err);
    });
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    const navigate = useNavigate();
    navigate('/');
  };

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Oops! Something went wrong</h2>
          {this.state.error && (
            <details className="error-details">
              <summary>Error Details</summary>
              <p>{this.state.error.message}</p>
            </details>
          )}
          <div className="error-actions">
            <button className="refresh-btn" onClick={this.handleRefresh}>
              Refresh Page
            </button>
            <button className="home-btn" onClick={this.handleGoHome}>
              Go to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;