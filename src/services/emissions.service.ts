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
    },

    async processBill(file: File, userId: string) {
        // 1. Upload to Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('bills')
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        // 2. Get Signed URL (valid for 60 seconds)
        const { data: { signedUrl }, error: urlError } = await supabase.storage
            .from('bills')
            .createSignedUrl(fileName, 60);

        if (urlError) throw urlError;

        // 3. Call Edge Function
        const { data, error: funcError } = await supabase.functions.invoke('process-bill', {
            body: { fileUrl: signedUrl, userId }
        });

        if (funcError) {
            console.error("Edge Function Error:", funcError);
            // Try to extract the error message from the response body if available
            let errorMessage = funcError.message;
            try {
                if (funcError instanceof Error && 'context' in funcError) {
                    // @ts-ignore
                    const body = await funcError.context.json();
                    if (body.error) errorMessage = body.error;
                }
            } catch (e) {
                // Ignore parsing error
            }
            throw new Error(errorMessage);
        }

        return data;
    }
};
