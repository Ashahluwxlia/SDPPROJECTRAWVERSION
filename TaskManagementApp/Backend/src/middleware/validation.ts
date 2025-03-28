import { Request, Response, NextFunction } from 'express';
import { body, validationResult, Result } from 'express-validator';
import { ValidationError } from '../utils/errors';

export const validateProfileUpdate = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('preferences.emailNotifications').isBoolean(),
  body('preferences.darkMode').isBoolean(),
];

export const validatePasswordUpdate = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)
    .withMessage('Password must contain letters, numbers, and special characters'),
];

// Update the validate function to return void instead of a response
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors: Result = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));
    
    // Instead of returning a response, call next with an error
    const validationError = new ValidationError('Validation failed', errorMessages);
    next(validationError);
    return;
  }
  
  next();
};