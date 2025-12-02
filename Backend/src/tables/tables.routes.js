// Backend/src/tables/tables.routes.js
import express from 'express';
import * as tablesController from './tables.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', tablesController.getTables);
router.get('/floor/:floorId', tablesController.getTablesByFloor);
router.put('/:id/status', tablesController.updateStatus);
router.post('/', tablesController.createTable);
router.delete('/:id', tablesController.deleteTable);

export default router;
