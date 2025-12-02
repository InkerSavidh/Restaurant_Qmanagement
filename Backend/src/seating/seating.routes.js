// Backend/src/seating/seating.routes.js
import express from 'express';
import * as seatingController from './seating.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(authenticate);

router.get('/active', seatingController.getActiveSeating);
router.post('/seat', seatingController.seatCustomer);
router.post('/seat-multiple', seatingController.seatCustomerMultipleTables);
router.post('/end/:sessionId', seatingController.endSeatingSession);

export default router;
