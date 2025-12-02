// frontend/api/history.api.ts
import axiosInstance from './axiosInstance';

export interface HistoryEntry {
  id: string;
  name: string;
  phone: string;
  partySize: number;
  tableSeated: string;
  arrivalTime: string;
  seatedTime: string;
  departedTime: string;
  totalWait: number;
  dineTime: number;
}

export interface HistoryFilters {
  startDate?: string;
  endDate?: string;
  customerName?: string;
  tableNumber?: string;
}

export const getCustomerHistory = async (filters: HistoryFilters = {}): Promise<HistoryEntry[]> => {
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.customerName) params.append('customerName', filters.customerName);
  if (filters.tableNumber) params.append('tableNumber', filters.tableNumber);

  const response = await axiosInstance.get(`/history?${params.toString()}`);
  return response.data.data;
};
