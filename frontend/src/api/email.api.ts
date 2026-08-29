import { apiClient } from './client';
import { Email, PaginatedResponse, ScheduleEmailPayload, CampaignResponse } from '../types';

export const scheduleEmails = async (payload: ScheduleEmailPayload): Promise<CampaignResponse> => {
  const { data } = await apiClient.post('/emails/schedule', payload);
  return data;
};

export const getScheduledEmails = async (page = 1, limit = 20): Promise<PaginatedResponse<Email>> => {
  const { data } = await apiClient.get('/emails/scheduled', { params: { page, limit } });
  return data;
};

export const getSentEmails = async (page = 1, limit = 20): Promise<PaginatedResponse<Email>> => {
  const { data } = await apiClient.get('/emails/sent', { params: { page, limit } });
  return data;
};

export const getEmail = async (id: string): Promise<Email> => {
  const { data } = await apiClient.get(`/emails/${id}`);
  return data;
};

export const searchEmails = async (query: string, page = 1, limit = 20): Promise<PaginatedResponse<Email>> => {
  const { data } = await apiClient.get('/emails/search', { params: { q: query, page, limit } });
  return data;
};
