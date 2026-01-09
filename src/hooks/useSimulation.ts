import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useProfile } from './useProfile';

export interface Scenario {
    id: string;
    name: string;
    baseline_cost: number;
}

export interface Intervention {
    id: string;
    title: string;
    impact_description: string;
    capex_cost: number;
    npv_value: number;
    reduction_percentage: number;
    is_applied: boolean;
}

export interface Projection {
    month: string;
    bau_value: number;
    optimized_value: number;
}

export function useSimulation() {
    const [scenario, setScenario] = useState<Scenario | null>(null);
    const [interventions, setInterventions] = useState<Intervention[]>([]);
    const [projections, setProjections] = useState<Projection[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);

    const { user } = useProfile();
    const isDemoUser = user?.email === 'demo@artha.com';

    // Initialize or Fetch Active Scenario
    useEffect(() => {
        if (isDemoUser) {
            setScenario({
                id: 'demo-scenario',
                name: 'Strategic Decarbonization Plan 2024',
                baseline_cost: 8500000
            });
            setInterventions([
                {
                    id: '1',
                    title: 'Solar Microgrid Integration',
                    impact_description: 'Replace 40% of grid dependency with on-site solar.',
                    capex_cost: 12000000,
                    npv_value: 45000000,
                    reduction_percentage: 25,
                    is_applied: true
                },
                {
                    id: '2',
                    title: 'EV Fleet Transition',
                    impact_description: 'Convert logistics fleet to electric vehicles.',
                    capex_cost: 8500000,
                    npv_value: 15000000,
                    reduction_percentage: 12,
                    is_applied: false
                },
                {
                    id: '3',
                    title: 'AI-Driven HVAC Optimization',
                    impact_description: 'Real-time thermal management using SAGE AI.',
                    capex_cost: 1500000,
                    npv_value: 8000000,
                    reduction_percentage: 8,
                    is_applied: false
                }
            ]);
            setProjections([
                { month: '2024-01-01', bau_value: 850000, optimized_value: 800000 },
                { month: '2024-02-01', bau_value: 870000, optimized_value: 780000 },
                { month: '2024-03-01', bau_value: 890000, optimized_value: 750000 },
                { month: '2024-04-01', bau_value: 920000, optimized_value: 720000 },
                { month: '2024-05-01', bau_value: 950000, optimized_value: 680000 },
                { month: '2024-06-01', bau_value: 980000, optimized_value: 650000 },
            ]);
            return;
        }
        fetchScenario();
    }, [isDemoUser]);

    async function fetchScenario() {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get active scenario or create default
            let { data: scenarios } = await supabase
                .from('scenarios')
                .select('*')
                .eq('user_id', user.id)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(1);

            let activeScenario = scenarios && scenarios.length > 0 ? scenarios[0] : null;

            if (!activeScenario) {
                // Create default scenario
                const { data: newScenario, error } = await supabase
                    .from('scenarios')
                    .insert({
                        user_id: user.id,
                        name: 'Q3 Decarbonization Plan',
                        status: 'active',
                        baseline_cost: 5000000 // 50L
                    })
                    .select()
                    .single();

                if (error) throw error;
                activeScenario = newScenario;

                // Create default interventions
                const defaultInterventions = [
                    {
                        scenario_id: newScenario.id,
                        title: 'Switch Furnace B to Solar',
                        impact_description: '15% Reduction in thermal load',
                        capex_cost: 5000000,
                        npv_value: 12000000,
                        reduction_percentage: 15
                    },
                    {
                        scenario_id: newScenario.id,
                        title: 'Optimize HVAC Schedules',
                        impact_description: '8% Reduction via AI scheduling',
                        capex_cost: 0,
                        npv_value: 4500000,
                        reduction_percentage: 8
                    }
                ];
                await supabase.from('interventions').insert(defaultInterventions);
            }

            setScenario(activeScenario);

            // Fetch Interventions
            const { data: interventionData } = await supabase
                .from('interventions')
                .select('*')
                .eq('scenario_id', activeScenario.id);

            setInterventions(interventionData || []);

            // Fetch Projections
            const { data: projectionData } = await supabase
                .from('projections')
                .select('*')
                .eq('scenario_id', activeScenario.id)
                .order('month', { ascending: true });

            setProjections(projectionData || []);

        } catch (error: any) {
            console.error("Fetch Scenario Error:", error);
            toast.error("Failed to load simulation data");
        } finally {
            setIsLoading(false);
        }
    }

    async function runSimulation(interventionId: string) {
        if (!scenario) return;
        setIsSimulating(true);

        // --- DEMO MODE MOCK ---
        if (isDemoUser) {
            setTimeout(() => {
                const intervention = interventions.find(i => i.id === interventionId);
                if (!intervention) return;

                // Apply reduction logic mock
                const newProjections = projections.map(p => ({
                    ...p,
                    optimized_value: p.optimized_value * (1 - (intervention.reduction_percentage / 100))
                }));

                setProjections(newProjections);
                setInterventions(prev => prev.map(i =>
                    i.id === interventionId ? { ...i, is_applied: true } : i
                ));

                toast.success("Simulation Complete", { description: "AI Model updated projections based on new parameters." });
                setIsSimulating(false);
            }, 2000); // 2s simulated delay
            return;
        }

        // --- REAL BACKEND ---
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data, error } = await supabase.functions.invoke('run-simulation', {
                body: {
                    userId: user.id,
                    scenarioId: scenario.id,
                    interventionId
                }
            });

            if (error) throw error;

            if (data?.projections) {
                setProjections(data.projections);
                // Update local intervention state
                setInterventions(prev => prev.map(i =>
                    i.id === interventionId ? { ...i, is_applied: true } : i
                ));
                toast.success("Simulation Complete", { description: "Projections updated." });
            }

        } catch (error: any) {
            console.error("Simulation Error:", error);
            toast.error("Simulation Failed", { description: error.message });
        } finally {
            if (!isDemoUser) setIsSimulating(false);
        }
    }

    return {
        scenario,
        interventions,
        projections,
        isLoading,
        isSimulating,
        runSimulation
    };
}
