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
                trees_planted: 125000,
                co2_offset: 45000,
                water_saved: 2500000,
                clean_energy: 12500,
                csr_rating: 'Platinum+',
                media_value: '₹1.2 Cr',
                certifications: ['Gold Standard', 'Verra Verified', 'UN SDG Partner', 'ISO 14064']
            } as OrganizationImpact,
            offsetHistory: [
                { month: 'Feb', offset_value: 45 },
                { month: 'Mar', offset_value: 58 },
                { month: 'Apr', offset_value: 72 },
                { month: 'May', offset_value: 85 },
                { month: 'Jun', offset_value: 65 },
                { month: 'Jul', offset_value: 90 },
                { month: 'Aug', offset_value: 110 },
                { month: 'Sep', offset_value: 125 },
                { month: 'Oct', offset_value: 140 },
                { month: 'Nov', offset_value: 165 },
                { month: 'Dec', offset_value: 190 },
                { month: 'Jan', offset_value: 215 },
            ] as OffsetHistory[],
            verifications: [
                {
                    project_name: 'Sundarbans Mangrove Restoration',
                    status: 'verified',
                    vintage: '2025',
                    auditor: 'DNV GL',
                    credits: 15000,
                    last_audit: '2025-12-15'
                },
                {
                    project_name: 'Thar Desert Solar Park',
                    status: 'verified',
                    vintage: '2025',
                    auditor: 'TUV Nord',
                    credits: 25000,
                    last_audit: '2026-01-02'
                },
                {
                    project_name: 'Himalayan Hydro Project',
                    status: 'in_review',
                    vintage: '2026',
                    auditor: 'Bureau Veritas',
                    credits: 8500,
                    last_audit: 'Under Review'
                },
                {
                    project_name: 'Kerala Wind Farm Expansion',
                    status: 'pending',
                    vintage: '2026',
                    auditor: 'SGS',
                    credits: 12000,
                    last_audit: 'Scheduled: Feb 20, 2026'
                },
                {
                    project_name: 'Urban Afforestation (Mumbai)',
                    status: 'pending',
                    vintage: '2026',
                    auditor: 'EarthCheck',
                    credits: 3500,
                    last_audit: 'Documentation Pending'
                }
            ] as ProjectVerification[],
            registry: [
                {
                    registry_name: 'Verra',
                    status: 'synced',
                    last_sync: '2026-01-04T08:30:00Z',
                    credits: 32000
                },
                {
                    registry_name: 'Gold Standard',
                    status: 'synced',
                    last_sync: '2026-01-04T09:15:00Z',
                    credits: 18500
                },
                {
                    registry_name: 'Global Carbon Council',
                    status: 'synced',
                    last_sync: '2026-01-03T16:00:00Z',
                    credits: 9500
                },
                {
                    registry_name: 'Indian Carbon Registry',
                    status: 'pending',
                    last_sync: null,
                    credits: 2060
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
