import { useQuery } from '@tanstack/react-query';
import { emissionsService, EmissionRecord } from '@/services/emissions.service';
import { useProfile } from './useProfile';

export function useCarbonData() {
    const { organization } = useProfile();

    const recordsQuery = useQuery({
        queryKey: ['emissions-records'],
        queryFn: emissionsService.getEmissionsRecords,
    });

    const forecastsQuery = useQuery({
        queryKey: ['forecasts'],
        queryFn: emissionsService.getForecasts,
    });

    const records = (recordsQuery.data || []) as EmissionRecord[];
    const forecast = forecastsQuery.data || [];

    // Calculate Net Compliance Liability
    const scope1 = records.filter(r => r.type === 'Scope 1').reduce((acc, r) => acc + r.value, 0);
    const scope2 = records.filter(r => r.type === 'Scope 2').reduce((acc, r) => acc + r.value, 0);
    const scope3 = records.filter(r => r.type === 'Scope 3').reduce((acc, r) => acc + r.value, 0);
    const totalLiability = scope1 + scope2 + scope3;

    // Calculate Balance based on Tier Cap + Purchased Credits
    const getCap = (tier?: string) => {
        switch (tier) {
            case 'premium': return 500000;
            case 'enterprise': return 125000;
            default: return 50000;
        }
    };
    const cap = getCap(organization?.tier);
    const purchased = organization?.credits_purchased || 0;
    const balance = (cap + purchased) - totalLiability;

    return {
        records,
        liability: {
            scope1,
            scope2,
            scope3,
            total: totalLiability,
        },
        balance,
        cap,
        purchased,
        forecast,
        isLoading: recordsQuery.isLoading || forecastsQuery.isLoading,
    };
}
