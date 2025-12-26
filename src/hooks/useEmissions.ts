import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emissionsService, EmissionRecord, AnomalyLog, LiveFeedItem } from '@/services/emissions.service';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export function useEmissions() {
  const queryClient = useQueryClient();

  const recordsQuery = useQuery({
    queryKey: ['emissions-records'],
    queryFn: emissionsService.getEmissionsRecords,
  });

  const anomalyLogsQuery = useQuery({
    queryKey: ['anomaly-logs'],
    queryFn: emissionsService.getAnomalyLogs,
  });

  const liveFeedQuery = useQuery({
    queryKey: ['live-feed'],
    queryFn: emissionsService.getLiveFeed,
    refetchInterval: 30000, // Poll every 30 seconds for live feed
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      return emissionsService.processBill(file, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emissions-records'] });
      toast.success('Bill processed and emission record created successfully');
    },
    onError: (error) => {
      toast.error(`Processing failed: ${error.message}`);
    },
  });

  return {
    records: recordsQuery.data || ([] as EmissionRecord[]),
    anomalyLogs: anomalyLogsQuery.data || ([] as AnomalyLog[]),
    liveFeed: liveFeedQuery.data || ([] as LiveFeedItem[]),
    isLoading: recordsQuery.isLoading || anomalyLogsQuery.isLoading,
    uploadRecord: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
  };
}
