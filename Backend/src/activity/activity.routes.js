// Backend/src/activity/activity.routes.js
import express from 'express';
import * as activityController from './activity.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(authenticate);

router.get('/', activityController.getActivityLogs);

export default router;
