import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faHome, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import '../styles/Unauthorized.css';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  
  const handleGoHome = () => {
    navigate('/');
  };
  
  const handleGoBack = () => {
    // Use the 'from' path instead of navigate(-1)
    navigate(from);
  };

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-icon">
        <FontAwesomeIcon icon={faLock} size="4x" />
      </div>
      <h1>Access Denied</h1>
      <p className="unauthorized-message">You don't have permission to access this page.</p>
      <p className="unauthorized-description">
        This area requires specific permissions that your account doesn't have.
        Please contact your administrator if you believe this is an error.
      </p>
      <div className="action-buttons">
        <button className="home-btn" onClick={handleGoHome}>
          <FontAwesomeIcon icon={faHome} /> Go to Home
        </button>
        <button className="back-btn" onClick={handleGoBack}>
          <FontAwesomeIcon icon={faArrowLeft} /> Go Back
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;