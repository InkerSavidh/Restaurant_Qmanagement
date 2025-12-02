// Backend/src/activity/activity.service.js
import prisma from '../config/database.js';

export const getActivityLogs = async (filters = {}) => {
  const where = {};
  
  if (filters.startDate) {
    where.createdAt = { ...where.createdAt, gte: new Date(filters.startDate) };
  }
  if (filters.endDate) {
    where.createdAt = { ...where.createdAt, lte: new Date(filters.endDate) };
  }
  if (filters.userName) {
    where.user = { name: { contains: filters.userName, mode: 'insensitive' } };
  }
  if (filters.userType && filters.userType !== 'All Users') {
    where.user = { ...where.user, role: filters.userType.toUpperCase() };
  }
  
  const logs = await prisma.activityLog.findMany({
    where,
    include: { user: { select: { name: true, role: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  
  return logs.map(log => ({
    id: log.id,
    timestamp: log.createdAt.toISOString(),
    user: log.user?.name || 'System',
    badge: getBadgeFromAction(log.action),
    details: log.details?.message || log.action,
  }));
};

const getBadgeFromAction = (action) => {
  if (action.includes('clear') || action.includes('end')) return 'Cleared';
  if (action.includes('block') || action.includes('unavailable')) return 'Blocked';
  return 'Made Available';
};

export const logAction = async (userId, action, entityType, entityId, details) => {
  return prisma.activityLog.create({
    data: { userId, action, entityType, entityId, details },
  });
};
