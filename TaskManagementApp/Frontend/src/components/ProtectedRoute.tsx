import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Updated import path
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: ('user' | 'admin' | 'manager')[];
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = ['user'],
  redirectPath = '/login'
}) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="protected-route-loading">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Navigate 
        to={redirectPath} 
        replace 
        state={{ from: location.pathname }}
      />
    );
  }

  const hasRequiredRole = requiredRoles.some(role => 
    currentUser.role === role || currentUser.role === 'admin'
  );

  if (!hasRequiredRole) {
    return (
      <Navigate 
        to="/unauthorized" 
        replace 
        state={{ from: location.pathname }}
      />
    );
  }

  return <>{children}</>;
};

export default React.memo(ProtectedRoute);