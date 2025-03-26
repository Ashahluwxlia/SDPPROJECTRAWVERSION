import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NotFound.css';

const NotFound: React.FC = () => {
  return (
    <div className="not-found-container">
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/" className="home-link">Return to Dashboard</Link>
    </div>
  );
};

export default NotFound;