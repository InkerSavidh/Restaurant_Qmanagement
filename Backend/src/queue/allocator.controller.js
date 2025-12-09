// Backend/src/queue/allocator.controller.js
import * as allocatorService from './allocator.service.js';
import { successResponse } from '../common/response.js';

export const runAllocator = async (req, res, next) => {
  try {
    const userId = req.user?.id || 'system';
    const result = await allocatorService.runAllocator(userId);
    return successResponse(res, result.message, result);
  } catch (error) {
    next(error);
  }
};

export const toggleAutoAllocator = async (req, res, next) => {
  try {
    const { enabled } = req.body;
    const result = allocatorService.toggleAutoAllocator(enabled);
    return successResponse(res, `Auto-allocator ${enabled ? 'enabled' : 'disabled'}`, result);
  } catch (error) {
    next(error);
  }
};

export const getAutoAllocatorStatus = async (req, res, next) => {
  try {
    const result = allocatorService.getAutoAllocatorStatus();
    return successResponse(res, 'Auto-allocator status retrieved', result);
  } catch (error) {
    next(error);
  }
};
