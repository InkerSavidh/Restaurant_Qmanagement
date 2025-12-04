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
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Activity Log</h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-5 gap-4 mb-4">
          <div><label className="block text-xs font-semibold text-gray-700 mb-1">User Type</label><select value={filters.userType} onChange={(e) => setFilters({ ...filters, userType: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm"><option value="">All Users</option><option value="ADMIN">Admin</option><option value="WAITER">Waiter</option></select></div>
          <div><label className="block text-xs font-semibold text-gray-700 mb-1">User Name</label><select value={filters.userName} onChange={(e) => setFilters({ ...filters, userName: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm"><option value="">All Names</option>{users.map((u) => <option key={u} value={u}>{u}</option>)}</select></div>
          <div><label className="block text-xs font-semibold text-gray-700 mb-1">Table</label><select value={filters.table} onChange={(e) => setFilters({ ...filters, table: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm"><option value="">All Tables</option></select></div>
          <div><label className="block text-xs font-semibold text-gray-700 mb-1">Start Date</label><input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" /></div>
          <div><label className="block text-xs font-semibold text-gray-700 mb-1">End Date</label><input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" /></div>
        </div>
        <div className="flex gap-2"><button onClick={handleFilter} className="bg-[#0d6efd] text-white px-6 py-2 rounded text-sm font-medium hover:bg-blue-600">Filter</button><button onClick={handleClear} className="bg-gray-500 text-white px-6 py-2 rounded text-sm font-medium hover:bg-gray-600">Clear</button></div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-12 p-4 bg-white border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider"><div className="col-span-2">Timestamp</div><div className="col-span-1">User</div><div className="col-span-2">Action Badge</div><div className="col-span-7">Action Details</div></div>
        {loading ? (<div className="p-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5D3FD3] mx-auto"></div></div>
        ) : logs.length === 0 ? (<div className="p-12 text-center text-gray-500 italic text-sm">No activity logs found.</div>
        ) : (<div className="divide-y divide-gray-50">{logs.map((log) => (
          <div key={log.id} className="grid grid-cols-12 p-4 text-sm text-gray-700 items-center hover:bg-gray-50">
            <div className="col-span-2 text-gray-500 text-xs">{log.timestamp}</div>
            <div className="col-span-1 font-semibold">{log.user}</div>
            <div className="col-span-2"><span className={`${getBadgeColor(log.badge)} text-white px-3 py-1 rounded-full text-xs font-medium`}>{log.badge}</span></div>
            <div className="col-span-7 text-gray-600">{log.details}</div>
          </div>))}</div>)}
      </div>
    </div>
  );
};

export default ActivityLog;
