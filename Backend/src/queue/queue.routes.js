// Backend/src/queue/queue.routes.js
import express from 'express';
import * as queueController from './queue.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(authenticate);

router.get('/', queueController.getQueue);
router.get('/next', queueController.getNextInQueue);
router.post('/', queueController.addToQueue);
router.delete('/:id', queueController.removeFromQueue);

export default router;
