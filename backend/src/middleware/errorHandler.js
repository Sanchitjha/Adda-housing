/**
 * Global Error Handler Middleware
 * Catches and formats all application errors
 */

const logger = require('../utils/logger');
const { ValidationError, Sequelize } = require('sequelize');

const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    method: req.method,
    path: req.path,
    body: req.body,
    user: req.user?.id
  });

  // Sequelize validation error
  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Sequelize database error
  if (err instanceof Sequelize.DatabaseError) {
    return res.status(500).json({
      error: 'Database Error',
      message: 'A database error occurred',
      ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Authentication Error',
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Authentication Error',
      message: 'Token expired'
    });
  }

  // Custom application errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.name || 'Error',
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File Too Large',
      message: 'File size exceeds the allowed limit'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Unexpected Field',
      message: 'Unexpected file field'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Not found handler
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { 
  errorHandler, 
  notFoundHandler, 
  asyncHandler 
};
