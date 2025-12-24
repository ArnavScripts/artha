import { motion } from 'framer-motion';
import { Sparkles, Check, ArrowRight, Loader2 } from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { useEffect } from 'react';

export function AITradeTicket() {
  const { getTradeRecommendation, tradeRecommendation, isAnalyzingTrade } = useAI();

  useEffect(() => {
    // Fetch initial recommendation
    getTradeRecommendation({ portfolioId: 'default', context: 'initial' });
  }, []);

  if (isAnalyzingTrade || !tradeRecommendation) {
    return (
      <div className="glass-panel p-6 rounded-2xl flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const subtotal = tradeRecommendation.quantity * tradeRecommendation.price_per_unit;
  const fee = subtotal * 0.005;
  const total = subtotal + fee;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-panel p-6 rounded-2xl"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">AI Trade Recommendation</span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Action</span>
          <span className="font-mono font-medium text-foreground">{tradeRecommendation.action}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Quantity</span>
          <span className="font-mono font-medium text-foreground">{tradeRecommendation.quantity.toLocaleString()} Credits</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Price/Unit</span>
          <span className="font-mono font-medium text-foreground">₹{tradeRecommendation.price_per_unit.toFixed(2)}</span>
        </div>
        <div className="border-t border-border border-dashed my-2" />
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-mono font-medium text-foreground">₹{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Platform Fee (0.5%)</span>
          <span className="font-mono font-medium text-foreground">₹{fee.toLocaleString()}</span>
        </div>
        <div className="border-t border-border border-dashed my-2" />
        <div className="flex items-center justify-between">
          <span className="text-foreground font-medium">Total</span>
          <span className="font-mono font-bold text-lg text-amber-600 dark:text-amber-400">₹{total.toLocaleString()}</span>
        </div>
      </div>

      <div className="bg-amber-500/10 rounded-lg p-3 mb-4 border border-amber-500/20">
        <div className="flex items-start gap-2">
          <Check className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="text-xs text-amber-700 dark:text-amber-200">
            <p className="font-medium">AI Confidence: {tradeRecommendation.confidence}%</p>
            <p className="mt-1 text-amber-600/80 dark:text-amber-200/80">{tradeRecommendation.rationale}</p>
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="relative w-full overflow-hidden bg-amber-500 hover:bg-amber-400 text-black py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors group shadow-[0_0_20px_-5px_rgba(245,158,11,0.5)]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_2s_infinite]" />
        <span className="relative z-10">Authorize Payment</span>
        <ArrowRight className="w-4 h-4 relative z-10" />
      </motion.button>
    </motion.div>
  );
}
