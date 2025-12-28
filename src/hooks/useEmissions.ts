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
    const now = new Date();
    const currentMonth = now.toISOString().split('T')[0].substring(0, 7); // YYYY-MM
    const prevMonth1 = subMonths(now, 1).toISOString().split('T')[0].substring(0, 7);
    const prevMonth2 = subMonths(now, 2).toISOString().split('T')[0].substring(0, 7);

    return {
      records: [
        { id: 'EM-001', source: 'Furnace A', type: 'Scope 1', carbon_emission: 4500.5, value: 4500.5, unit: 'tCO2e', status: 'verified', date: `${currentMonth}-15`, cost: 270030 },
        { id: 'EM-002', source: 'Furnace B', type: 'Scope 1', carbon_emission: 8900.4, value: 8900.4, unit: 'tCO2e', status: 'pending', date: `${currentMonth}-10`, cost: 534024 },
        { id: 'EM-003', source: 'Grid Electricity', type: 'Scope 2', carbon_emission: 2800.2, value: 2800.2, unit: 'tCO2e', status: 'verified', date: `${prevMonth1}-14`, cost: 168012 },
        { id: 'EM-004', source: 'Logistics Fleet', type: 'Scope 1', carbon_emission: 1250.8, value: 1250.8, unit: 'tCO2e', status: 'verified', date: `${prevMonth1}-12`, cost: 75048 },
        { id: 'EM-005', source: 'Steam Boiler', type: 'Scope 1', carbon_emission: 1500.0, value: 1500.0, unit: 'tCO2e', status: 'verified', date: `${prevMonth2}-08`, cost: 90000 },
        { id: 'EM-006', source: 'Backup Generator', type: 'Scope 1', carbon_emission: 350.5, value: 350.5, unit: 'tCO2e', status: 'verified', date: `${prevMonth2}-05`, cost: 21030 },
        { id: 'EM-007', source: 'Employee Commute', type: 'Scope 3', carbon_emission: 120.4, value: 120.4, unit: 'tCO2e', status: 'verified', date: `${currentMonth}-20`, cost: 7224 },
        { id: 'EM-008', source: 'Business Travel', type: 'Scope 3', carbon_emission: 85.2, value: 85.2, unit: 'tCO2e', status: 'verified', date: `${prevMonth1}-18`, cost: 5112 },
        { id: 'EM-009', source: 'Waste Disposal', type: 'Scope 3', carbon_emission: 45.6, value: 45.6, unit: 'tCO2e', status: 'verified', date: `${prevMonth2}-16`, cost: 2736 },
        { id: 'EM-010', source: 'Water Treatment', type: 'Scope 2', carbon_emission: 210.3, value: 210.3, unit: 'tCO2e', status: 'verified', date: `${currentMonth}-11`, cost: 12618 },
        { id: 'EM-011', source: 'Compressed Air', type: 'Scope 2', carbon_emission: 540.7, value: 540.7, unit: 'tCO2e', status: 'verified', date: `${prevMonth1}-09`, cost: 32442 },
        { id: 'EM-012', source: 'HVAC System', type: 'Scope 2', carbon_emission: 1100.0, value: 1100.0, unit: 'tCO2e', status: 'verified', date: `${prevMonth2}-07`, cost: 66000 },
        { id: 'EM-013', source: 'Raw Material Transport', type: 'Scope 3', carbon_emission: 2200.0, value: 2200.0, unit: 'tCO2e', status: 'verified', date: `${currentMonth}-04`, cost: 132000 },
        { id: 'EM-014', source: 'Product Distribution', type: 'Scope 3', carbon_emission: 1800.0, value: 1800.0, unit: 'tCO2e', status: 'verified', date: `${prevMonth1}-02`, cost: 108000 },
        { id: 'EM-015', source: 'Office Operations', type: 'Scope 2', carbon_emission: 150.0, value: 150.0, unit: 'tCO2e', status: 'verified', date: `${prevMonth2}-01`, cost: 9000 },
      ] as EmissionRecord[],
      anomalyLogs: [
        { id: '1', source: 'Furnace B', anomaly: 'Irregular thermal spike detected (15% above baseline)', status: 'unresolved', timestamp: new Date().toISOString() },
        { id: '2', source: 'Grid Meter', anomaly: 'Data gap in Scope 2 reporting (Jan 10-12)', status: 'investigating', timestamp: subMonths(new Date(), 0).toISOString() },
        { id: '3', source: 'Logistics Fleet', anomaly: 'Fuel consumption anomaly in Truck #42', status: 'resolved', timestamp: subMonths(new Date(), 0).toISOString() }
      ] as AnomalyLog[],
      liveFeed: [
        { id: '1', message: 'New emission record extracted from Electricity Bill #882 (Grid India)', type: 'success', created_at: new Date().toISOString() },
        { id: '2', message: 'Anomaly detected in Furnace B thermal readings - AI investigating', type: 'warning', created_at: subMonths(new Date(), 0).toISOString() },
        { id: '3', message: 'Monthly compliance report generated for Q4 FY24', type: 'info', created_at: subMonths(new Date(), 0).toISOString() },
        { id: '4', message: 'Verified 1,200 CCCCs from Western Ghats Project', type: 'success', created_at: subMonths(new Date(), 0).toISOString() },
        { id: '5', message: 'Carbon liability forecast updated based on current production', type: 'info', created_at: subMonths(new Date(), 0).toISOString() }
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
