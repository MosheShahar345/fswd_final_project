

// Custom error classes
export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.field = field;
  }
}

export class AuthenticationError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
  }
}

export class AuthorizationError extends Error {
  constructor(message = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = 403;
  }
}

export class NotFoundError extends Error {
  constructor(resource = 'Resource') {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

export class ConflictError extends Error {
  constructor(message = 'Resource conflict') {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
  }
}

export class RateLimitError extends Error {
  constructor(message = 'Too many requests') {
    super(message);
    this.name = 'RateLimitError';
    this.statusCode = 429;
  }
}

export class DatabaseError extends Error {
  constructor(message = 'Database operation failed') {
    super(message);
    this.name = 'DatabaseError';
    this.statusCode = 500;
  }
}

// Enhanced error handler
export function errorHandler(err, req, res, next) {
  // Log the error to console
  console.error(`Error in ${req.method} ${req.url}:`, {
    name: err.name,
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode || 500,
    timestamp: new Date().toISOString()
  });

  // Determine status code
  let statusCode = 500;
  let errorMessage = 'Internal server error';
  let errorDetails = null;

  // Handle different error types
  switch (err.name) {
    case 'ValidationError':
      statusCode = 400;
      errorMessage = err.message;
      errorDetails = { field: err.field };
      break;

    case 'AuthenticationError':
      statusCode = 401;
      errorMessage = err.message;
      break;

    case 'AuthorizationError':
      statusCode = 403;
      errorMessage = err.message;
      break;

    case 'NotFoundError':
      statusCode = 404;
      errorMessage = err.message;
      break;

    case 'ConflictError':
      statusCode = 409;
      errorMessage = err.message;
      break;

    case 'RateLimitError':
      statusCode = 429;
      errorMessage = err.message;
      break;

    case 'DatabaseError':
      statusCode = 500;
      errorMessage = 'Database operation failed';
      break;

    case 'SyntaxError':
      statusCode = 400;
      errorMessage = 'Invalid JSON format';
      break;

    case 'CastError':
      statusCode = 400;
      errorMessage = 'Invalid data format';
      break;

    case 'JsonWebTokenError':
      statusCode = 401;
      errorMessage = 'Invalid token';
      break;

    case 'TokenExpiredError':
      statusCode = 401;
      errorMessage = 'Token expired';
      break;

    default:
      // Check if error has a statusCode property
      if (err.statusCode) {
        statusCode = err.statusCode;
        errorMessage = err.message || 'Request failed';
      }
      break;
  }

  // Create error response
  const errorResponse = {
    error: {
      message: errorMessage,
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method,
      ...(errorDetails && { details: errorDetails })
    }
  };

  // Add request ID if available
  if (req.id) {
    errorResponse.error.requestId = req.id;
  }

  // Add additional details in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
    errorResponse.error.originalError = {
      name: err.name,
      message: err.message
    };
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
}

// 404 handler
export function notFound(req, res) {
  console.warn(`Route not found: ${req.method} ${req.url}`);

  res.status(404).json({
    error: {
      message: 'Route not found',
      statusCode: 404,
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method
    }
  });
}

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Validation error handler
export const handleValidationError = (error) => {
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(err => err.message);
    return new ValidationError(messages.join(', '));
  }
  return error;
};

// Database error handler
export const handleDatabaseError = (error) => {
  if (error.code === 'SQLITE_CONSTRAINT') {
    if (error.message.includes('UNIQUE constraint failed')) {
      return new ConflictError('Resource already exists');
    }
    if (error.message.includes('FOREIGN KEY constraint failed')) {
      return new ValidationError('Referenced resource does not exist');
    }
  }
  
  if (error.code === 'SQLITE_BUSY') {
    return new DatabaseError('Database is busy, please try again');
  }
  
  return new DatabaseError('Database operation failed');
};
