import { useQuery } from '@tanstack/react-query';
import { dashboardService, ComplianceChecklistItem, AuditItem, DataGapItem } from '@/services/dashboard.service';

export function useDashboard() {
    const checklistQuery = useQuery({
        queryKey: ['compliance-checklist'],
        queryFn: dashboardService.getComplianceChecklist,
    });

    const auditsQuery = useQuery({
        queryKey: ['upcoming-audits'],
        queryFn: dashboardService.getUpcomingAudits,
    });

    const dataGapsQuery = useQuery({
        queryKey: ['data-gaps'],
        queryFn: dashboardService.getDataGaps,
    });

    return {
        checklist: checklistQuery.data || ([] as ComplianceChecklistItem[]),
        audits: auditsQuery.data || ([] as AuditItem[]),
        dataGaps: dataGapsQuery.data || ([] as DataGapItem[]),
        isLoading: checklistQuery.isLoading || auditsQuery.isLoading || dataGapsQuery.isLoading,
        isError: checklistQuery.isError || auditsQuery.isError || dataGapsQuery.isError,
        error: checklistQuery.error || auditsQuery.error || dataGapsQuery.error,
    };
}
