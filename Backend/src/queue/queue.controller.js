// Backend/src/queue/queue.controller.js
import * as queueService from './queue.service.js';
import { successResponse, errorResponse } from '../common/response.js';

export const getQueue = async (req, res, next) => {
  try {
    const queue = await queueService.getQueueList();
    return successResponse(res, 'Queue retrieved successfully', queue);
  } catch (error) {
    next(error);
  }
};

export const getNextInQueue = async (req, res, next) => {
  try {
    const next = await queueService.getNextInQueue();
    return successResponse(res, 'Next in queue retrieved', next);
  } catch (error) {
    next(error);
  }
};

export const addToQueue = async (req, res, next) => {
  try {
    const { name, partySize, phone } = req.body;
    if (!name || !partySize) {
      return errorResponse(res, 'Name and party size are required', 400);
    }
    const entry = await queueService.addToQueue({ name, partySize, phone });
    return successResponse(res, 'Added to queue successfully', entry, 201);
  } catch (error) {
    next(error);
  }
};

export const removeFromQueue = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Removing queue entry:', id);
    const entry = await queueService.removeFromQueue(id);
    console.log('✅ Queue entry removed:', entry);
    return successResponse(res, 'Removed from queue successfully', entry);
  } catch (error) {
    console.error('❌ Error removing queue entry:', error);
    next(error);
  }
};
