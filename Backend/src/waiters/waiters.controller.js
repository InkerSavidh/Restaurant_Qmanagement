// Backend/src/waiters/waiters.controller.js
import * as waitersService from './waiters.service.js';
import { successResponse, errorResponse } from '../common/response.js';

export const getWaiters = async (req, res, next) => {
  try {
    const waiters = await waitersService.getWaiters();
    return successResponse(res, 'Waiters retrieved', waiters);
  } catch (error) {
    next(error);
  }
};

export const createWaiter = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return errorResponse(res, 'Username and password are required', 400);
    }
    const waiter = await waitersService.createWaiter({ username, password });
    return successResponse(res, 'Waiter created', waiter, 201);
  } catch (error) {
    if (error.code === 'P2002') {
      return errorResponse(res, 'Username already exists', 409);
    }
    next(error);
  }
};

export const updateWaiter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const waiter = await waitersService.updateWaiter(id, req.body);
    return successResponse(res, 'Waiter updated', waiter);
  } catch (error) {
    next(error);
  }
};

export const deleteWaiter = async (req, res, next) => {
  try {
    const { id } = req.params;
    await waitersService.deleteWaiter(id);
    return successResponse(res, 'Waiter deleted');
  } catch (error) {
    next(error);
  }
};
