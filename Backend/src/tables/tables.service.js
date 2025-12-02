// Backend/src/tables/tables.service.js
import prisma from '../config/database.js';

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
export const updateTableStatus = async (tableId, status) => {
  return await prisma.table.update({
    where: { id: tableId },
    data: { status },
    include: {
      floor: true,
    },
  });
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
 * Delete a table (soft delete)
 */
export const deleteTable = async (tableId) => {
  return await prisma.table.update({
    where: { id: tableId },
    data: { isActive: false },
  });
};
