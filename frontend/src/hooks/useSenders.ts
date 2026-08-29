import { useQuery } from '@tanstack/react-query';
import { getSenders } from '../api/sender.api';

export const useSenders = () => {
  return useQuery({
    queryKey: ['senders'],
    queryFn: getSenders,
  });
};
