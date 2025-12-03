import React, { useState, useEffect } from 'react';
import { getCustomerHistory, HistoryEntry, HistoryFilters } from '../../api/history.api';

const CustomerHistory: React.FC = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
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
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Analytics & History</h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-[#5D3FD3] text-lg font-semibold mb-4">Filter History</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 items-end">
          <div><label className="block text-xs font-semibold text-gray-700 mb-1">Start Date:</label><input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" /></div>
          <div><label className="block text-xs font-semibold text-gray-700 mb-1">End Date:</label><input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" /></div>
          <div><label className="block text-xs font-semibold text-gray-700 mb-1">Customer Name:</label><input type="text" value={filters.customerName} onChange={(e) => setFilters({ ...filters, customerName: e.target.value })} placeholder="Search by name..." className="w-full border border-gray-300 rounded px-3 py-2 text-sm" /></div>
          <div><label className="block text-xs font-semibold text-gray-700 mb-1">Table Number:</label><input type="text" value={filters.tableNumber} onChange={(e) => setFilters({ ...filters, tableNumber: e.target.value })} placeholder="e.g., T5" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" /></div>
          <div className="flex gap-2"><button onClick={handleApplyFilter} className="bg-[#0d6efd] text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-600 flex-1">Apply Filter</button><button onClick={handleClearFilter} className="bg-gray-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-600 flex-1">Clear</button></div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-9 p-4 bg-white border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          <div>Name</div><div>Phone</div><div>Party Size</div><div>Table Seated</div><div>Arrival Time</div><div>Seated Time</div><div>Departed Time</div><div>Total Wait (Min)</div><div>Dine Time (Min)</div>
        </div>
        {loading ? (<div className="p-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5D3FD3] mx-auto"></div></div>
        ) : history.length === 0 ? (<div className="p-12 text-center text-gray-500 italic text-sm">No history records found.</div>
        ) : (<div className="divide-y divide-gray-50">{history.map((item) => (
          <div key={item.id} className="grid grid-cols-9 p-4 text-xs text-gray-700 items-center hover:bg-gray-50">
            <div className="font-bold">{item.name}</div><div className="text-gray-500">{item.phone}</div><div className="pl-4">{item.partySize}</div><div className="pl-2">{item.tableSeated}</div><div className="text-gray-500">{formatArrivalTime(item.arrivalTime)}</div><div className="text-gray-500">{formatTime(item.seatedTime)}</div><div className="text-gray-500">{formatTime(item.departedTime)}</div><div className="pl-4">{item.totalWait}</div><div className="pl-4">{item.dineTime}</div>
          </div>))}</div>)}
      </div>
    </div>
  );
};

export default CustomerHistory;
