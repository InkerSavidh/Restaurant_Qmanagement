// frontend/api/activity.api.ts
import axiosInstance from './axiosInstance';

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  badge: 'Cleared' | 'Blocked' | 'Made Available';
  details: string;
}

export interface ActivityFilters {
  userType?: string;
  userName?: string;
  table?: string;
  startDate?: string;
  endDate?: string;
}

export const getActivityLogs = async (filters: ActivityFilters = {}): Promise<ActivityLog[]> => {
  const params = new URLSearchParams();
  if (filters.userType) params.append('userType', filters.userType);
  if (filters.userName) params.append('userName', filters.userName);
  if (filters.table) params.append('table', filters.table);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);

  const response = await axiosInstance.get(`/activity?${params.toString()}`);
  return response.data.data;
};

export const getUsers = async () => {
  const response = await axiosInstance.get('/users');
  return response.data.data;
};
