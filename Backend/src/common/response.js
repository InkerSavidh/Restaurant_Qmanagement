// Backend/src/common/response.js

/**
 * Standard success response
 */
export const successResponse = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

/**
 * Standard error response
 */
export const errorResponse = (res, message, statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    status: 'failed',
    message,
    ...(errors && { errors }),
  });
};

/**
 * Validation error response
 */
export const validationErrorResponse = (res, errors) => {
  return res.status(400).json({
    status: 'failed',
    message: 'Validation failed',
    errors,
  });
};
