import React, { useState, useEffect } from 'react';
import { getActiveSeating, endSeatingSession, SeatedParty } from '../../api/seating.api';

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSeatedParties();
    const interval = setInterval(fetchSeatedParties, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSeatedParties = async () => {
    try {
      const data = await getActiveSeating();
      setSeatedParties(data);
    } catch (error) {
      console.error('Error fetching seated parties:', error);
      setSeatedParties([]);
    }
  };

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
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Seated Parties ({groupedParties.length})</h2>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-6 p-4 border-b border-gray-100 bg-white text-xs font-bold text-gray-500 uppercase tracking-wider">
          <div>Table</div>
          <div>Customer Name</div>
          <div>Party Size</div>
          <div>Phone</div>
          <div>Seated At</div>
          <div>Actions</div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5D3FD3] mx-auto"></div>
          </div>
        ) : groupedParties.length === 0 ? (
          <div className="p-12 text-center text-gray-500 italic text-sm">
            No parties are currently seated.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {groupedParties.map((party, index) => (
              <div key={index} className="grid grid-cols-6 p-4 text-sm text-gray-700 items-center hover:bg-gray-50">
                <div className="font-semibold">{party.tables.join(', ')}</div>
                <div>{party.customerName}</div>
                <div>{party.partySize}</div>
                <div className="text-gray-500">{party.phone || '-'}</div>
                <div className="text-gray-500">{formatTime(party.seatedAt)}</div>
                <div>
                  <button
                    onClick={() => handleCheckout(party.sessionIds, party.customerName)}
                    className="bg-[#198754] hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium"
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
  );
};

export default OccupiedTables;
