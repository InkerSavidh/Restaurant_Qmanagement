// Backend/src/analytics/analytics.service.js
import prisma from '../config/database.js';

export const getDashboardStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [queueCount, tables, seatedToday, waitingEntries] = await Promise.all([
    prisma.queueEntry.count({ where: { status: 'WAITING' } }),
    prisma.table.findMany({ where: { isActive: true } }),
    prisma.seatingSession.count({ where: { seatedAt: { gte: today } } }),
    prisma.queueEntry.findMany({ where: { status: 'WAITING' }, select: { estimatedWaitMinutes: true } }),
  ]);
  
  const occupiedTables = tables.filter(t => t.status === 'OCCUPIED').length;
  const freeTables = tables.filter(t => t.status === 'AVAILABLE').length;
  const waitTimes = waitingEntries.map(e => e.estimatedWaitMinutes);
  const avgWaitTime = waitTimes.length ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length) : 0;
  const longestWait = waitTimes.length ? Math.max(...waitTimes) : 0;
  
  return {
    customersInQueue: queueCount,
    occupiedTables,
    freeTables,
    avgWaitTime,
    longestWait,
    partiesSeatedToday: seatedToday,
  };
};

export const getSeatedPartiesPerHour = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const sessions = await prisma.seatingSession.findMany({
    where: { seatedAt: { gte: today } },
    select: { seatedAt: true },
  });
  
  const hourCounts = {};
  for (let i = 0; i < 24; i++) hourCounts[i] = 0;
  
  sessions.forEach(s => {
    const hour = new Date(s.seatedAt).getHours();
    hourCounts[hour]++;
  });
  
  return Object.entries(hourCounts).map(([hour, count]) => ({
    hour: parseInt(hour),
    count,
  }));
};
