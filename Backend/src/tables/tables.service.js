// Backend/src/tables/tables.service.js
import prisma from '../config/database.js';
import { logAction } from '../activity/activity.service.js';

/**
 * Get all tables
 */
export const getAllTables = async () => {
  return await prisma.table.findMany({
    where: { isActive: true },
    include: {
      floor: true,
    },
    orderBy: {
      tableNumber: 'asc',
    },
  });
};

/**
 * Get tables by floor
 */
export const getTablesByFloor = async (floorId) => {
  return await prisma.table.findMany({
    where: {
      floorId,
      isActive: true,
    },
    include: {
      floor: true,
    },
    orderBy: {
      tableNumber: 'asc',
    },
  });
};

/**
 * Update table status
 */
export const updateTableStatus = async (tableId, status, userId = null) => {
  const table = await prisma.table.update({
    where: { id: tableId },
    data: { status },
    include: {
      floor: true,
    },
  });
  
  // Log the activity
  const statusText = status === 'AVAILABLE' ? 'made available' : 'marked unavailable';
  await logAction(
    userId,
    'table_status_change',
    'TABLE',
    tableId,
    JSON.stringify({ message: `Table T${table.tableNumber} ${statusText}.` })
  );
  
  return table;
};

/**
 * Get all floors
 */
export const getAllFloors = async () => {
  return await prisma.floor.findMany({
    where: { isActive: true },
    orderBy: {
      displayOrder: 'asc',
    },
  });
};

/**
 * Create a new table
 */
export const createTable = async (data) => {
  const { tableNumber, capacity, floorId } = data;
  return await prisma.table.create({
    data: {
      tableNumber,
      capacity,
      floorId,
      status: 'AVAILABLE',
    },
    include: { floor: true },
  });
};

/**
 * Delete a table (hard delete)
 */
export const deleteTable = async (tableId) => {
  // Check if table has any active seating sessions
  const activeSessions = await prisma.seatingSession.findFirst({
    where: { 
      tableId,
      endedAt: null 
    },
  });
  
  if (activeSessions) {
    throw new Error('Cannot delete table with active seating session');
  }
  
  // Hard delete the table
  return await prisma.table.delete({
    where: { id: tableId },
  });
};
