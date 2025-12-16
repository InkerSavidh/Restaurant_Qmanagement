import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getDashboardStats } from '../../api/analytics.api';
import { getQueue, QueueEntry } from '../../api/queue.api';
import { useSocket } from '../../hooks/useSocketManager';
import SeatedPartiesChart from '../../Components/Charts/SeatedPartiesChart';

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
