import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { getTablesByFloor, updateTableStatus, getFloors, createTable, deleteTable } from '../../api/tables.api';
import { useSocket } from '../../hooks/useSocketManager';
import { useThrottle } from '../../hooks/useDebounce';
import { ConnectionStatus } from '../../Components/ConnectionStatus';

interface Table {
  id: string;
  tableNumber: string;
  capacity: number;
  status: string;
}

interface Floor {
  id: string;
  name: string;
}

const TableStatus: React.FC = () => {
  const [activeFloor, setActiveFloor] = useState<string>('1');
  const [floors, setFloors] = useState<Floor[]>([
    { id: '1', name: 'Ground Floor' },
    { id: '2', name: 'First Floor' },
  ]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState(4);
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  const sortTablesByNumber = (tables: Table[]) => {
    return tables.sort((a, b) => {
      const numA = parseInt(a.tableNumber) || 0;
      const numB = parseInt(b.tableNumber) || 0;
      return numA - numB;
    });
  };

  const generateMockTables = () => {
    const startNum = activeFloor === '1' ? 1 : 49;
    const mockTables: Table[] = Array.from({ length: 48 }, (_, i) => ({
      id: `table-${startNum + i}`,
      tableNumber: `T${startNum + i}`,
      capacity: (startNum + i) % 3 === 0 ? 6 : (startNum + i) % 2 === 0 ? 4 : 2,
      status: 'AVAILABLE',
    }));
    setTables(mockTables);
  };

  const lastFetchRef = useRef<string>('');

  const fetchTablesInternal = async () => {
    const currentFloor = activeFloor;
    
    // Prevent duplicate calls for same floor
    if (lastFetchRef.current === currentFloor) {
      console.log('⚠️ Tables already being fetched for floor:', currentFloor);
      return;
    }
    
    lastFetchRef.current = currentFloor;
    console.log('📋 Fetching tables for floor:', currentFloor);
    
    try {
      const data = await getTablesByFloor(currentFloor);
      setTables(sortTablesByNumber(data));
      console.log('✅ Tables loaded:', data.length);
    } catch (error) {
      console.error('❌ Error fetching tables:', error);
      generateMockTables();
    } finally {
      // Reset after a delay to allow future fetches
      setTimeout(() => {
        lastFetchRef.current = '';
        setLoading(false);
      }, 100);
    }
  };

  // Debounce fetchTables to prevent rapid successive calls
  const fetchTables = useCallback(
    useThrottle(fetchTablesInternal, 500), // 500ms throttle
    [activeFloor]
  );

  const floorsLoadedRef = useRef(false);

  const fetchFloors = useCallback(async () => {
    // Prevent double calls in React StrictMode
    if (floorsLoadedRef.current) {
      console.log('⚠️ Floors already loaded, skipping fetch');
      return;
    }
    
    floorsLoadedRef.current = true;
    console.log('🏢 Fetching floors (first time only)');
    
    try {
      const data = await getFloors();
      if (data && data.length > 0) {
        console.log('✅ Floors loaded:', data.length);
        setFloors(data);
        setActiveFloor(data[0].id);
      }
    } catch (error) {
      // Reset flag on error so it can retry
      floorsLoadedRef.current = false;
      console.error('❌ Error fetching floors:', error);
    }
  }, []);

  // Memoized WebSocket handlers to prevent recreation
  const handleTableStatusChanged = useCallback((data: { tableId: string; status: string }) => {
    setTables(prev => prev.map(t => 
      t.id === data.tableId ? { ...t, status: data.status } : t
    ));
  }, []);

  const handleTableCreated = useCallback(() => {
    fetchTables(); // Fetch all when new table added
  }, [fetchTables]);

  const handleTableDeleted = useCallback(() => {
    fetchTables(); // Fetch all when table deleted  
  }, [fetchTables]);

  // Memoize WebSocket events to prevent reconnections
  const socketEvents = useMemo(() => ({
    'table:statusChanged': handleTableStatusChanged,
    'table:created': handleTableCreated,
    'table:deleted': handleTableDeleted,
  }), [handleTableStatusChanged, handleTableCreated, handleTableDeleted]);

  const { connectionStatus, error } = useSocket(socketEvents);

  useEffect(() => {
    fetchFloors();
  }, []);

  useEffect(() => {
    if (activeFloor) {
      setLoading(true);
      fetchTables();
    }
  }, [activeFloor]);

  const handleStatusChangeInternal = async (tableId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';
    
    // Optimistic update - change UI immediately
    setTables(prev => prev.map(t => 
      t.id === tableId ? { ...t, status: newStatus } : t
    ));
    
    try {
      // Update on server in background
      await updateTableStatus(tableId, newStatus);
    } catch (error) {
      // Revert on error
      console.error('Failed to update table status:', error);
      setTables(prev => prev.map(t => 
        t.id === tableId ? { ...t, status: currentStatus } : t
      ));
      alert('Failed to update table status');
    }
  };

  // Throttle status changes to prevent rapid clicking
  const handleStatusChange = useThrottle(handleStatusChangeInternal, 1000);

  const handleAddTable = async () => {
    if (!newTableNumber.trim()) {
      alert('Please enter a table number');
      return;
    }
    try {
      await createTable({
        tableNumber: newTableNumber,
        capacity: newTableCapacity,
        floorId: activeFloor,
      });
      setNewTableNumber('');
      setNewTableCapacity(4);
      fetchTables();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add table');
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return;
    try {
      await deleteTable(tableId);
      fetchTables();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete table');
    }
  };

  const getStatusDisplay = (status: string) => status === 'AVAILABLE' ? 'FREE' : status;
  const isAvailable = (status: string) => status === 'AVAILABLE';

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ConnectionStatus status={connectionStatus} error={error} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Table Status</h2>
        <button 
          onClick={() => setShowEditModal(true)}
          className="bg-[#5D3FD3] hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-md flex items-center gap-2 text-xs sm:text-sm w-full sm:w-auto justify-center"
        >
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Layout
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
        {floors.map(floor => (
          <button
            key={floor.id}
            onClick={() => setActiveFloor(floor.id)}
            className={`px-4 sm:px-6 py-2 rounded-md text-xs sm:text-sm font-medium border flex-1 sm:flex-initial ${
              activeFloor === floor.id
                ? 'bg-[#0d6efd] text-white border-[#0d6efd]'
                : 'bg-white text-[#0d6efd] border-[#0d6efd] hover:bg-blue-50'
            }`}
          >
            {floor.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-3">
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-2 sm:p-3 flex flex-col items-center justify-between aspect-square bg-gray-100 animate-pulse">
              <div className="text-center mt-1 sm:mt-2 w-full">
                <div className="h-4 sm:h-5 bg-gray-200 rounded w-10 sm:w-12 mx-auto mb-1 sm:mb-2"></div>
                <div className="h-2 sm:h-3 bg-gray-200 rounded w-12 sm:w-16 mx-auto mb-1"></div>
                <div className="h-2 sm:h-3 bg-gray-200 rounded w-10 sm:w-14 mx-auto"></div>
              </div>
              <div className="h-5 sm:h-6 bg-gray-200 rounded w-full mt-1 sm:mt-2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-3">
          {sortTablesByNumber([...tables]).map((table) => (
            <div
              key={table.id}
              className={`border rounded-lg p-2 sm:p-3 flex flex-col items-center justify-between aspect-square ${
                isAvailable(table.status) ? 'bg-green-100 border-green-300' : 'bg-gray-100 border-gray-300'
              }`}
            >
              <div className="text-center mt-1 sm:mt-2">
                <div className="font-bold text-sm sm:text-base text-gray-700">T{table.tableNumber}</div>
                <div className="text-[10px] sm:text-xs text-gray-500">Cap: {table.capacity}</div>
                <div className={`text-[8px] sm:text-[10px] font-bold mt-0.5 sm:mt-1 uppercase ${isAvailable(table.status) ? 'text-green-700' : 'text-gray-500'}`}>
                  {getStatusDisplay(table.status)}
                </div>
              </div>
              <button
                onClick={() => handleStatusChange(table.id, table.status)}
                className={`w-full text-[8px] sm:text-[10px] py-0.5 sm:py-1 rounded text-white ${
                  isAvailable(table.status) ? 'bg-gray-500 hover:bg-gray-600' : 'bg-[#198754] hover:bg-green-700'
                }`}
              >
                {isAvailable(table.status) ? 'Unavailable' : 'Make Available'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Edit Layout Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className="text-lg sm:text-xl font-bold">Edit Table Layout</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700 p-1">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Add New Table Form */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-semibold mb-3">Add New Table</h4>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">Table Number</label>
                  <input
                    type="text"
                    value={newTableNumber}
                    onChange={(e) => setNewTableNumber(e.target.value)}
                    placeholder="e.g., 15"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5D3FD3]"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">Capacity</label>
                  <select
                    value={newTableCapacity}
                    onChange={(e) => setNewTableCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5D3FD3]"
                  >
                    {[2, 4, 6, 8, 10, 12].map(cap => (
                      <option key={cap} value={cap}>{cap} seats</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleAddTable}
                  className="bg-[#198754] hover:bg-green-700 text-white px-4 py-2 rounded-md"
                >
                  Add Table
                </button>
              </div>
            </div>

            {/* Existing Tables List */}
            <div>
              <h4 className="font-semibold mb-3">Existing Tables ({floors.find(f => f.id === activeFloor)?.name})</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {sortTablesByNumber([...tables]).map(table => (
                  <div key={table.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="font-medium">T{table.tableNumber}</span>
                      <span className="text-sm text-gray-500">Capacity: {table.capacity}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        isAvailable(table.status) ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {getStatusDisplay(table.status)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteTable(table.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete table"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowEditModal(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableStatus;
