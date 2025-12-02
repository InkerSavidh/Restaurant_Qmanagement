import React, { useState, useEffect } from 'react';
import { getActiveSeating, endSeatingSession, SeatedParty } from '../../api/seating.api';

const OccupiedTables: React.FC = () => {
  const [seatedParties, setSeatedParties] = useState<SeatedParty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSeatedParties();
    const interval = setInterval(fetchSeatedParties, 30000);
    return () => clearInterval(interval);
  }, []);

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

  const handleCheckout = async (sessionId: string, customerName: string) => {
    if (!confirm(`Checkout ${customerName}?`)) return;
    
    try {
      await endSeatingSession(sessionId);
      fetchSeatedParties();
    } catch (error: any) {
      console.error('Failed to checkout:', error);
      alert(error.response?.data?.message || 'Failed to checkout customer');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Seated Parties ({seatedParties.length})</h2>

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
        ) : seatedParties.length === 0 ? (
          <div className="p-12 text-center text-gray-500 italic text-sm">
            No parties are currently seated.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {seatedParties.map((party) => (
              <div key={party.id} className="grid grid-cols-6 p-4 text-sm text-gray-700 items-center hover:bg-gray-50">
                <div className="font-semibold">{party.tableNumber}</div>
                <div>{party.customerName}</div>
                <div>{party.partySize}</div>
                <div className="text-gray-500">{party.phone || '-'}</div>
                <div className="text-gray-500">{formatTime(party.seatedAt)}</div>
                <div>
                  <button
                    onClick={() => handleCheckout(party.id, party.customerName)}
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
