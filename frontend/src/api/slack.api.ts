import { apiClient } from './client';
import { SlackStatus } from '../types';

export const getSlackStatus = async (): Promise<SlackStatus> => {
  const { data } = await apiClient.get('/slack/status');
  return data;
};

export const disconnectSlack = async (): Promise<void> => {
  await apiClient.post('/slack/disconnect');
};
