// Backend/src/middleware/role.middleware.js
import { errorResponse } from '../common/response.js';

/**
 * Role-based access control middleware
 * @param {string[]} allowedRoles - Array of allowed roles
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, 'Insufficient permissions', 403);
    }

    next();
  };
};

/**
 * Admin only middleware
 */
export const adminOnly = authorize('ADMIN');

/**
 * Admin or Waiter middleware
 */
export const staffOnly = authorize('ADMIN', 'WAITER');
