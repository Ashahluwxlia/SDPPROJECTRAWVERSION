import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';
import { validationResult, Result } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors: Result = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));
    
    throw new ValidationError('Validation failed', errorMessages);
  }
  
  next();
};

export const handleErrors = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      message: err.message,
      errors: err.errors
    });
  }

  console.error(err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};