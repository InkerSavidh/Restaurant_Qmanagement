// Backend/src/seating/seating.controller.js
import * as seatingService from './seating.service.js';
import { successResponse, errorResponse } from '../common/response.js';

export const getActiveSeating = async (req, res, next) => {
  try {
    const seating = await seatingService.getActiveSeating();
    return successResponse(res, 'Active seating retrieved', seating);
  } catch (error) {
    next(error);
  }
};

export const seatCustomer = async (req, res, next) => {
  try {
    const { queueEntryId, tableId } = req.body;
    if (!queueEntryId || !tableId) {
      return errorResponse(res, 'Queue entry ID and table ID are required', 400);
    }
    const session = await seatingService.seatCustomer(queueEntryId, tableId, req.user.id);
    return successResponse(res, 'Customer seated successfully', session, 201);
  } catch (error) {
    if (error.message.includes('capacity') || error.message.includes('not found') || error.message.includes('not available')) {
      return errorResponse(res, error.message, 400);
    }
    next(error);
  }
};

export const seatCustomerMultipleTables = async (req, res, next) => {
  try {
    const { queueEntryId, tableIds } = req.body;
    if (!queueEntryId || !tableIds || !Array.isArray(tableIds) || tableIds.length === 0) {
      return errorResponse(res, 'Queue entry ID and table IDs array are required', 400);
    }
    const sessions = await seatingService.seatCustomerMultipleTables(queueEntryId, tableIds, req.user.id);
    return successResponse(res, 'Customer seated successfully on multiple tables', sessions, 201);
  } catch (error) {
    if (error.message.includes('capacity') || error.message.includes('not found') || error.message.includes('not available')) {
      return errorResponse(res, error.message, 400);
    }
    next(error);
  }
};

export const endSeatingSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = await seatingService.endSeatingSession(sessionId);
    return successResponse(res, 'Seating session ended', session);
  } catch (error) {
    next(error);
  }
};
