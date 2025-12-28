import { useQuery } from '@tanstack/react-query';
import { emissionsService, EmissionRecord } from '@/services/emissions.service';
import { useProfile } from './useProfile';

export function useCarbonData() {
    const { user, organization, isLoading: isProfileLoading } = useProfile();
    const isDemoUser = user?.email === 'demo@artha.com';

    if (isProfileLoading) {
        return {
            records: [],
            liability: { scope1: 0, scope2: 0, scope3: 0, total: 0 },
            balance: 0,
            cap: 0,
            purchased: 0,
            forecast: [],
            isLoading: true
        };
    }

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
    const scope1 = records.filter(r => r.type === 'Scope 1').reduce((acc, r) => acc + (r.carbon_emission || 0), 0);
    const scope2 = records.filter(r => r.type === 'Scope 2').reduce((acc, r) => acc + (r.carbon_emission || 0), 0);
    const scope3 = records.filter(r => r.type === 'Scope 3').reduce((acc, r) => acc + (r.carbon_emission || 0), 0);
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

    console.log('useCarbonData check:', { email: user?.email, isDemoUser });

    if (isDemoUser) {
        const demoLiability = {
            scope1: 1250000,
            scope2: 850000,
            scope3: 450000,
            total: 2550000
        };
        const demoCap = 5000000;
        const demoPurchased = 150000;
        const demoBalance = (demoCap + demoPurchased) - demoLiability.total;

        return {
            records: [
                { id: '1', type: 'Scope 1', source: 'Manufacturing', carbon_emission: 1250000, date: '2023-12-01' },
                { id: '2', type: 'Scope 2', source: 'Electricity', carbon_emission: 850000, date: '2023-12-01' },
                { id: '3', type: 'Scope 3', source: 'Logistics', carbon_emission: 450000, date: '2023-12-01' },
            ] as EmissionRecord[],
            liability: demoLiability,
            balance: demoBalance,
            cap: demoCap,
            purchased: demoPurchased,
            forecast: [
                { month: 'Jan', actual: 2100000, projected: 2200000 },
                { month: 'Feb', actual: 2300000, projected: 2250000 },
                { month: 'Mar', actual: 2400000, projected: 2300000 },
                { month: 'Apr', actual: null, projected: 2450000 },
                { month: 'May', actual: null, projected: 2500000 },
                { month: 'Jun', actual: null, projected: 2600000 },
            ],
            isLoading: false,
        };
    }

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
