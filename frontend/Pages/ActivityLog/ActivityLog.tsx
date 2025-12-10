import React, { useState, useEffect } from 'react';
import { getActivityLogs, ActivityLog as ActivityLogType, ActivityFilters } from '../../api/activity.api';

const ActivityLog: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLogType[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ActivityFilters>({ userType: '', userName: '', table: '', startDate: '', endDate: '' });
  const [users] = useState(['Admin', 'test']);

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    try {
      const data = await getActivityLogs(filters);
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
      setLogs([]);
    }
  };

  const handleFilter = () => fetchLogs();
  const handleClear = () => { setFilters({ userType: '', userName: '', table: '', startDate: '', endDate: '' }); fetchLogs(); };

  const getBadgeColor = (badge: string) => {
    switch (badge) { case 'Cleared': return 'bg-[#198754]'; case 'Blocked': return 'bg-[#dc3545]'; case 'Made Available': return 'bg-[#0d6efd]'; default: return 'bg-gray-500'; }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Activity Log</h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div><label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">User Type</label><select value={filters.userType} onChange={(e) => setFilters({ ...filters, userType: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-xs sm:text-sm"><option value="">All Users</option><option value="ADMIN">Admin</option><option value="WAITER">Waiter</option></select></div>
          <div><label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">User Name</label><select value={filters.userName} onChange={(e) => setFilters({ ...filters, userName: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-xs sm:text-sm"><option value="">All Names</option>{users.map((u) => <option key={u} value={u}>{u}</option>)}</select></div>
          <div><label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Table</label><select value={filters.table} onChange={(e) => setFilters({ ...filters, table: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-xs sm:text-sm"><option value="">All Tables</option></select></div>
          <div><label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Start Date</label><input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-xs sm:text-sm" /></div>
          <div><label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">End Date</label><input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-xs sm:text-sm" /></div>
        </div>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-5"><button onClick={handleFilter} className="bg-[#0d6efd] text-white px-4 sm:px-6 py-2 rounded text-xs sm:text-sm font-medium hover:bg-blue-600 flex-1">Filter</button><button onClick={handleClear} className="bg-gray-500 text-white px-4 sm:px-6 py-2 rounded text-xs sm:text-sm font-medium hover:bg-gray-600 flex-1">Clear</button></div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {/* Mobile: Scrollable table */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-12 p-3 sm:p-4 bg-white border-b border-gray-100 text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider"><div className="col-span-2">Timestamp</div><div className="col-span-1">User</div><div className="col-span-2">Action Badge</div><div className="col-span-7">Action Details</div></div>
            {loading ? (
              <div className="divide-y divide-gray-50">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="grid grid-cols-12 p-3 sm:p-4 items-center">
                    <div className="col-span-2 h-3 w-20 sm:w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="col-span-1 h-3 w-12 sm:w-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="col-span-2 h-6 w-16 sm:w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="col-span-7 h-3 w-32 sm:w-48 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : logs.length === 0 ? (<div className="p-8 sm:p-12 text-center text-gray-500 italic text-xs sm:text-sm">No activity logs found.</div>
            ) : (<div className="divide-y divide-gray-50">{logs.map((log) => (
              <div key={log.id} className="grid grid-cols-12 p-3 sm:p-4 text-xs sm:text-sm text-gray-700 items-center hover:bg-gray-50">
                <div className="col-span-2 text-gray-500 text-[10px] sm:text-xs truncate pr-2">{log.timestamp}</div>
                <div className="col-span-1 font-semibold truncate pr-2">{log.user}</div>
                <div className="col-span-2"><span className={`${getBadgeColor(log.badge)} text-white px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium`}>{log.badge}</span></div>
                <div className="col-span-7 text-gray-600 truncate pr-2">{log.details}</div>
              </div>))}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
