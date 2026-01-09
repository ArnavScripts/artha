import { supabase } from '@/lib/supabase';

// Types matching the DB schema
export interface GreenProject {
    id: number;
    name: string;
    location: string;
    type: string;
    description: string;
    image_url: string;
    registry_id: string;
    sdg_goals: string[];
    impact_vcp: string;
    rating: number;
    roi_percentage: number;
    // Joins
    inventory?: GreenInventory[];
}

export interface GreenInventory {
    id: number;
    project_id: number;
    vintage_year: number;
    price_per_credit: number;
    available_quantity: number;
    total_issued: number;
}

export const greenService = {
    /**
     * Fetch all projects with their current inventory
     */
    async getProjects() {
        const { data, error } = await supabase
            .from('green_projects')
            .select(`
        *,
        inventory:green_inventory(*)
      `)
            .order('rating', { ascending: false });

        if (error) throw error;
        return data as GreenProject[];
    },

    /**
     * Execute atomic purchase transaction
     */
    async purchaseCredits(inventoryId: number, quantity: number) {
        // @ts-ignore - RPC types not yet generated
        const { data, error } = await supabase
            .rpc('purchase_green_credits', {
                p_inventory_id: inventoryId,
                p_quantity: quantity
            });

        if (error) throw error;
        return data; // Returns JSON object { success: boolean, message: string, transaction_id: uuid, remaining_balance: number }
    },

    /**
     * Fetch current organization cash balance
     */
    async getWalletBalance() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return 0;

        // 1. Get Org ID
        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single();

        if (!profile || !profile.organization_id) return 0;

        // 2. Get Balance
        const { data: org, error } = await supabase
            .from('organizations')
            .select('cash_balance')
            .eq('id', profile.organization_id)
            .single();

        if (error) {
            console.error('Error fetching balance:', error);
            return 0;
        }

        // @ts-ignore - cash_balance added via migration
        return org?.cash_balance || 0;
    }
};
