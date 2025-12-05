import React, { useState, useEffect } from 'react';
import { getQueue, addToQueue, removeFromQueue, runAllocator, QueueEntry } from '../../api/queue.api';
import { getAllTables } from '../../api/tables.api';
import axiosInstance from '../../api/axiosInstance';
import { useSocket } from '../../hooks/useSocket';
import { ConnectionStatus } from '../../Components/ConnectionStatus';

interface Table {
  id: string;
  tableNumber: string;
  capacity: number;
  status: string;
}

const QueueManagement: React.FC = () => {
  const [autoAllocator, setAutoAllocator] = useState(true);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [newCustomer, setNewCustomer] = useState({ name: '', partySize: '', phone: '' });
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedTables, setSelectedTables] = useState<string[]>([]);

  const fetchTables = async () => {
    try {
      const data = await getAllTables();
      setTables(data.filter((t: Table) => t.status === 'AVAILABLE'));
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const fetchQueue = async () => {
    try {
      const data = await getQueue();
      setQueue(data);
    } catch (error) {
      console.error('Error fetching queue:', error);
      setQueue([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    fetchTables();
  }, []);

  // WebSocket real-time updates
  const { connectionStatus, error } = useSocket({
    'queue:updated': fetchQueue,
    'table:updated': fetchTables,
  });

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.partySize) {
      alert('Please fill in required fields');
      return;
    }
    
    const customerData = {
      name: newCustomer.name,
      partySize: parseInt(newCustomer.partySize),
      phone: newCustomer.phone
    };
    
    // Create optimistic entry with temporary ID
    const optimisticEntry: QueueEntry = {
      id: `temp-${Date.now()}`,
      customerName: customerData.name,
      partySize: customerData.partySize,
      phone: customerData.phone || '',
      waitTime: 0,
      position: queue.length + 1,
      entryTime: new Date().toISOString(),
      status: 'WAITING'
    };
    
    // Add to UI immediately
    setQueue(prev => [...prev, optimisticEntry]);
    setNewCustomer({ name: '', partySize: '', phone: '' });
    
    try {
      await addToQueue(customerData);
      // Refresh to get real data from server
      await fetchQueue();
    } catch (error) {
      console.error('Failed to add customer:', error);
      // Remove optimistic entry on failure
      setQueue(prev => prev.filter(q => q.id !== optimisticEntry.id));
      alert('Failed to add customer');
    }
  };

  const handleToggleTable = (tableId: string) => {
    setSelectedTables(prev => 
      prev.includes(tableId) 
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    );
  };

  const handleSeatCustomer = async () => {
    if (!selectedCustomer) { alert('Please select a customer'); return; }
    if (selectedTables.length === 0) { alert('Please select at least one table'); return; }
    
    const customer = queue.find(q => q.id === selectedCustomer);
    const totalCapacity = selectedTables.reduce((sum, tableId) => {
      const table = tables.find(t => t.id === tableId);
      return sum + (table?.capacity || 0);
    }, 0);

    if (customer && totalCapacity < customer.partySize) {
      alert(`Selected tables capacity (${totalCapacity}) is less than party size (${customer.partySize})`);
      return;
    }

    // Optimistically update UI - remove customer from queue
    const previousQueue = [...queue];
    setQueue(prev => prev.filter(q => q.id !== selectedCustomer));
    
    try {
      await axiosInstance.post('/seating/seat-multiple', { 
        queueEntryId: selectedCustomer, 
        tableIds: selectedTables 
      });
      setSelectedCustomer(''); 
      setSelectedTables([]);
      await fetchQueue();
      await fetchTables();
    } catch (error: any) { 
      console.error('Failed to seat customer:', error);
      // Restore queue on error
      setQueue(previousQueue);
      alert(error.response?.data?.message || 'Failed to seat customer');
    }
  };

  const handleRunAllocator = async () => {
    try {
      await runAllocator();
      fetchQueue();
    } catch (error) { console.error('No customers to allocate:', error); }
  };

  const handleRemove = async (id: string) => {
    // Remove from UI immediately
    const previousQueue = [...queue];
    setQueue(prev => prev.filter(q => q.id !== id));
    
    try {
      await removeFromQueue(id);
      // Refresh to sync with server
      await fetchQueue();
    } catch (error) { 
      console.error('Failed to remove:', error);
      // Restore on failure
      setQueue(previousQueue);
      alert('Failed to remove customer');
    }
  };

  const totalPages = Math.ceil(queue.length / itemsPerPage);
  const paginatedQueue = queue.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const selectedCustomerData = queue.find(q => q.id === selectedCustomer);
  const totalSelectedCapacity = selectedTables.reduce((sum, tableId) => {
    const table = tables.find(t => t.id === tableId);
    return sum + (table?.capacity || 0);
  }, 0);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Queue Management</h2>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleRunAllocator} 
            className="bg-[#5D3FD3] hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Run Allocator Now
          </button>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-md border border-gray-200 shadow-sm">
            <span className="text-sm font-medium text-gray-700">Auto-Allocator</span>
            <button 
              onClick={() => setAutoAllocator(!autoAllocator)} 
              className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-300 ${autoAllocator ? 'bg-[#198754]' : 'bg-gray-300'}`}
              aria-label="Toggle auto-allocator"
            >
              <span 
                className={`inline-block w-4 h-4 m-1 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-in-out ${autoAllocator ? 'translate-x-[0.7rem]' : 'translate-x-0'}`}
              />
            </button>
            <span className={`text-xs font-semibold ${autoAllocator ? 'text-green-600' : 'text-gray-500'}`}>
              {autoAllocator ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden h-fit min-h-[300px] sm:min-h-[400px]">
          <div className="p-4 sm:p-5 border-b border-gray-100">
            <h3 className="text-[#5D3FD3] text-base sm:text-lg font-semibold">Waiting Queue ({queue.length})</h3>
          </div>
          {/* Mobile: Scrollable table */}
          <div className="overflow-x-auto">
            <div className="min-w-[500px]">
              <div className="grid grid-cols-5 p-3 sm:p-4 bg-white text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-50">
                <div>Name</div><div># People</div><div>Wait Time</div><div className="hidden sm:block">Phone</div><div className="sm:hidden">Phone</div><div>Action</div>
              </div>
              {loading ? (
                <div className="divide-y divide-gray-50">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="grid grid-cols-5 p-3 sm:p-4 items-center animate-pulse">
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-24 sm:w-32"></div>
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-6 sm:w-8"></div>
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-12 sm:w-16"></div>
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-24"></div>
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-12 sm:w-16"></div>
                    </div>
                  ))}
                </div>
              ) : queue.length === 0 ? (
                <div className="p-8 sm:p-12 text-center text-gray-400 italic text-xs sm:text-sm">The waiting queue is empty.</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {paginatedQueue.map((entry) => (
                    <div key={entry.id} className="grid grid-cols-5 p-3 sm:p-4 text-xs sm:text-sm text-gray-700 items-center hover:bg-gray-50">
                      <div className="font-medium truncate pr-2">{entry.customerName}</div>
                      <div>{entry.partySize}</div>
                      <div>{entry.waitTime} min</div>
                      <div className="text-gray-500 truncate pr-2">{entry.phone || '-'}</div>
                      <div><button onClick={() => handleRemove(entry.id)} className="text-red-500 hover:text-red-700 text-[10px] sm:text-xs font-medium">Remove</button></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="p-3 sm:p-4 border-t border-gray-100 flex justify-end gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className={`bg-[#0d6efd] text-white px-3 sm:px-4 py-1.5 rounded text-xs sm:text-sm flex items-center gap-1 ${currentPage === 1 ? 'opacity-60' : 'hover:bg-blue-600'}`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg> <span className="hidden sm:inline">Prev</span>
            </button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages || 1, p + 1))} disabled={currentPage >= totalPages} className={`bg-[#0d6efd] text-white px-3 sm:px-4 py-1.5 rounded text-xs sm:text-sm flex items-center gap-1 ${currentPage >= totalPages ? 'opacity-60' : 'hover:bg-blue-600'}`}>
              <span className="hidden sm:inline">Next</span> <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-5">
            <h3 className="text-[#5D3FD3] text-base sm:text-lg font-semibold mb-3 sm:mb-4">Add Customer</h3>
            <form onSubmit={handleAddCustomer} className="space-y-3 sm:space-y-4">
              <div><label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Name:</label><input type="text" value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-blue-500" /></div>
              <div><label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Party Size:</label><input type="number" value={newCustomer.partySize} onChange={(e) => setNewCustomer({ ...newCustomer, partySize: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-blue-500" /></div>
              <div><label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Phone (Optional):</label><input type="text" value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} placeholder="+91 98765 43210" className="w-full border border-gray-300 rounded px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-blue-500" /></div>
              <button type="submit" className="w-full bg-[#198754] hover:bg-green-700 text-white font-medium py-2 rounded transition-colors text-xs sm:text-sm">Add to Queue</button>
            </form>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-5">
            <h3 className="text-[#5D3FD3] text-base sm:text-lg font-semibold mb-3 sm:mb-4">Seat Manually</h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Customer:</label>
                <select value={selectedCustomer} onChange={(e) => { setSelectedCustomer(e.target.value); setSelectedTables([]); }} className="w-full border border-gray-300 rounded px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-blue-500">
                  <option value="">-- Select from Queue --</option>
                  {queue.map((e) => <option key={e.id} value={e.id}>{e.customerName} (Party of {e.partySize})</option>)}
                </select>
              </div>
              
              {selectedCustomer && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Select Table(s): 
                    <span className="ml-2 text-[10px] sm:text-xs text-gray-500 block sm:inline mt-1 sm:mt-0">
                      (Party: {selectedCustomerData?.partySize} | Selected: {totalSelectedCapacity})
                    </span>
                  </label>
                  <div className="max-h-40 sm:max-h-48 overflow-y-auto border border-gray-200 rounded p-2 space-y-1">
                    {tables.map((t) => (
                      <label key={t.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedTables.includes(t.id)}
                          onChange={() => handleToggleTable(t.id)}
                          className="w-4 h-4 text-blue-600 flex-shrink-0"
                        />
                        <span className="text-xs sm:text-sm">T{t.tableNumber} (Cap: {t.capacity})</span>
                      </label>
                    ))}
                  </div>
                  {selectedCustomerData && totalSelectedCapacity < selectedCustomerData.partySize && selectedTables.length > 0 && (
                    <p className="text-[10px] sm:text-xs text-orange-500 mt-1">
                      Need {selectedCustomerData.partySize - totalSelectedCapacity} more seats
                    </p>
                  )}
                  {selectedCustomerData && totalSelectedCapacity >= selectedCustomerData.partySize && selectedTables.length > 0 && (
                    <p className="text-[10px] sm:text-xs text-green-600 mt-1">
                      ✓ Sufficient capacity ({totalSelectedCapacity} seats)
                    </p>
                  )}
                </div>
              )}
              
              <button onClick={handleSeatCustomer} disabled={!selectedCustomer || selectedTables.length === 0} className="w-full bg-[#0d6efd] hover:bg-blue-600 text-white font-medium py-2 rounded transition-colors text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                Seat Customer ({selectedTables.length} table{selectedTables.length !== 1 ? 's' : ''})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueManagement;
