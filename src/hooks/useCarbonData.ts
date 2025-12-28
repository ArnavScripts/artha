import { useQuery } from '@tanstack/react-query';
import { emissionsService, EmissionRecord } from '@/services/emissions.service';
import { useProfile } from './useProfile';
import { subMonths } from 'date-fns';

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
        const now = new Date();
        const currentMonth = now.toISOString().split('T')[0].substring(0, 7);
        const prevMonth1 = subMonths(now, 1).toLocaleString('default', { month: 'short' });
        const prevMonth2 = subMonths(now, 2).toLocaleString('default', { month: 'short' });
        const nextMonth1 = now.toLocaleString('default', { month: 'short' }); // Current month as first forecast
        const nextMonth2 = subMonths(now, -1).toLocaleString('default', { month: 'short' });
        const nextMonth3 = subMonths(now, -2).toLocaleString('default', { month: 'short' });

        const demoLiability = {
            scope1: 16502.2,
            scope2: 4801.2,
            scope3: 4251.2,
            total: 25554.6
        };
        const demoCap = 125000; // Enterprise Cap
        const demoPurchased = 150000;
        const demoBalance = (demoCap + demoPurchased) - demoLiability.total;

        return {
            records: [
                { id: '1', type: 'Scope 1', source: 'Manufacturing (Furnaces)', carbon_emission: 13400, date: `${currentMonth}-15` },
                { id: '2', type: 'Scope 1', source: 'Logistics & Steam', carbon_emission: 3102, date: `${currentMonth}-12` },
                { id: '3', type: 'Scope 2', source: 'Grid & Utilities', carbon_emission: 4801, date: `${currentMonth}-14` },
                { id: '4', type: 'Scope 3', source: 'Supply Chain & Travel', carbon_emission: 4251, date: `${currentMonth}-20` },
            ] as EmissionRecord[],
            liability: demoLiability,
            balance: demoBalance,
            cap: demoCap,
            purchased: demoPurchased,
            forecast: [
                { month: prevMonth2, actual: 21000, projected: 22000 },
                { month: prevMonth1, actual: 23000, projected: 22500 },
                { month: nextMonth1, actual: 24000, projected: 23000 },
                { month: nextMonth2, actual: null, projected: 24500 },
                { month: nextMonth3, actual: null, projected: 25000 },
                { month: 'Jul', actual: null, projected: 26000 },
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
