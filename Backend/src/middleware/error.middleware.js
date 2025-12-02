// Backend/src/middleware/error.middleware.js
import { errorResponse } from '../common/response.js';

/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Prisma errors
  if (err.code && err.code.startsWith('P')) {
    return handlePrismaError(err, res);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Token expired', 401);
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return errorResponse(res, err.message, 400, err.errors);
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  return errorResponse(res, message, statusCode);
};

/**
 * Handle Prisma-specific errors
 */
const handlePrismaError = (err, res) => {
  switch (err.code) {
    case 'P2002':
      return errorResponse(res, 'A record with this value already exists', 409);
    case 'P2025':
      return errorResponse(res, 'Record not found', 404);
    case 'P2003':
      return errorResponse(res, 'Foreign key constraint failed', 400);
    default:
      return errorResponse(res, 'Database error occurred', 500);
  }
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res) => {
  return errorResponse(res, 'Route not found', 404);
};
