// Backend/src/waiters/waiters.routes.js
import express from 'express';
import * as waitersController from './waiters.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(authenticate);

router.get('/', waitersController.getWaiters);
router.post('/', waitersController.createWaiter);
router.put('/:id', waitersController.updateWaiter);
router.delete('/:id', waitersController.deleteWaiter);

export default router;
