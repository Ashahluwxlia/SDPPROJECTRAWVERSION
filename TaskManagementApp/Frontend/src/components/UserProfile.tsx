import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaUser, FaSignOutAlt, FaEdit } from 'react-icons/fa';
import Switch from 'react-switch';
import Skeleton from 'react-loading-skeleton';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import '../styles/UserProfile.css';

// Validation schema
const profileSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  currentPassword: yup.string().when('isChangingPassword', {
    is: true,
    then: (schema) => schema.required('Current password is required')
  }),
  newPassword: yup.string().when('isChangingPassword', {
    is: true,
    then: (schema) => schema
      .required('New password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(/[a-z]/, 'Must contain lowercase letter')
      .matches(/[A-Z]/, 'Must contain uppercase letter')
      .matches(/[0-9]/, 'Must contain number')
  }),
  confirmPassword: yup.string().when('isChangingPassword', {
    is: true,
    then: (schema) => schema
      .required('Please confirm your password')
      .oneOf([yup.ref('newPassword')], 'Passwords must match')
  }),
  profilePicture: yup.mixed().nullable().optional(),
  preferences: yup.object({
    emailNotifications: yup.boolean().required(),
    darkMode: yup.boolean().required(),
    taskReminders: yup.boolean().required(),
    language: yup.string().required(),
    timezone: yup.string().required()
  }).required()
}) as yup.ObjectSchema<UserFormData>;

interface UserFormData {
  name: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  profilePicture?: File;
  preferences: {
    emailNotifications: boolean;
    darkMode: boolean;
    taskReminders: boolean;
    language: string;
    timezone: string;
  };
}

const UserProfile: React.FC = () => {
  const { currentUser, updateUserProfile, updatePassword, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { 
    register, 
    handleSubmit, 
    control,
    formState: { errors }  } = useForm<UserFormData>({
    mode: 'onChange',
    resolver: yupResolver<UserFormData>(profileSchema),
    defaultValues: {
      name: currentUser?.name ?? '',
      email: currentUser?.email ?? '',
      currentPassword: undefined,
      newPassword: undefined,
      confirmPassword: undefined,
      profilePicture: undefined,
      preferences: {
        emailNotifications: currentUser?.preferences?.emailNotifications ?? true,
        darkMode: currentUser?.preferences?.darkMode ?? false,
        taskReminders: currentUser?.preferences?.taskReminders ?? true,
        language: currentUser?.preferences?.language ?? 'en',
        timezone: currentUser?.preferences?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    }
  });

  useEffect(() => {
    if (profilePicture) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(profilePicture);
    }
  }, [profilePicture]);

  const onSubmit = async (data: UserFormData) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'preferences' && key !== 'profilePicture') {
          formData.append(key, value as string);
        }
      });
      formData.append('preferences', JSON.stringify(data.preferences));
      
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }

      if (isChangingPassword) {
        await updatePassword(data.currentPassword!, data.newPassword!);
      }

      await updateUserProfile(formData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
      setIsChangingPassword(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Error logging out:', err);
      toast.error('Failed to log out. Please try again.');
    }
  };

  if (!currentUser) {
    return <Skeleton height={400} />;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2><FaUser /> User Profile</h2>
        {!isEditing && (
          <div className="profile-actions">
            <button onClick={() => setIsEditing(true)} className="edit-btn">
              <FaEdit /> Edit Profile
            </button>
            <button onClick={handleLogout} className="logout-btn">
              <FaSignOutAlt /> Logout
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
          <div className="profile-picture-section">
            <img 
              src={previewUrl || currentUser.profilePicture || '/default-avatar.png'} 
              alt="Profile" 
              className="profile-picture"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              {...register('name')}
              required
            />
            {errors.name && <p className="error-message">{errors.name.message}</p>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              {...register('email')}
              required
              disabled
            />
            <small>Email cannot be changed</small>
            {errors.email && <p className="error-message">{errors.email.message}</p>}
          </div>
          
          <div className="form-group">
            <label>Preferences</label>
            <div className="preferences-group">
              <label>
                <Controller
                  name="preferences.emailNotifications"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onChange={field.onChange}
                      checkedIcon={false}
                      uncheckedIcon={false}
                    />
                  )}
                />
                Email Notifications
              </label>
              <label>
                <Controller
                  name="preferences.darkMode"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onChange={field.onChange}
                      checkedIcon={false}
                      uncheckedIcon={false}
                    />
                  )}
                />
                Dark Mode
              </label>
            </div>
          </div>

          {isChangingPassword && (
            <>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  {...register('currentPassword')}
                  required
                />
                {errors.currentPassword && <p className="error-message">{errors.currentPassword.message}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  {...register('newPassword')}
                  required
                />
                {errors.newPassword && <p className="error-message">{errors.newPassword.message}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  {...register('confirmPassword')}
                  required
                />
                {errors.confirmPassword && <p className="error-message">{errors.confirmPassword.message}</p>}
              </div>
            </>
          )}
          
          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              className="password-btn"
            >
              {isChangingPassword ? 'Cancel Password Change' : 'Change Password'}
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
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

      {/* Add activity history section */}
      <div className="activity-history">
        <h3>Recent Activity</h3>
        {currentUser.recentActivity && currentUser.recentActivity.length > 0 ? (
          <ul>
            {currentUser.recentActivity.map((activity, index) => (
              <li key={index}>
                {activity.description} - {new Date(activity.date).toLocaleDateString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>No recent activity</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;