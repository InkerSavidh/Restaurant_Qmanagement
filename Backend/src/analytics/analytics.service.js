// Backend/src/analytics/analytics.service.js
import prisma from '../config/database.js';
import { cache, CACHE_KEYS } from '../common/cache.service.js';

export const getDashboardStats = async () => {
  return await cache.getOrSet(CACHE_KEYS.DASHBOARD_STATS, async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Optimize queries - use aggregations instead of fetching all data
    const [queueStats, tableStats, seatedToday] = await Promise.all([
      // Single query for queue stats with aggregation
      prisma.queueEntry.aggregate({
        where: { status: 'WAITING' },
        _count: { id: true },
        _avg: { estimatedWaitMinutes: true },
        _max: { estimatedWaitMinutes: true },
      }),
      // Single query for table counts by status
      prisma.table.groupBy({
        by: ['status'],
        where: { isActive: true },
        _count: { status: true },
      }),
      // Count seated parties today
      prisma.seatingSession.count({ where: { seatedAt: { gte: today } } }),
    ]);
    
    // Process table stats
    const tableStatusCounts = tableStats.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {});
    
    return {
      customersInQueue: queueStats._count.id || 0,
      occupiedTables: tableStatusCounts.OCCUPIED || 0,
      freeTables: tableStatusCounts.AVAILABLE || 0,
      avgWaitTime: Math.round(queueStats._avg.estimatedWaitMinutes || 0),
      longestWait: queueStats._max.estimatedWaitMinutes || 0,
      partiesSeatedToday: seatedToday,
    };
  }, 30); // Cache for 30 seconds
};

export const getSeatedPartiesPerHour = async () => {
  return await cache.getOrSet(CACHE_KEYS.HOURLY_CHART, async () => {
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
  }, 300); // Cache for 5 minutes
};
