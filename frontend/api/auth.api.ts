// frontend/api/auth.api.ts
import axiosInstance from './axiosInstance';

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'WAITER';
  };
}

export const loginApi = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await axiosInstance.post('/auth/login', { email, password });
  return response.data.data;
};

export const logoutApi = async () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

export const getCurrentUser = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data.data;
};
