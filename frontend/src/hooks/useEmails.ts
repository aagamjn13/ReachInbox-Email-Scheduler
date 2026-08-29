import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  scheduleEmails,
  getScheduledEmails,
  getSentEmails,
  getEmail,
  searchEmails,
} from '../api/email.api';
import { ScheduleEmailPayload } from '../types';

export const useScheduleEmails = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: ScheduleEmailPayload) => scheduleEmails(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails', 'scheduled'] });
    },
  });
};

export const useScheduledEmails = (page: number, limit: number = 20) => {
  return useQuery({
    queryKey: ['emails', 'scheduled', page, limit],
    queryFn: () => getScheduledEmails(page, limit),
  });
};

export const useSentEmails = (page: number, limit: number = 20) => {
  return useQuery({
    queryKey: ['emails', 'sent', page, limit],
    queryFn: () => getSentEmails(page, limit),
  });
};

export const useEmail = (id: string) => {
  return useQuery({
    queryKey: ['email', id],
    queryFn: () => getEmail(id),
    enabled: !!id,
  });
};

export const useSearchEmails = (query: string, page: number, limit: number = 20) => {
  return useQuery({
    queryKey: ['emails', 'search', query, page, limit],
    queryFn: () => searchEmails(query, page, limit),
    enabled: query.length > 2,
  });
};
