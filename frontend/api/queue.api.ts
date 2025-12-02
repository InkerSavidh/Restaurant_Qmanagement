// frontend/api/queue.api.ts
import axiosInstance from './axiosInstance';

export interface QueueEntry {
  id: string;
  customerName: string;
  partySize: number;
  phone: string;
  waitTime: number;
  position: number;
  entryTime: string;
  status: string;
}

export const getQueue = async (): Promise<QueueEntry[]> => {
  const response = await axiosInstance.get('/queue');
  return response.data.data;
};

export const addToQueue = async (data: { name: string; partySize: number; phone?: string }) => {
  const response = await axiosInstance.post('/queue', data);
  return response.data;
};

export const removeFromQueue = async (queueId: string) => {
  const response = await axiosInstance.delete(`/queue/${queueId}`);
  return response.data;
};

export const seatCustomer = async (queueEntryId: string, tableId: string) => {
  const response = await axiosInstance.post('/seating/seat', { queueEntryId, tableId });
  return response.data;
};

export const runAllocator = async () => {
  const response = await axiosInstance.post('/allocator/run');
  return response.data;
};

export const toggleAutoAllocator = async (enabled: boolean) => {
  const response = await axiosInstance.put('/allocator/toggle', { enabled });
  return response.data;
};
