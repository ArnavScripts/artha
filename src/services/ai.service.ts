import { supabase } from '@/lib/supabase';

export interface TradeRecommendation {
    action: 'BUY' | 'SELL' | 'HOLD';
    quantity: number;
    price_per_unit: number;
    confidence: number;
    rationale: string;
}

export interface EmissionsAnalysis {
    response: string;
    insights: {
        type: 'anomaly' | 'trend' | 'success';
        source: string;
        recommendation: string;
    }[];
}

export const aiService = {
    async getTradeRecommendation(portfolioId: string, marketContext: string) {
        // In a real scenario, this might trigger an edge function to generate a new recommendation
        // For now, we fetch the latest active recommendation from the DB
        const { data, error } = await supabase
            .from('trade_recommendations')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            // Fallback if no recommendation exists (optional, or let it throw)
            console.warn("No active trade recommendation found", error);
            return null;
        }
        return data as TradeRecommendation;
    },

    async analyzeEmissions(query: string) {
        const { data, error } = await supabase.functions.invoke('ai-emissions-analysis', {
            body: { query },
        });

        if (error) throw error;
        return data as EmissionsAnalysis;
    }
};
