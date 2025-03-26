import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';
import { validationResult } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Invalid input', errors.array());
  }
  next();
};