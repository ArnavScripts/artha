import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Organization = Database['public']['Tables']['organizations']['Row'];

export const profileService = {
    async getProfile() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user logged in');

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        if (error) throw error;
        return data;
    },

    async getOrganization(orgId: string) {
        const { data, error } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', orgId)
            .single();

        if (error) throw error;
        return data;
    },

    async updateProfile(updates: Partial<Profile>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user logged in');

        const { data, error } = await supabase
            .from('profiles')
            // @ts-ignore
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateOrganization(orgId: string, updates: Partial<Organization>) {
        const { data, error } = await supabase
            .from('organizations')
            // @ts-ignore
            .update(updates)
            .eq('id', orgId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async createTransaction(transaction: Database['public']['Tables']['transactions']['Insert']) {
        const { data, error } = await supabase
            .from('transactions')
            .insert(transaction as any)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getLatestTransaction(orgId: string) {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('organization_id', orgId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        return data;
    },

    async getTransactions(orgId: string) {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('organization_id', orgId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getAudits(orgId: string) {
        const { data, error } = await supabase
            .from('audits')
            .select('*')
            .eq('organization_id', orgId)
            .order('date', { ascending: false });

        if (error) throw error;
        return data;
    }
};
