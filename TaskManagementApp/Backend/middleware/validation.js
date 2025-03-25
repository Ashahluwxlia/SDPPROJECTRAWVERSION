const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// User registration validation rules
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

// Login validation rules
const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Task creation validation rules
const taskValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('priority').isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  body('status').isIn(['to-do', 'in-progress', 'completed']).withMessage('Status must be to-do, in-progress, or completed'),
  body('dueDate').optional().isISO8601().toDate().withMessage('Due date must be a valid date')
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  taskValidation
};