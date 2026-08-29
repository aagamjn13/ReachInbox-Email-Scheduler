import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSlackStatus, disconnectSlack } from '../api/slack.api';

export const useSlack = () => {
  const queryClient = useQueryClient();

  const { data: status, isLoading } = useQuery({
    queryKey: ['slack', 'status'],
    queryFn: getSlackStatus,
  });

  const disconnectMutation = useMutation({
    mutationFn: disconnectSlack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slack', 'status'] });
    },
  });

  return {
    status,
    isLoading,
    disconnect: disconnectMutation.mutateAsync,
    isDisconnecting: disconnectMutation.isPending,
  };
};
