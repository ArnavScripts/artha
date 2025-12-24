import { useMutation } from '@tanstack/react-query';
import { aiService } from '@/services/ai.service';
import { toast } from 'sonner';

export function useAI() {
    const tradeMutation = useMutation({
        mutationFn: ({ portfolioId, context }: { portfolioId: string; context: string }) =>
            aiService.getTradeRecommendation(portfolioId, context),
        onError: (error) => {
            toast.error(`AI Analysis Failed: ${error.message}`);
        },
    });

    const analysisMutation = useMutation({
        mutationFn: (query: string) => aiService.analyzeEmissions(query),
        onError: (error) => {
            toast.error(`AI Analysis Failed: ${error.message}`);
        },
    });

    return {
        getTradeRecommendation: tradeMutation.mutate,
        analyzeEmissions: analysisMutation.mutate,
        tradeRecommendation: tradeMutation.data,
        emissionsAnalysis: analysisMutation.data,
        isAnalyzingTrade: tradeMutation.isPending,
        isAnalyzingEmissions: analysisMutation.isPending,
    };
}
