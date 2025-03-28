export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export interface ValidationErrorItem {
  field?: string;
  message: string;
}

export class ValidationError extends AppError {
  public errors: ValidationErrorItem[];
  
  constructor(message: string, errors: ValidationErrorItem[]) {
    super(400, message, errors);
    this.errors = errors;
    // This ensures instanceof works correctly
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied') {
    super(403, message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
    // This ensures instanceof works correctly
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(401, message);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}