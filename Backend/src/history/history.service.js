// Backend/src/history/history.service.js
import prisma from '../config/database.js';

export const getCustomerHistory = async (filters = {}) => {
  const where = { endedAt: { not: null } };
  
  if (filters.startDate) {
    where.seatedAt = { ...where.seatedAt, gte: new Date(filters.startDate) };
  }
  if (filters.endDate) {
    where.seatedAt = { ...where.seatedAt, lte: new Date(filters.endDate) };
  }
  if (filters.tableNumber) {
    where.table = { tableNumber: filters.tableNumber };
  }
  
  const sessions = await prisma.seatingSession.findMany({
    where,
    include: {
      table: true,
      queueEntry: { include: { customer: true } },
    },
    orderBy: { seatedAt: 'desc' },
    take: 100,
  });
  
  return sessions.map(s => {
    const arrivalTime = s.queueEntry?.entryTime || s.seatedAt;
    const seatedTime = s.seatedAt;
    const departedTime = s.endedAt;
    const totalWait = Math.round((seatedTime - arrivalTime) / 60000);
    const dineTime = Math.round((departedTime - seatedTime) / 60000);
    
    return {
      id: s.id,
      name: s.queueEntry?.customer?.name || 'Walk-in',
      phone: s.queueEntry?.customer?.phoneNumber || 'N/A',
      partySize: s.partySize,
      tableSeated: `T${s.table.tableNumber}`,
      arrivalTime: arrivalTime.toISOString(),
      seatedTime: seatedTime.toISOString(),
      departedTime: departedTime.toISOString(),
      totalWait,
      dineTime,
    };
  }).filter(h => !filters.customerName || h.name.toLowerCase().includes(filters.customerName.toLowerCase()));
};
