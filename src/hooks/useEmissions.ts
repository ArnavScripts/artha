import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emissionsService, EmissionRecord, AnomalyLog, LiveFeedItem } from '@/services/emissions.service';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useProfile } from './useProfile';
import { subMonths } from 'date-fns';

export function useEmissions() {
  const queryClient = useQueryClient();

  const { user } = useProfile();
  const isDemoUser = user?.email === 'demo@artha.com';

  const recordsQuery = useQuery({
    queryKey: ['emissions-records'],
    queryFn: emissionsService.getEmissionsRecords,
    enabled: !isDemoUser,
  });

  const anomalyLogsQuery = useQuery({
    queryKey: ['anomaly-logs'],
    queryFn: emissionsService.getAnomalyLogs,
    enabled: !isDemoUser,
  });

  const liveFeedQuery = useQuery({
    queryKey: ['live-feed'],
    queryFn: emissionsService.getLiveFeed,
    refetchInterval: isDemoUser ? false : 30000,
    enabled: !isDemoUser,
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

  if (isDemoUser) {
    return {
      records: [
        { id: 'EM-001', source: 'Furnace A', type: 'Scope 1', carbon_emission: 450.5, value: 450.5, unit: 'tCO2e', status: 'verified', date: '2024-01-15', cost: 27030 },
        { id: 'EM-002', source: 'Grid Electricity', type: 'Scope 2', carbon_emission: 280.2, value: 280.2, unit: 'tCO2e', status: 'verified', date: '2024-01-14', cost: 16812 },
        { id: 'EM-003', source: 'Logistics Fleet', type: 'Scope 1', carbon_emission: 125.8, value: 125.8, unit: 'tCO2e', status: 'verified', date: '2024-01-12', cost: 7548 },
        { id: 'EM-004', source: 'Furnace B', type: 'Scope 1', carbon_emission: 890.4, value: 890.4, unit: 'tCO2e', status: 'pending', date: '2024-01-10', cost: 53424 },
      ] as EmissionRecord[],
      anomalyLogs: [
        { id: '1', source: 'Furnace B', anomaly: 'Irregular thermal spike detected', status: 'unresolved', timestamp: new Date().toISOString() },
        { id: '2', source: 'Grid Meter', anomaly: 'Data gap in Scope 2 reporting', status: 'investigating', timestamp: subMonths(new Date(), 0).toISOString() }
      ] as AnomalyLog[],
      liveFeed: [
        { id: '1', message: 'New emission record extracted from Electricity Bill #882', type: 'success', created_at: new Date().toISOString() },
        { id: '2', message: 'Anomaly detected in Furnace B thermal readings', type: 'warning', created_at: subMonths(new Date(), 0).toISOString() },
        { id: '3', message: 'Monthly compliance report generated for Q4', type: 'info', created_at: subMonths(new Date(), 0).toISOString() }
      ] as LiveFeedItem[],
      isLoading: false,
      uploadRecord: uploadMutation.mutate,
      isUploading: uploadMutation.isPending,
    };
  }

  return {
    records: recordsQuery.data || ([] as EmissionRecord[]),
    anomalyLogs: anomalyLogsQuery.data || ([] as AnomalyLog[]),
    liveFeed: liveFeedQuery.data || ([] as LiveFeedItem[]),
    isLoading: recordsQuery.isLoading || anomalyLogsQuery.isLoading,
    uploadRecord: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
  };
}
