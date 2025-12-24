import { useQuery } from '@tanstack/react-query';
import { greenService, OrganizationImpact, OffsetHistory, ProjectVerification, RegistryReconciliation } from '@/services/green.service';
import { useProfile } from './useProfile';

export function useGreenDashboard() {
    const { organization } = useProfile();
    const orgId = organization?.id;

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

    return {
        impact: impactQuery.data as OrganizationImpact | undefined,
        offsetHistory: (offsetHistoryQuery.data || []) as OffsetHistory[],
        verifications: (verificationsQuery.data || []) as ProjectVerification[],
        registry: (registryQuery.data || []) as RegistryReconciliation[],
        isLoading: impactQuery.isLoading || offsetHistoryQuery.isLoading || verificationsQuery.isLoading || registryQuery.isLoading,
    };
}
