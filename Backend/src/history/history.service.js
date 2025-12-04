// Backend/src/history/history.service.js
import prisma from '../config/database.js';

export const getCustomerHistory = async (filters = {}) => {
  const where = {};
  
  if (filters.startDate) {
    where.arrivalTime = { ...where.arrivalTime, gte: new Date(filters.startDate) };
  }
  if (filters.endDate) {
    where.arrivalTime = { ...where.arrivalTime, lte: new Date(filters.endDate) };
  }
  if (filters.customerName) {
    where.customerName = { contains: filters.customerName, mode: 'insensitive' };
  }
  if (filters.tableNumber) {
    where.tableNumbers = { contains: filters.tableNumber, mode: 'insensitive' };
  }
  
  const history = await prisma.customerHistory.findMany({
    where,
    orderBy: { departedTime: 'desc' },
    take: 100,
  });
  
  return history.map(h => ({
    id: h.id,
    name: h.customerName,
    phone: h.customerPhone || 'N/A',
    partySize: h.partySize,
    tableSeated: h.tableNumbers,
    arrivalTime: h.arrivalTime.toISOString(),
    seatedTime: h.seatedTime.toISOString(),
    departedTime: h.departedTime.toISOString(),
    totalWait: h.totalWaitTime,
    dineTime: h.totalDiningTime,
  }));
};
