import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';

export type OrganizationImpact = Database['public']['Tables']['organization_impact']['Row'];
export type OffsetHistory = Database['public']['Tables']['offset_history']['Row'];
export type ProjectVerification = Database['public']['Tables']['project_verifications']['Row'];
export type RegistryReconciliation = Database['public']['Tables']['registry_reconciliation']['Row'];

export const greenService = {
    async getOrganizationImpact(orgId: string) {
        const { data, error } = await supabase
            .from('organization_impact')
            .select('*')
            .eq('organization_id', orgId)
            .single();

        if (error) throw error;
        return data;
    },

    async getOffsetHistory(orgId: string) {
        const { data, error } = await supabase
            .from('offset_history')
            .select('*')
            .eq('organization_id', orgId)
            // .order('month', { ascending: true }) // Needs proper date sorting
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    },

    async getProjectVerifications(orgId: string) {
        const { data, error } = await supabase
            .from('project_verifications')
            .select('*')
            .eq('organization_id', orgId);

        if (error) throw error;
        return data;
    },

    async getRegistryReconciliation(orgId: string) {
        const { data, error } = await supabase
            .from('registry_reconciliation')
            .select('*')
            .eq('organization_id', orgId);

        if (error) throw error;
        return data;
    }
};
