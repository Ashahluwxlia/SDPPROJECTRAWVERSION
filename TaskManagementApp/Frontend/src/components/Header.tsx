import React, { useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Updated import path
import { useTheme } from '../hooks/useTheme';
import { useSearch } from '../hooks/useSearch';
import { useDropdown } from '../hooks/useDropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSun, faMoon, faUser } from '@fortawesome/free-solid-svg-icons';
import '../styles/Header.css';

interface HeaderProps {
  onSearch: (term: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { searchTerm, handleSearch } = useSearch(onSearch);
  const { isOpen, toggleDropdown, closeDropdown, dropdownRef } = useDropdown();

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleSearch(e.target.value);
  }, [handleSearch]);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  }, [onSearch, searchTerm]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const navigationLinks = useMemo(() => {
    if (!currentUser) return null;

    const links = [
      { to: '/profile', label: 'Profile' },
      { to: '/tasks', label: 'My Tasks' },
    ];

    if (currentUser.role === 'admin' || currentUser.role === 'manager') {
      links.push({ to: '/admin', label: 'Admin Panel' });
    }

    return links;
  }, [currentUser]);

  const showSearch = useMemo(() => {
    const searchableRoutes = ['/tasks', '/dashboard', '/admin'];
    return searchableRoutes.some(route => location.pathname.startsWith(route));
  }, [location]);

  return (
    <header className={`app-header ${theme}`}>
      <div className="header-left">
        <Link to="/" className="logo">
          <img src="/logo.png" alt="TaskManager" className="logo-img" />
          <span className="logo-text">TaskManager</span>
        </Link>
      </div>

      {showSearch && (
        <div className="header-center">
          <form onSubmit={handleSearchSubmit} className="search-container">
            <input
              type="text"
              placeholder="Search tasks..."
              className="search-input"
              value={searchTerm}
              onChange={handleSearchChange}
              aria-label="Search tasks"
            />
            <button type="submit" className="search-button" aria-label="Submit search">
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </form>
        </div>
      )}

      <div className="header-right">
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} />
        </button>

        {currentUser ? (
          <div className="user-menu" ref={dropdownRef}>
            <button 
              className="user-menu-button"
              onClick={toggleDropdown}
              aria-expanded={isOpen}
            >
              <div className="user-avatar">
                <FontAwesomeIcon icon={faUser} />
              </div>
              <span className="user-name">{currentUser.name}</span>
            </button>

            {isOpen && (
              <div className="dropdown-menu" onClick={closeDropdown}>
                {navigationLinks?.map(link => (
                  <Link 
                    key={link.to}
                    to={link.to}
                    className={`dropdown-item ${location.pathname === link.to ? 'active' : ''}`}
                  >
                    {link.label}
                  </Link>
                ))}
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            )}
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