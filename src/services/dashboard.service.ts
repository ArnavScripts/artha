import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';

export type ComplianceChecklistItem = Database['public']['Tables']['compliance_checklist']['Row'];
export type AuditItem = Database['public']['Tables']['audits']['Row'];
export type DataGapItem = Database['public']['Tables']['data_gaps']['Row'];

export const dashboardService = {
    async getComplianceChecklist() {
        const { data, error } = await supabase
            .from('compliance_checklist')
            .select('*')
            .order('due_date', { ascending: true });

        if (error) throw error;
        return data;
    },

    async getUpcomingAudits() {
        const { data, error } = await supabase
            .from('audits')
            .select('*')
            .order('date', { ascending: true })
            .limit(5);

        if (error) throw error;
        return data;
    },

    async getDataGaps() {
        const { data, error } = await supabase
            .from('data_gaps')
            .select('*')
            .eq('resolved', false)
            .order('severity', { ascending: true }); // Critical first (if sorted alphabetically, might need custom sort)

        if (error) throw error;
        return data;
    }
};
