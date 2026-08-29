import { apiClient } from './client';
import { SenderAccount } from '../types';

export const getSenders = async (): Promise<SenderAccount[]> => {
  const { data } = await apiClient.get('/senders');
  return data.accounts;
};
