// Backend/src/analytics/analytics.routes.js
import express from 'express';
import * as analyticsController from './analytics.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(authenticate);

router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/seated-per-hour', analyticsController.getSeatedPartiesPerHour);

export default router;
