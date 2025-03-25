import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import '../styles/Auth.css';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);

    try {
      // Trim the email to remove any whitespace before sending
      // The resetPassword function requires both email and password parameters
      await resetPassword(email.trim(), ''); // Passing an empty string as password or null depending on API requirements
      setIsSubmitted(true);
    } catch (err: unknown) {
      console.error('Password reset error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || 'Failed to send reset email. Please try again.');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>Reset Your Password</h2>
        
        {isSubmitted ? (
          <div className="success-message">
            <p>
              If an account exists with the email you provided, you will receive password reset instructions.
            </p>
            <Link to="/login" className="back-to-login">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            {error && <div className="auth-error">{error}</div>}
            <p className="auth-description">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
            
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="submit-btn" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>

            <div className="auth-links">
              <p>
                Remember your password?{' '}
                <Link to="/login" className="login-link">
                  Login
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;