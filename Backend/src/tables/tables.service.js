// Backend/src/tables/tables.service.js
import prisma from '../config/database.js';
import { logAction } from '../activity/activity.service.js';
import { cache, CACHE_KEYS } from '../common/cache.service.js';

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
  
  // Invalidate cache and emit WebSocket event
  cache.delete(CACHE_KEYS.DASHBOARD_STATS);
  cache.invalidatePattern('tables:');
  
  try {
    const { getIO } = await import('../config/socket.js');
    const io = getIO();
    io.emit('table:status-changed', { 
      tableId, 
      tableNumber: table.tableNumber,
      status: table.status,
      floorId: table.floorId
    });
  } catch (error) {
    console.error('WebSocket emit error:', error);
  }
  
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
  const table = await prisma.table.create({
    data: {
      tableNumber,
      capacity,
      floorId,
      status: 'AVAILABLE',
    },
    include: { floor: true },
  });
  
  // Emit WebSocket event with incremental data
  try {
    const { getIO } = await import('../config/socket.js');
    const io = getIO();
    io.emit('table:created', { 
      id: table.id,
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      status: table.status,
      floorId: table.floorId
    });
  } catch (error) {
    console.error('WebSocket emit error:', error);
  }
  
  return table;
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
  
  // Get table info before deletion
  const table = await prisma.table.findUnique({
    where: { id: tableId },
    include: { floor: true }
  });
  
  // Hard delete the table
  const result = await prisma.table.delete({
    where: { id: tableId },
  });
  
  // Emit WebSocket event with incremental data
  try {
    const { getIO } = await import('../config/socket.js');
    const io = getIO();
    io.emit('table:deleted', { 
      tableId,
      tableNumber: table.tableNumber,
      floorId: table.floorId
    });
  } catch (error) {
    console.error('WebSocket emit error:', error);
  }
  
  return result;
};
