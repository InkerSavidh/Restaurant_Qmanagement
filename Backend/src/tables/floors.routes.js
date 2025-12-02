// Backend/src/tables/floors.routes.js
import express from 'express';
import * as tablesController from './tables.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', tablesController.getFloors);

export default router;
