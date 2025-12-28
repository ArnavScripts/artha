import { useQuery } from '@tanstack/react-query';
import { greenService, OrganizationImpact, OffsetHistory, ProjectVerification, RegistryReconciliation } from '@/services/green.service';
import { useProfile } from './useProfile';

export function useGreenDashboard() {
    const { profile, organization } = useProfile();
    const orgId = organization?.id;

    // DUMMY DATA FOR PITCH DECK
    const isDemoUser = profile?.email === 'demo@artha.com';

    const impactQuery = useQuery({
        queryKey: ['organization-impact', orgId],
        queryFn: () => greenService.getOrganizationImpact(orgId!),
        enabled: !!orgId,
    });

    const offsetHistoryQuery = useQuery({
        queryKey: ['offset-history', orgId],
        queryFn: () => greenService.getOffsetHistory(orgId!),
        enabled: !!orgId,
    });

    const verificationsQuery = useQuery({
        queryKey: ['project-verifications', orgId],
        queryFn: () => greenService.getProjectVerifications(orgId!),
        enabled: !!orgId,
    });

    const registryQuery = useQuery({
        queryKey: ['registry-reconciliation', orgId],
        queryFn: () => greenService.getRegistryReconciliation(orgId!),
        enabled: !!orgId,
    });

    if (isDemoUser) {
        return {
            impact: {
                trees_planted: 12500,
                co2_offset: 850,
                water_saved: 450000,
                clean_energy: 120,
                csr_rating: 'A+',
                media_value: '₹12.5L',
                certifications: ['Gold Standard', 'Verra Verified']
            } as OrganizationImpact,
            offsetHistory: [
                { month: 'Jan', offset_value: 45 },
                { month: 'Feb', offset_value: 52 },
                { month: 'Mar', offset_value: 48 },
                { month: 'Apr', offset_value: 65 },
                { month: 'May', offset_value: 78 },
                { month: 'Jun', offset_value: 90 },
            ] as OffsetHistory[],
            verifications: [
                {
                    project_name: 'Sundarbans Mangrove Restoration',
                    status: 'verified',
                    vintage: '2023',
                    auditor: 'DNV GL',
                    credits: 5000,
                    last_audit: '2024-01-15'
                },
                {
                    project_name: 'Rajasthan Solar Park',
                    status: 'pending',
                    vintage: '2024',
                    auditor: 'TUV Nord',
                    credits: 12000,
                    last_audit: 'Pending'
                }
            ] as ProjectVerification[],
            registry: [
                {
                    registry_name: 'Verra',
                    status: 'synced',
                    last_sync: '2024-03-15T10:00:00Z',
                    credits: 15000
                },
                {
                    registry_name: 'Gold Standard',
                    status: 'synced',
                    last_sync: '2024-03-14T15:30:00Z',
                    credits: 8500
                }
            ] as RegistryReconciliation[],
            isLoading: false
        };
    }

    return {
        impact: impactQuery.data as OrganizationImpact | undefined,
        offsetHistory: (offsetHistoryQuery.data || []) as OffsetHistory[],
        verifications: (verificationsQuery.data || []) as ProjectVerification[],
        registry: (registryQuery.data || []) as RegistryReconciliation[],
        isLoading: impactQuery.isLoading || offsetHistoryQuery.isLoading || verificationsQuery.isLoading || registryQuery.isLoading,
    };
}
