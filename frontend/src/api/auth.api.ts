import { apiClient } from './client';
import { User } from '../types';

export const getMe = async (): Promise<User> => {
  const { data } = await apiClient.get('/auth/me');
  return data;
};

export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};
