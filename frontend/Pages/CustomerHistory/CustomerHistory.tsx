import React, { useState, useEffect } from 'react';
import { getCustomerHistory, HistoryEntry, HistoryFilters } from '../../api/history.api';

const CustomerHistory: React.FC = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<HistoryFilters>({ startDate: '', endDate: '', customerName: '', tableNumber: '' });

  useEffect(() => { fetchHistory(); }, []);

  // Format date as "20 Nov 2025, 4:33 pm"
  const formatArrivalTime = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    const time = date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${day} ${month} ${year}, ${time}`;
  };

  // Format time as "4:00 pm"
  const formatTime = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getCustomerHistory(filters);
      console.log('Customer history data:', data);
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch customer history:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => fetchHistory();
  const handleClearFilter = () => { setFilters({ startDate: '', endDate: '', customerName: '', tableNumber: '' }); fetchHistory(); };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Customer Analytics & History</h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
        <h3 className="text-[#5D3FD3] text-base sm:text-lg font-semibold mb-3 sm:mb-4">Filter History</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 items-end">
          <div><label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Start Date:</label><input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-xs sm:text-sm" /></div>
          <div><label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">End Date:</label><input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-xs sm:text-sm" /></div>
          <div><label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Customer Name:</label><input type="text" value={filters.customerName} onChange={(e) => setFilters({ ...filters, customerName: e.target.value })} placeholder="Search by name..." className="w-full border border-gray-300 rounded px-3 py-2 text-xs sm:text-sm" /></div>
          <div><label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Table Number:</label><input type="text" value={filters.tableNumber} onChange={(e) => setFilters({ ...filters, tableNumber: e.target.value })} placeholder="e.g., T5" className="w-full border border-gray-300 rounded px-3 py-2 text-xs sm:text-sm" /></div>
          <div className="flex gap-2 sm:col-span-2 lg:col-span-1"><button onClick={handleApplyFilter} className="bg-[#0d6efd] text-white px-4 py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-blue-600 flex-1">Apply Filter</button><button onClick={handleClearFilter} className="bg-gray-500 text-white px-4 py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-gray-600 flex-1">Clear</button></div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {/* Mobile: Scrollable table */}
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-9 p-3 sm:p-4 bg-white border-b border-gray-100 text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
              <div>Name</div><div>Phone</div><div>Party Size</div><div>Table Seated</div><div>Arrival Time</div><div>Seated Time</div><div>Departed Time</div><div>Total Wait (Min)</div><div>Dine Time (Min)</div>
            </div>
            {loading ? (
              <div className="divide-y divide-gray-50">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-9 p-3 sm:p-4 items-center animate-pulse">
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-20 sm:w-24"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-20"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-6 sm:w-8"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-10 sm:w-12"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-28 sm:w-32"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-12 sm:w-16"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-12 sm:w-16"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-10 sm:w-12"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-10 sm:w-12"></div>
                  </div>
                ))}
              </div>
            ) : history.length === 0 ? (<div className="p-8 sm:p-12 text-center text-gray-500 italic text-xs sm:text-sm">No history records found.</div>
            ) : (<div className="divide-y divide-gray-50">{history.map((item) => (
              <div key={item.id} className="grid grid-cols-9 p-3 sm:p-4 text-xs sm:text-sm text-gray-700 items-center hover:bg-gray-50">
                <div className="font-bold truncate pr-2">{item.name}</div><div className="text-gray-500 truncate pr-2">{item.phone}</div><div className="pl-2 sm:pl-4">{item.partySize}</div><div className="pl-1 sm:pl-2">{item.tableSeated}</div><div className="text-gray-500 truncate pr-2">{formatArrivalTime(item.arrivalTime)}</div><div className="text-gray-500 truncate pr-2">{formatTime(item.seatedTime)}</div><div className="text-gray-500 truncate pr-2">{formatTime(item.departedTime)}</div><div className="pl-2 sm:pl-4">{item.totalWait}</div><div className="pl-2 sm:pl-4">{item.dineTime}</div>
              </div>))}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerHistory;
