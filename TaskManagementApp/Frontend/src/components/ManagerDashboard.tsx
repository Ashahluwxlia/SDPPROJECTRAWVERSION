import React from 'react';
import { useAuth } from '../context/AuthContext';

const ManagerDashboard: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="manager-dashboard">
      <h1>Manager Dashboard</h1>
      {(currentUser?.role === 'manager' || currentUser?.role === 'admin') && (
        <div>Manager-specific content here</div>
      )}
    </div>
  );
};

export default ManagerDashboard;