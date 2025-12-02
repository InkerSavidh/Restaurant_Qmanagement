// frontend/api/waiters.api.ts
import axiosInstance from './axiosInstance';

export interface Waiter {
  id: string;
  username: string;
  name?: string;
}

export const getWaiters = async (): Promise<Waiter[]> => {
  const response = await axiosInstance.get('/waiters');
  return response.data.data;
};

export const createWaiter = async (data: { username: string; password: string }) => {
  const response = await axiosInstance.post('/waiters', data);
  return response.data;
};

export const updateWaiter = async (id: string, data: { username?: string; password?: string }) => {
  const response = await axiosInstance.put(`/waiters/${id}`, data);
  return response.data;
};

export const deleteWaiter = async (id: string) => {
  const response = await axiosInstance.delete(`/waiters/${id}`);
  return response.data;
};
