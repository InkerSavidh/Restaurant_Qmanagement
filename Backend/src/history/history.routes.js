// Backend/src/history/history.routes.js
import express from 'express';
import * as historyController from './history.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(authenticate);

router.get('/', historyController.getCustomerHistory);

export default router;
