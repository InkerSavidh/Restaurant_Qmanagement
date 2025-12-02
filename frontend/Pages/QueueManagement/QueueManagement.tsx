import React, { useState, useEffect } from 'react';
import { getQueue, addToQueue, removeFromQueue, runAllocator, QueueEntry } from '../../api/queue.api';
import { getAllTables } from '../../api/tables.api';
import axiosInstance from '../../api/axiosInstance';

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

  useEffect(() => {
    fetchQueue();
    fetchTables();
    const interval = setInterval(fetchQueue, 15000);
    return () => clearInterval(interval);
  }, []);

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
    
    setNewCustomer({ name: '', partySize: '', phone: '' });
    
    try {
      await addToQueue(customerData);
      await fetchQueue();
    } catch (error) {
      console.error('Failed to add customer:', error);
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
    try {
      await removeFromQueue(id);
      await fetchQueue();
    } catch (error) { 
      console.error('Failed to remove:', error);
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
          <button onClick={handleRunAllocator} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Run Allocator Now
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Auto-Allocator</span>
            <button onClick={() => setAutoAllocator(!autoAllocator)} className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${autoAllocator ? 'bg-[#198754]' : 'bg-gray-300'}`}>
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ${autoAllocator ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden h-fit min-h-[400px]">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-[#5D3FD3] text-lg font-semibold">Waiting Queue ({queue.length})</h3>
          </div>
          <div className="grid grid-cols-5 p-4 bg-white text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-50">
            <div>Name</div><div># People</div><div>Wait Time</div><div>Phone</div><div>Action</div>
          </div>
          {loading ? (
            <div className="p-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5D3FD3] mx-auto"></div></div>
          ) : queue.length === 0 ? (
            <div className="p-12 text-center text-gray-400 italic text-sm">The waiting queue is empty.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {paginatedQueue.map((entry) => (
                <div key={entry.id} className="grid grid-cols-5 p-4 text-sm text-gray-700 items-center hover:bg-gray-50">
                  <div className="font-medium">{entry.customerName}</div>
                  <div>{entry.partySize}</div>
                  <div>{entry.waitTime} min</div>
                  <div className="text-gray-500">{entry.phone || '-'}</div>
                  <div><button onClick={() => handleRemove(entry.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Remove</button></div>
                </div>
              ))}
            </div>
          )}
          <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className={`bg-[#0d6efd] text-white px-4 py-1.5 rounded text-sm flex items-center gap-1 ${currentPage === 1 ? 'opacity-60' : 'hover:bg-blue-600'}`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg> Prev
            </button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages || 1, p + 1))} disabled={currentPage >= totalPages} className={`bg-[#0d6efd] text-white px-4 py-1.5 rounded text-sm flex items-center gap-1 ${currentPage >= totalPages ? 'opacity-60' : 'hover:bg-blue-600'}`}>
              Next <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <h3 className="text-[#5D3FD3] text-lg font-semibold mb-4">Add Customer</h3>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Name:</label><input type="text" value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Party Size:</label><input type="number" value={newCustomer.partySize} onChange={(e) => setNewCustomer({ ...newCustomer, partySize: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional):</label><input type="text" value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} placeholder="+91 98765 43210" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" /></div>
              <button type="submit" className="w-full bg-[#198754] hover:bg-green-700 text-white font-medium py-2 rounded transition-colors text-sm">Add to Queue</button>
            </form>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <h3 className="text-[#5D3FD3] text-lg font-semibold mb-4">Seat Manually</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer:</label>
                <select value={selectedCustomer} onChange={(e) => { setSelectedCustomer(e.target.value); setSelectedTables([]); }} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                  <option value="">-- Select from Queue --</option>
                  {queue.map((e) => <option key={e.id} value={e.id}>{e.customerName} (Party of {e.partySize})</option>)}
                </select>
              </div>
              
              {selectedCustomer && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Table(s): 
                    <span className="ml-2 text-xs text-gray-500">
                      (Party: {selectedCustomerData?.partySize} | Selected: {totalSelectedCapacity})
                    </span>
                  </label>
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded p-2 space-y-1">
                    {tables.map((t) => (
                      <label key={t.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedTables.includes(t.id)}
                          onChange={() => handleToggleTable(t.id)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">T{t.tableNumber} (Cap: {t.capacity})</span>
                      </label>
                    ))}
                  </div>
                  {selectedCustomerData && totalSelectedCapacity < selectedCustomerData.partySize && selectedTables.length > 0 && (
                    <p className="text-xs text-orange-500 mt-1">
                      Need {selectedCustomerData.partySize - totalSelectedCapacity} more seats
                    </p>
                  )}
                  {selectedCustomerData && totalSelectedCapacity >= selectedCustomerData.partySize && selectedTables.length > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Sufficient capacity ({totalSelectedCapacity} seats)
                    </p>
                  )}
                </div>
              )}
              
              <button onClick={handleSeatCustomer} disabled={!selectedCustomer || selectedTables.length === 0} className="w-full bg-[#0d6efd] hover:bg-blue-600 text-white font-medium py-2 rounded transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
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
