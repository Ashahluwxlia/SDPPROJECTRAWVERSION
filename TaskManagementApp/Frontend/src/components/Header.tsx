import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import '../styles/Header.css';

interface HeaderProps {
  onSearch: (term: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <Link to="/" className="logo">TaskManager</Link>
      </div>

      <div className="header-center">
        <form onSubmit={handleSearchSubmit} className="search-container">
          <input
            type="text"
            placeholder="Search tasks..."
            className="search-input"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button type="submit" className="search-button">
            🔍
          </button>
        </form>
      </div>

      <div className="header-right">
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {currentUser ? (
          <div className="user-menu">
            <div className="user-info">
              <span>{currentUser.name}</span>
            </div>
            <div className="dropdown-menu">
              <Link to="/profile" className="dropdown-item">Profile</Link>
              <Link to="/tasks" className="dropdown-item">My Tasks</Link>
              {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
                <Link to="/admin" className="dropdown-item">Admin Panel</Link>
              )}
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="btn-login">Login</Link>
            <Link to="/register" className="btn-register">Register</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;