import { motion } from 'framer-motion';
import { TrendingDown, ArrowDown, Flame, Zap, Truck, Loader2 } from 'lucide-react';
import { AnimatedNumber } from '@/components/shared/AnimatedNumber';
import { useCarbonData } from '@/hooks/useCarbonData';

export function NetComplianceLiability() {
  const { liability, isLoading } = useCarbonData();

  const scopeData = [
    { scope: 'Scope 1', value: liability.scope1, color: 'bg-carbon-risk', icon: Flame, label: 'Direct Emissions' },
    { scope: 'Scope 2', value: liability.scope2, color: 'bg-carbon-warning', icon: Zap, label: 'Indirect Energy' },
    { scope: 'Scope 3', value: liability.scope3, color: 'bg-carbon-slate', icon: Truck, label: 'Value Chain' },
  ];

  if (isLoading) {
    return (
      <div className="glass-panel p-6 rounded-2xl flex items-center justify-center h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div
      className="glass-panel p-6 relative overflow-hidden rounded-2xl"
    >
      {/* Subtle Glow Effect for Dark Mode */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-[100px] rounded-full pointer-events-none dark:bg-rose-500/10 hidden dark:block" />

      <div className="relative z-10 flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Net Compliance Liability
          </h2>
          <div className="flex items-baseline gap-3 mt-2">
            <AnimatedNumber
              value={liability.total}
              prefix="-₹"
              duration={800}
              className="text-4xl font-bold font-mono text-foreground"
            />
            <div className="flex items-center gap-1 text-carbon-risk">
              <ArrowDown className="w-4 h-4 rotate-180" />
              <span className="text-sm font-medium">+8.2%</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">vs. last quarter</p>
        </div>
        <div className="p-3 rounded-xl bg-carbon-risk/10 border border-carbon-risk/20">
          <TrendingDown className="w-6 h-6 text-carbon-risk" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Liability Breakdown
        </h3>

        {/* Stacked Bar */}
        <div className="h-4 rounded-full overflow-hidden flex bg-muted/50 border border-border">
          {scopeData.map((item, index) => (
            <motion.div
              key={item.scope}
              initial={{ width: 0 }}
              animate={{ width: liability.total > 0 ? `${(item.value / liability.total) * 100}%` : '0%' }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className={`h-full ${item.color} ${index === 0 ? 'rounded-l-full' : ''} ${index === scopeData.length - 1 ? 'rounded-r-full' : ''}`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          {scopeData.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.scope} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg ${item.color}/10 flex items-center justify-center border border-border`}>
                  <Icon className={`w-4 h-4 ${item.color === 'bg-carbon-risk' ? 'text-carbon-risk' : item.color === 'bg-carbon-warning' ? 'text-carbon-warning' : 'text-carbon-slate'}`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{item.scope}</p>
                  <p className="text-xs font-semibold font-mono text-foreground">₹{(item.value / 100000).toFixed(1)}L</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
