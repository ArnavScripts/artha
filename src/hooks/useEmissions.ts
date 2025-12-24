import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emissionsService, EmissionRecord, AnomalyLog, LiveFeedItem } from '@/services/emissions.service';
import { toast } from 'sonner';

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
    mutationFn: emissionsService.uploadEmissionRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emissions-records'] });
      toast.success('Emission record uploaded successfully');
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
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
