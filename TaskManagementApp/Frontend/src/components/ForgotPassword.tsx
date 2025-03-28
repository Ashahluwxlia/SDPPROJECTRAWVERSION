import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import { useFormValidation } from '../hooks/useFormValidation';
import { validateEmail } from '../constants/validation';
import '../styles/Auth.css';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { errors, validate, clearErrors } = useFormValidation({
    email: validateEmail
  });

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setEmail(value);
    validate('email', value);
  }, [validate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    
    if (!validate('email', email)) {
      return;
    }
    
    setIsLoading(true);

    try {
      await resetPassword(email.trim());
      setIsSubmitted(true);
    } catch (err: unknown) {
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      
      validate('email', email); // Re-validate to show error
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
                  onChange={handleEmailChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="Enter your email"
                  required
                  autoFocus
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="submit-btn" 
                  disabled={isLoading || !!errors.email}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>

            <div className="auth-links">
              <Link to="/login" className="login-link">
                Remember your password? Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;