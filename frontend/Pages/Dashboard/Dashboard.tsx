import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getDashboardStats, getSeatedPartiesPerHour } from '../../api/analytics.api';
import { getQueue, QueueEntry } from '../../api/queue.api';
import { useSocket } from '../../hooks/useSocketManager';

// Seated Parties Area Chart Component
const SeatedPartiesChart: React.FC = () => {
  const [hourlyData, setHourlyData] = useState<{ hour: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHourlyData = async () => {
    try {
      const data = await getSeatedPartiesPerHour();
      setHourlyData(data || []);
    } catch (error) {
      console.error('Error fetching hourly data:', error);
      setHourlyData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHourlyData();
    // Reduce polling frequency for chart data (every 5 minutes instead of 1 minute)
    const interval = setInterval(fetchHourlyData, 300000);
    return () => clearInterval(interval);
  }, []);

  const maxCount = Math.max(...hourlyData.map(d => d.count), 1);
  
  const generateAreaPath = () => {
    if (hourlyData.length === 0) return { linePath: '', areaPath: '', points: [] };
    
    const padding = 5;
    const width = 100 - padding * 2;
    const height = 75;
    
    const points = hourlyData.map((item, index) => {
      const x = padding + (index / Math.max(hourlyData.length - 1, 1)) * width;
      const y = 15 + height - (item.count / maxCount) * height;
      return { x, y, count: item.count };
    });
    
    let linePath = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const midX = (current.x + next.x) / 2;
      linePath += ` Q ${midX} ${current.y}, ${midX} ${(current.y + next.y) / 2}`;
      linePath += ` Q ${midX} ${next.y}, ${next.x} ${next.y}`;
    }
    
    const lastPoint = points[points.length - 1];
    const areaPath = `${linePath} L ${lastPoint.x} 90 L ${points[0].x} 90 Z`;
    
    return { linePath, areaPath, points };
  };

  const { linePath, areaPath, points } = generateAreaPath();

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100 min-h-[320px]">
      <h3 className="text-[#5D3FD3] font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Seated Parties Per Hour</h3>
      {loading ? (
        <div className="h-48 sm:h-64 w-full">
          {/* Chart skeleton instead of loading circle */}
          <div className="w-full h-full bg-gray-100 rounded animate-pulse flex items-end justify-between p-4 gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div 
                key={i} 
                className="bg-gray-200 rounded-sm animate-pulse" 
                style={{ 
                  height: `${Math.random() * 60 + 20}%`, 
                  width: '10%' 
                }}
              ></div>
            ))}
          </div>
        </div>
      ) : hourlyData.length === 0 ? (
        <div className="h-48 sm:h-64 flex items-center justify-center text-gray-500 text-xs sm:text-sm">
          No data available
        </div>
      ) : (
        <div className="h-48 sm:h-64 w-full flex flex-col">
          <div className="flex-1 w-full">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#5D3FD3" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#5D3FD3" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              
              <line x1="5" y1="15" x2="5" y2="90" stroke="#e5e7eb" strokeWidth="0.3" />
              <line x1="5" y1="90" x2="95" y2="90" stroke="#e5e7eb" strokeWidth="0.3" />
              
              <path d={areaPath} fill="url(#areaGradient)" />
              <path d={linePath} fill="none" stroke="#5D3FD3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              
              {points.map((point, index) => (
                <g key={index}>
                  <circle cx={point.x} cy={point.y} r="1.5" fill="#5D3FD3" stroke="white" strokeWidth="0.5" />
                  {point.count > 0 && (
                    <text x={point.x} y={point.y - 3} textAnchor="middle" fontSize="3" fill="#374151" fontWeight="600">
                      {point.count}
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </div>
          
          <div className="flex justify-between px-1 sm:px-2 mt-2">
            {hourlyData.map((item, index) => (
              <span key={index} className="text-[8px] sm:text-[10px] text-gray-500">{item.hour}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface DashboardStats {
  customersInQueue: number;
  occupiedTables: number;
  freeTables: number;
  avgWaitTime: number;
  longestWait: number;
  partiesSeatedToday: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    customersInQueue: 0,
    occupiedTables: 0,
    freeTables: 93,
    avgWaitTime: 0,
    longestWait: 0,
    partiesSeatedToday: 0,
  });
  const [queueCustomers, setQueueCustomers] = useState<QueueEntry[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [queueLoading, setQueueLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      // Start both requests immediately but handle them independently
      getDashboardStats()
        .then(statsData => {
          if (statsData) setStats(statsData);
          setStatsLoading(false);
        })
        .catch(() => setStatsLoading(false));
      
      getQueue()
        .then(queueData => {
          if (queueData) setQueueCustomers(queueData);
          setQueueLoading(false);
        })
        .catch(() => setQueueLoading(false));
        
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStatsLoading(false);
      setQueueLoading(false);
    }
  };

  const fetchStatsOnly = async () => {
    try {
      const statsData = await getDashboardStats();
      if (statsData) setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Memoized WebSocket handlers for incremental updates
  const handleQueueAdded = useCallback((data: QueueEntry) => {
    setQueueCustomers(prev => [...prev, data]);
    fetchStatsOnly(); // Only refresh stats, not full queue
  }, []);

  const handleQueueRemoved = useCallback((data: { id: string }) => {
    setQueueCustomers(prev => prev.filter(q => q.id !== data.id));
    fetchStatsOnly();
  }, []);

  const handleTableStatusChanged = useCallback(() => {
    fetchStatsOnly(); // Only refresh stats
  }, []);

  const handleSeatingCreated = useCallback(() => {
    fetchStatsOnly();
  }, []);

  const handleSeatingEnded = useCallback(() => {
    fetchStatsOnly();
  }, []);

  useEffect(() => {
    fetchDashboardData();
    // No polling - rely on WebSocket for updates
  }, []);

  // Memoize WebSocket events to prevent reconnections
  const socketEvents = useMemo(() => ({
    'queue:added': handleQueueAdded,
    'queue:removed': handleQueueRemoved,
    'table:statusChanged': handleTableStatusChanged,
    'seating:created': handleSeatingCreated,
    'seating:ended': handleSeatingEnded,
  }), []);

  useSocket(socketEvents);

  const statCards = [
    { icon: 'bg-blue-500', label: 'Customers in Queue', value: stats.customersInQueue.toString() },
    { icon: 'bg-red-500', label: 'Occupied Tables', value: stats.occupiedTables.toString() },
    { icon: 'bg-green-600', label: 'Free Tables', value: stats.freeTables.toString() },
    { icon: 'bg-yellow-400', label: 'Avg. Wait Time', value: `${stats.avgWaitTime} min` },
    { icon: 'bg-gray-500', label: 'Longest Wait', value: `${stats.longestWait} min` },
    { icon: 'bg-gray-500', label: 'Parties Seated Today', value: stats.partiesSeatedToday.toString() },
  ];

  // Remove full-page skeleton - use progressive loading only

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* LCP Element - No animation delay for faster rendering */}
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Dashboard Overview</h2>

      {/* Stats Cards - Fixed height to prevent layout shift */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-lg p-3 sm:p-4 shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100 h-[130px] sm:h-[150px]">
            <div className="flex flex-col h-full">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${stat.icon} flex items-center justify-center text-white mb-2 sm:mb-3 shadow-sm flex-shrink-0`}>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1 w-full flex flex-col justify-center overflow-hidden">
                {statsLoading ? (
                  <>
                    <div className="h-8 sm:h-9 w-16 sm:w-20 bg-gray-200 rounded animate-pulse mb-1"></div>
                    <div className="h-3 sm:h-4 w-24 sm:w-32 bg-gray-200 rounded animate-pulse"></div>
                  </>
                ) : (
                  <>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 leading-tight">{stat.value}</div>
                    <div className="text-[10px] sm:text-xs lg:text-sm text-gray-500 leading-tight break-words hyphens-auto">{stat.label}</div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Next Up To Be Seated - Fixed height to prevent layout shift */}
        <div className="lg:col-span-2 bg-white rounded-lg p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100 min-h-[320px]">
          <h3 className="text-[#5D3FD3] font-semibold mb-4">
            Waiting Queue {!queueLoading && `(${queueCustomers.length})`}
          </h3>
          <div className="border-t border-gray-100 pt-4">
            <div className="min-h-[240px]">
              {queueLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : queueCustomers.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-gray-500 italic">Waiting queue is empty.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {queueCustomers.map((customer, index) => (
                    <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#5D3FD3] text-white flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{customer.customerName}</p>
                          <p className="text-xs text-gray-500">Party of {customer.partySize} • Wait: {customer.waitTime} min</p>
                        </div>
                      </div>
                      {customer.phone && (
                        <p className="text-xs text-gray-500 hidden sm:block">{customer.phone}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Seated Parties Per Hour Chart */}
        <SeatedPartiesChart />
      </div>
    </div>
  );
};

export default Dashboard;
