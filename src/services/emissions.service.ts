import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';

export type EmissionRecord = Database['public']['Tables']['emissions_records']['Row'];
export type AnomalyLog = Database['public']['Tables']['anomaly_logs']['Row'];
export type LiveFeedItem = Database['public']['Tables']['live_feed']['Row'];

export const emissionsService = {
    async getEmissionsRecords() {
        const { data, error } = await supabase
            .from('emissions_records')
            .select('*')
            .order('date', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getAnomalyLogs() {
        const { data, error } = await supabase
            .from('anomaly_logs')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(10);

        if (error) throw error;
        return data;
    },

    async getLiveFeed() {
        const { data, error } = await supabase
            .from('live_feed')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;
        return data;
    },

    async uploadEmissionRecord(record: Database['public']['Tables']['emissions_records']['Insert']) {
        const { data, error } = await supabase
            .from('emissions_records')
            .insert(record as any)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getForecasts() {
        const { data, error } = await supabase
            .from('forecasts')
            .select('*')
            .order('month', { ascending: true }); // Assuming month is stored in a way that sorts correctly, or use created_at

        if (error) throw error;
        return data;
    }
};
