// frontend/api/seating.api.ts
import axiosInstance from './axiosInstance';

export interface SeatedParty {
  id: string;
  tableNumber: string;
  customerName: string;
  partySize: number;
  phone: string;
  seatedAt: string;
}

export const getActiveSeating = async (): Promise<SeatedParty[]> => {
  const response = await axiosInstance.get('/seating/active');
  return response.data.data;
};

export const endSeatingSession = async (sessionId: string) => {
  const response = await axiosInstance.post(`/seating/end/${sessionId}`);
  return response.data;
};
