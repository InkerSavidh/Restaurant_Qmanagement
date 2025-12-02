import React, { useState, useEffect } from 'react';
import { getDashboardStats, getNextInQueue } from '../../api/analytics.api';

interface DashboardStats {
  customersInQueue: number;
  occupiedTables: number;
  freeTables: number;
  avgWaitTime: number;
  longestWait: number;
  partiesSeatedToday: number;
}

interface NextCustomer {
  id: string;
  customerName: string;
  partySize: number;
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
  const [nextCustomer, setNextCustomer] = useState<NextCustomer | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsData, nextData] = await Promise.all([
        getDashboardStats().catch(() => null),
        getNextInQueue().catch(() => null),
      ]);
      if (statsData) setStats(statsData);
      if (nextData) setNextCustomer(nextData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const statCards = [
    { icon: 'bg-blue-500', label: 'Customers in Queue', value: stats.customersInQueue.toString() },
    { icon: 'bg-red-500', label: 'Occupied Tables', value: stats.occupiedTables.toString() },
    { icon: 'bg-green-600', label: 'Free Tables', value: stats.freeTables.toString() },
    { icon: 'bg-yellow-400', label: 'Avg. Wait Time', value: `${stats.avgWaitTime} min` },
    { icon: 'bg-gray-500', label: 'Longest Wait', value: `${stats.longestWait} min` },
    { icon: 'bg-gray-500', label: 'Parties Seated Today', value: stats.partiesSeatedToday.toString() },
  ];

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

      {/* Stats Cards */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {statCards.map((stat, i) => (
            <div key={i} className="flex flex-col items-start">
              <div className={`w-10 h-10 rounded-full ${stat.icon} flex items-center justify-center text-white mb-4`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Up To Be Seated */}
        <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-[#5D3FD3] font-semibold mb-4">Next Up To Be Seated</h3>
          <div className="border-t border-gray-100 pt-6">
            {nextCustomer ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{nextCustomer.customerName}</p>
                  <p className="text-sm text-gray-500">Party of {nextCustomer.partySize}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-800">Waiting queue is empty.</p>
            )}
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 h-80">
          <h3 className="text-[#5D3FD3] font-semibold mb-4">Seated Parties Per Hour</h3>
          <div className="h-full w-full relative">
            <div className="absolute left-0 top-0 bottom-8 w-px bg-gray-200"></div>
            <div className="absolute left-0 right-0 bottom-8 h-px bg-gray-200"></div>
            <span className="absolute left-[-20px] top-4 text-xs text-gray-400">1</span>
            <span className="absolute left-[-20px] bottom-8 text-xs text-gray-400">0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
