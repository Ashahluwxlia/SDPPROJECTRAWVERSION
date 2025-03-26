import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Updated import path
import { useFormValidation } from '../hooks/useFormValidation';
import LoadingSpinner from './LoadingSpinner';
import { validateEmail, validatePassword } from '../utils/validation';
import '../styles/Auth.css';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Update the destructuring to match the hook's return type
  const { errors, validate, clearErrors } = useFormValidation({
    email: validateEmail,
    password: validatePassword,
  });

  // Update handleInputChange to use validate instead of validateField
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validate(name, value);
    setError(''); // Clear general error when user types
  }, [validate]);

  // Update handleSubmit to validate all fields
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    clearErrors();

    // Validate all fields
    const isEmailValid = validate('email', formData.email);
    const isPasswordValid = validate('password', formData.password);
    
    if (!isEmailValid || !isPasswordValid) return;

    setIsLoading(true);

    try {
      await login(formData.email.trim(), formData.password);
      navigate('/dashboard'); // Add navigation after successful login
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setError(errorMessage);
      // Focus first input field for better UX
      const firstInput = document.querySelector('input') as HTMLInputElement;
      firstInput?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container" role="main">
      <div className="auth-form-container">
        <h1 className="auth-title">Login to Task Manager</h1>
        
        {error && (
          <div className="auth-error" role="alert" aria-live="polite">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'form-input error' : 'form-input'}
              placeholder="Enter your email"
              required
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              autoComplete="email"
              autoFocus
            />
            {errors.email && (
              <span id="email-error" className="error-message" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={errors.password ? 'form-input error' : 'form-input'}
              placeholder="Enter your password"
              required
              aria-required="true"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              autoComplete="current-password"
            />
            {errors.password && (
              <span id="password-error" className="error-message" role="alert">
                {errors.password}
              </span>
            )}
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={isLoading || Object.keys(errors).length > 0}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <LoadingSpinner size="small" color="white" />
              ) : (
                'Login'
              )}
            </button>
          </div>
        </form>

        <div className="auth-links">
          <Link 
            to="/forgot-password" 
            className="forgot-password-link"
            aria-label="Reset your password"
          >
            Forgot Password?
          </Link>
          <p className="register-prompt">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="register-link"
              aria-label="Create a new account"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;