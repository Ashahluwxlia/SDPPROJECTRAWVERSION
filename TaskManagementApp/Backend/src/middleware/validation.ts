import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

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

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};