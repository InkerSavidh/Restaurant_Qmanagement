// Backend/src/queue/allocator.routes.js
import express from 'express';
import * as allocatorController from './allocator.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(authenticate);

router.post('/run', allocatorController.runAllocator);
router.put('/toggle', allocatorController.toggleAutoAllocator);
router.get('/status', allocatorController.getAutoAllocatorStatus);

export default router;
