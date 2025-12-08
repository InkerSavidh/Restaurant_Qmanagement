import React, { useState, useEffect } from 'react';
import { getActiveSeating, endSeatingSession, SeatedParty } from '../../api/seating.api';
import { useSocket } from '../../hooks/useSocket';
import { ConnectionStatus } from '../../Components/ConnectionStatus';

interface GroupedParty {
  customerName: string;
  partySize: number;
  phone: string;
  seatedAt: string;
  tables: string[];
  sessionIds: string[];
}

const OccupiedTables: React.FC = () => {
  const [seatedParties, setSeatedParties] = useState<SeatedParty[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSeatedParties = async () => {
    try {
      const data = await getActiveSeating();
      setSeatedParties(data);
    } catch (error) {
      console.error('Error fetching seated parties:', error);
      setSeatedParties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeatedParties();
  }, []);

  // WebSocket real-time updates
  const { connectionStatus, error } = useSocket({
    'seating:created': fetchSeatedParties,
    'seating:ended': fetchSeatedParties,
  });

  // Group parties by customer name and phone (within 5 minutes)
  const groupedParties: GroupedParty[] = seatedParties.reduce((acc: GroupedParty[], party) => {
    const partyTime = new Date(party.seatedAt).getTime();
    
    const existing = acc.find((p) => {
      const existingTime = new Date(p.seatedAt).getTime();
      const timeDiff = Math.abs(partyTime - existingTime);
      const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
      
      return (
        p.customerName === party.customerName &&
        p.phone === party.phone &&
        timeDiff < fiveMinutes
      );
    });
    
    if (existing) {
      existing.tables.push(party.tableNumber);
      existing.sessionIds.push(party.id);
      // Use the earliest seated time
      if (partyTime < new Date(existing.seatedAt).getTime()) {
        existing.seatedAt = party.seatedAt;
      }
    } else {
      acc.push({
        customerName: party.customerName,
        partySize: party.partySize,
        phone: party.phone,
        seatedAt: party.seatedAt,
        tables: [party.tableNumber],
        sessionIds: [party.id],
      });
    }
    
    return acc;
  }, []);

  const handleCheckout = async (sessionIds: string[], customerName: string) => {
    if (!confirm(`Checkout ${customerName} from ${sessionIds.length} table(s)?`)) return;
    
    // Remove from UI immediately
    const previousParties = [...seatedParties];
    setSeatedParties(prev => prev.filter(p => !sessionIds.includes(p.id)));
    
    try {
      // Checkout only the first session - backend will handle all sessions for this customer
      await endSeatingSession(sessionIds[0]);
      // Refresh to sync with backend
      await fetchSeatedParties();
    } catch (error: any) {
      console.error('Failed to checkout:', error);
      // Restore on error
      setSeatedParties(previousParties);
      alert(error.response?.data?.message || 'Failed to checkout customer');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ConnectionStatus status={connectionStatus} error={error} />
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Seated Parties ({loading ? '...' : groupedParties.length})</h2>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {/* Mobile: Scrollable table */}
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-6 p-3 sm:p-4 border-b border-gray-100 bg-white text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
              <div>Table</div>
              <div>Customer Name</div>
              <div>Party Size</div>
              <div>Phone</div>
              <div>Seated At</div>
              <div>Actions</div>
            </div>

            {loading ? (
              <div className="divide-y divide-gray-50">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-6 p-3 sm:p-4 items-center animate-pulse">
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-12 sm:w-16"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-24 sm:w-32"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-6 sm:w-8"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-20 sm:w-24"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-20"></div>
                    <div className="h-6 sm:h-8 bg-gray-200 rounded w-16 sm:w-20"></div>
                  </div>
                ))}
              </div>
            ) : groupedParties.length === 0 ? (
              <div className="p-8 sm:p-12 text-center text-gray-500 italic text-xs sm:text-sm">
                No parties are currently seated.
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {groupedParties.map((party, index) => (
                  <div key={index} className="grid grid-cols-6 p-3 sm:p-4 text-xs sm:text-sm text-gray-700 items-center hover:bg-gray-50">
                    <div className="font-semibold">{party.tables.join(', ')}</div>
                    <div className="truncate pr-2">{party.customerName}</div>
                    <div>{party.partySize}</div>
                    <div className="text-gray-500">{party.phone || '-'}</div>
                    <div className="text-gray-500">{formatTime(party.seatedAt)}</div>
                    <div>
                      <button
                        onClick={() => handleCheckout(party.sessionIds, party.customerName)}
                        className="bg-[#198754] hover:bg-green-700 text-white px-3 py-1 rounded-full text-xs font-medium"
                      >
                        Checkout
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OccupiedTables;
