// Backend/src/activity/activity.controller.js
import * as activityService from './activity.service.js';
import { successResponse } from '../common/response.js';

export const getActivityLogs = async (req, res, next) => {
  try {
    const { userType, userName, table, startDate, endDate } = req.query;
    const logs = await activityService.getActivityLogs({ userType, userName, table, startDate, endDate });
    return successResponse(res, 'Activity logs retrieved', logs);
  } catch (error) {
    next(error);
  }
};
