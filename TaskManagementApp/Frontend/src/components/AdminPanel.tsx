import React from 'react';
import { useAuth } from '../context/AuthContext';

const AdminPanel: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="admin-panel">
      <h1>Admin Dashboard</h1>
      {currentUser?.role === 'admin' && (
        <div>Admin-specific content here</div>
      )}
    </div>
  );
};

export default AdminPanel;