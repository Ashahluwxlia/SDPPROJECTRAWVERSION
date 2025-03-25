import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/UserProfile.css';

const UserProfile: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // In a real app, you would update the user profile here
    // For now, we'll just simulate success
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Error logging out:', err);
      setError('Failed to log out. Please try again.');
    }
  };

  if (!currentUser) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      {isEditing ? (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled
            />
            <small>Email cannot be changed</small>
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-info">
          <div className="info-group">
            <label>Name</label>
            <p>{currentUser.name}</p>
          </div>
          
          <div className="info-group">
            <label>Email</label>
            <p>{currentUser.email}</p>
          </div>
          
          <div className="info-group">
            <label>Role</label>
            <p>{currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}</p>
          </div>
          
          <div className="info-group">
            <label>Member Since</label>
            <p>{currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}</p>
          </div>
          
          <div className="profile-actions">
            <button onClick={() => setIsEditing(true)} className="edit-btn">
              Edit Profile
            </button>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;