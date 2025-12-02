// Backend/src/analytics/analytics.controller.js
import * as analyticsService from './analytics.service.js';
import { successResponse } from '../common/response.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await analyticsService.getDashboardStats();
    return successResponse(res, 'Dashboard stats retrieved', stats);
  } catch (error) {
    next(error);
  }
};

export const getSeatedPartiesPerHour = async (req, res, next) => {
  try {
    const data = await analyticsService.getSeatedPartiesPerHour();
    return successResponse(res, 'Seated parties per hour retrieved', data);
  } catch (error) {
    next(error);
  }
};
