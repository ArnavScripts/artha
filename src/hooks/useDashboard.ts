import { useQuery } from '@tanstack/react-query';
import { dashboardService, ComplianceChecklistItem, AuditItem, DataGapItem } from '@/services/dashboard.service';
import { useProfile } from './useProfile';

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

    const { profile } = useProfile();
    const isDemoUser = profile?.email === 'demo@artha.com';

    if (isDemoUser) {
        return {
            checklist: [
                { id: '1', task: 'Verify Q4 Emissions Data', due_date: '2024-01-15', status: 'pending', priority: 'high' },
                { id: '2', task: 'Submit CBAM Report', due_date: '2024-01-31', status: 'in_progress', priority: 'critical' },
                { id: '3', task: 'Update Supplier Certificates', due_date: '2024-02-10', status: 'scheduled', priority: 'medium' },
            ] as ComplianceChecklistItem[],
            audits: [
                { id: '1', organization_id: 'demo', name: 'Annual ISO 14064 Audit', auditor: 'DNV GL', date: '2024-03-01', type: 'Mandatory', status: 'scheduled' },
                { id: '2', organization_id: 'demo', name: 'Pre-assurance Review', auditor: 'Internal', date: '2024-02-15', type: 'Voluntary', status: 'scheduled' },
            ] as AuditItem[],
            dataGaps: [
                { id: '1', organization_id: 'demo', source: 'Plant B - IoT Sensors', last_update: '2023-12-28', severity: 'warning', resolved: false },
                { id: '2', organization_id: 'demo', source: 'Logistics Fleet', last_update: '2023-12-25', severity: 'info', resolved: false },
            ] as DataGapItem[],
            isLoading: false,
            isError: false,
            error: null,
        };
    }

    return {
        checklist: checklistQuery.data || ([] as ComplianceChecklistItem[]),
        audits: auditsQuery.data || ([] as AuditItem[]),
        dataGaps: dataGapsQuery.data || ([] as DataGapItem[]),
        isLoading: checklistQuery.isLoading || auditsQuery.isLoading || dataGapsQuery.isLoading,
        isError: checklistQuery.isError || auditsQuery.isError || dataGapsQuery.isError,
        error: checklistQuery.error || auditsQuery.error || dataGapsQuery.error,
    };
}
