// Backend/src/auth/auth.routes.js
import express from 'express';
import authController from './auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/refresh', authController.refreshToken.bind(authController));

// Protected routes
router.get('/me', authenticate, authController.getMe.bind(authController));

export default router;
