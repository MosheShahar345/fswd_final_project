import { body, param, validationResult } from 'express-validator';

// Validation middleware
export const validateCourse = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Course title must be between 3 and 100 characters'),
  
  body('subtitle')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Course subtitle must be less than 100 characters'),
  
  body('level')
    .isIn(['beginner', 'intermediate', 'advanced', 'professional'])
    .withMessage('Level must be one of: beginner, intermediate, advanced, professional'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('duration')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Duration must be less than 50 characters'),
  
  body('prerequisites')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Prerequisites must be less than 200 characters'),
  
  body('max_depth')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Max depth must be less than 50 characters'),
  
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Active must be a boolean value'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  }
];

export const validateEnrollment = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Course ID must be a positive integer'),
  
  body('sessionId')
    .isInt({ min: 1 })
    .withMessage('Session ID must be a positive integer'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  }
];

export const validateCourseId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Course ID must be a positive integer'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  }
];
