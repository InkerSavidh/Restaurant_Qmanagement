// Backend/src/tables/tables.controller.js
import * as tablesService from './tables.service.js';
import { successResponse, errorResponse } from '../common/response.js';

/**
 * Get all tables
 */
export const getTables = async (req, res, next) => {
  try {
    const tables = await tablesService.getAllTables();
    return successResponse(res, 'Tables retrieved successfully', tables);
  } catch (error) {
    next(error);
  }
};

/**
 * Get tables by floor
 */
export const getTablesByFloor = async (req, res, next) => {
  try {
    const { floorId } = req.params;
    const tables = await tablesService.getTablesByFloor(floorId);
    return successResponse(res, 'Tables retrieved successfully', tables);
  } catch (error) {
    next(error);
  }
};

/**
 * Update table status
 */
export const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return errorResponse(res, 'Status is required', null, 400);
    }

    const table = await tablesService.updateTableStatus(id, status);
    return successResponse(res, 'Table status updated successfully', table);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all floors
 */
export const getFloors = async (req, res, next) => {
  try {
    const floors = await tablesService.getAllFloors();
    return successResponse(res, 'Floors retrieved successfully', floors);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new table
 */
export const createTable = async (req, res, next) => {
  try {
    const { tableNumber, capacity, floorId } = req.body;
    if (!tableNumber || !capacity || !floorId) {
      return errorResponse(res, 'Table number, capacity, and floor ID are required', 400);
    }
    const table = await tablesService.createTable({ tableNumber, capacity, floorId });
    return successResponse(res, 'Table created successfully', table, 201);
  } catch (error) {
    if (error.code === 'P2002') {
      return errorResponse(res, 'Table number already exists on this floor', 409);
    }
    next(error);
  }
};

/**
 * Delete a table
 */
export const deleteTable = async (req, res, next) => {
  try {
    const { id } = req.params;
    await tablesService.deleteTable(id);
    return successResponse(res, 'Table deleted successfully');
  } catch (error) {
    next(error);
  }
};
