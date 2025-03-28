import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { ValidationError as SequelizeValidationError, UniqueConstraintError } from 'sequelize';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

interface ErrorResponse {
  error: string;
  details?: any;
  stack?: string;
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): Response<ErrorResponse> => {
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle custom AppErrors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
    });
  }

  // Handle Sequelize validation errors
  if (err instanceof SequelizeValidationError) {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  // Handle JWT errors
  if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
    return res.status(401).json({
      error: 'Invalid or expired token',
    });
  }

  // Handle file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File too large',
      details: 'Maximum file size is 5MB',
    });
  }

  // Handle network/database connection errors
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      error: 'Service temporarily unavailable',
    });
  }

  // Handle unique constraint violations
  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({
      error: 'Resource already exists',
      details: Object.keys(err.fields).map(field => ({
        field,
        message: `${field} already exists`,
      })),
    });
  }

  // Default error
  return res.status(500).json({
    error: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && {
      details: err.message,
      stack: err.stack,
    }),
  });
};