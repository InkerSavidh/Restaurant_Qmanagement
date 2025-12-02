// frontend/api/tables.api.ts
import axiosInstance from './axiosInstance';

export interface Table {
  id: string;
  tableNumber: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING' | 'UNAVAILABLE';
  floorId: string;
}

export interface Floor {
  id: string;
  name: string;
}

export const getFloors = async (): Promise<Floor[]> => {
  const response = await axiosInstance.get('/floors');
  return response.data.data;
};

export const getTablesByFloor = async (floorId: string): Promise<Table[]> => {
  const response = await axiosInstance.get(`/tables/floor/${floorId}`);
  return response.data.data;
};

export const getAllTables = async (): Promise<Table[]> => {
  const response = await axiosInstance.get('/tables');
  return response.data.data;
};

export const updateTableStatus = async (tableId: string, status: string) => {
  const response = await axiosInstance.put(`/tables/${tableId}/status`, { status });
  return response.data;
};

export const createTable = async (data: { tableNumber: string; capacity: number; floorId: string }) => {
  const response = await axiosInstance.post('/tables', data);
  return response.data;
};

export const deleteTable = async (tableId: string) => {
  const response = await axiosInstance.delete(`/tables/${tableId}`);
  return response.data;
};
