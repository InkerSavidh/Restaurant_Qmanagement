// frontend/api/analytics.api.ts
import axiosInstance from './axiosInstance';

export interface DashboardStats {
  customersInQueue: number;
  occupiedTables: number;
  freeTables: number;
  avgWaitTime: number;
  longestWait: number;
  partiesSeatedToday: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await axiosInstance.get('/analytics/dashboard');
  return response.data.data;
};

export const getSeatedPartiesPerHour = async () => {
  const response = await axiosInstance.get('/analytics/seated-per-hour');
  return response.data.data;
};

export const getNextInQueue = async () => {
  const response = await axiosInstance.get('/queue/next');
  return response.data.data;
};
