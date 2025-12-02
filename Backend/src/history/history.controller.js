// Backend/src/history/history.controller.js
import * as historyService from './history.service.js';
import { successResponse } from '../common/response.js';

export const getCustomerHistory = async (req, res, next) => {
  try {
    const { startDate, endDate, customerName, tableNumber } = req.query;
    const history = await historyService.getCustomerHistory({ startDate, endDate, customerName, tableNumber });
    return successResponse(res, 'Customer history retrieved', history);
  } catch (error) {
    next(error);
  }
};
