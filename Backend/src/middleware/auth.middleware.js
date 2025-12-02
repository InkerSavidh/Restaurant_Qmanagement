// Backend/src/middleware/auth.middleware.js
import jwt from 'jsonwebtoken';
import { errorResponse } from '../common/response.js';
import prisma from '../config/database.js';

/**
 * JWT Helper Functions
 */
export const jwtHelpers = {
  /**
   * Sign JWT token
   */
  sign: (payload, expiresIn = process.env.JWT_EXPIRES_IN) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  },

  /**
   * Verify JWT token
   */
  verify: (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
  },

  /**
   * Generate access and refresh tokens
   */
  generateTokens: (user) => {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwtHelpers.sign(payload, process.env.JWT_EXPIRES_IN);
    const refreshToken = jwtHelpers.sign(payload, process.env.JWT_REFRESH_EXPIRES_IN);

    return { token, refreshToken };
  },
};

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'No token provided', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwtHelpers.verify(token);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      return errorResponse(res, 'User not found', 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'User account is inactive', 401);
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid token', 401);
    }
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired', 401);
    }
    return errorResponse(res, 'Authentication failed', 401);
  }
};
