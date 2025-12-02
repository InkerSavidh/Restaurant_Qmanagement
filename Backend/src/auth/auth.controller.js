// Backend/src/auth/auth.controller.js
import authService from './auth.service.js';
import { successResponse, errorResponse, validationErrorResponse } from '../common/response.js';

class AuthController {
  /**
   * Register new user
   */
  async register(req, res, next) {
    try {
      const { email, password, name, role } = req.body;

      // Validation
      const errors = [];
      if (!email) errors.push({ field: 'email', message: 'Email is required' });
      if (!password) errors.push({ field: 'password', message: 'Password is required' });
      if (!name) errors.push({ field: 'name', message: 'Name is required' });
      if (password && password.length < 6) {
        errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
      }

      if (errors.length > 0) {
        return validationErrorResponse(res, errors);
      }

      const result = await authService.register({ email, password, name, role });

      return successResponse(res, 'User registered successfully', result, 201);
    } catch (error) {
      if (error.message === 'User with this email already exists') {
        return errorResponse(res, error.message, 409);
      }
      next(error);
    }
  }

  /**
   * Login user
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Validation
      const errors = [];
      if (!email) errors.push({ field: 'email', message: 'Email is required' });
      if (!password) errors.push({ field: 'password', message: 'Password is required' });

      if (errors.length > 0) {
        return validationErrorResponse(res, errors);
      }

      const result = await authService.login(email, password);

      return successResponse(res, 'Login successful', result);
    } catch (error) {
      if (error.message === 'Invalid credentials' || error.message === 'User account is inactive') {
        return errorResponse(res, error.message, 401);
      }
      next(error);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return errorResponse(res, 'Refresh token is required', 400);
      }

      const result = await authService.refreshToken(refreshToken);

      return successResponse(res, 'Token refreshed successfully', result);
    } catch (error) {
      return errorResponse(res, 'Invalid refresh token', 401);
    }
  }

  /**
   * Get current user
   */
  async getMe(req, res, next) {
    try {
      const user = await authService.getMe(req.user.id);

      return successResponse(res, 'User retrieved successfully', user);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
