import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Updated import path
import { useFormValidation } from '../hooks/useFormValidation';
import LoadingSpinner from './LoadingSpinner';
import { validateEmail, validatePassword, validateName } from '../utils/validation';
import '../styles/Auth.css';

interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'user' | 'manager';
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const { errors, validate, clearErrors } = useFormValidation({
    fullName: validateName,
    email: validateEmail,
    password: validatePassword,
  });

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validate(name, value);
    setError('');
  }, [validate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    clearErrors();

    // Validate all fields
    const isNameValid = validate('fullName', formData.fullName);
    const isEmailValid = validate('email', formData.email);
    const isPasswordValid = validate('password', formData.password);

    if (!isNameValid || !isEmailValid || !isPasswordValid) return;

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await register(
        formData.email.trim().toLowerCase(),
        formData.password,
        formData.fullName.trim(),
        formData.role // Add role parameter
      );
      navigate('/dashboard');
    } catch (err: unknown) {
      console.error('Registration error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || 'Registration failed. Please try again.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container" role="main">
      <div className="auth-form-container">
        <h1 className="auth-title">Create an Account</h1>
        
        {error && (
          <div className="auth-error" role="alert" aria-live="polite">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="fullName" className="form-label">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className={errors.fullName ? 'form-input error' : 'form-input'}
              placeholder="Enter your full name"
              required
              aria-required="true"
              aria-invalid={!!errors.fullName}
              aria-describedby={errors.fullName ? 'fullName-error' : undefined}
              autoComplete="name"
              autoFocus
            />
            {errors.fullName && (
              <span id="fullName-error" className="error-message" role="alert">
                {errors.fullName}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
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
            />
            {errors.email && (
              <span id="email-error" className="error-message" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="role" className="form-label">Account Type</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="form-input"
              required
            >
              <option value="user">Regular User</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={errors.password ? 'form-input error' : 'form-input'}
              placeholder="Create a password"
              required
              aria-required="true"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              autoComplete="new-password"
            />
            {errors.password && (
              <span id="password-error" className="error-message" role="alert">
                {errors.password}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={formData.password !== formData.confirmPassword ? 'form-input error' : 'form-input'}
              placeholder="Confirm your password"
              required
              aria-required="true"
              autoComplete="new-password"
            />
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
                'Create Account'
              )}
            </button>
          </div>
        </form>

        <div className="auth-links">
          <p className="login-prompt">
            Already have an account?{' '}
            <Link to="/login" className="login-link" aria-label="Sign in to your account">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;