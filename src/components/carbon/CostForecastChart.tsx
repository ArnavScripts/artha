import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useCarbonData } from '@/hooks/useCarbonData';
import { Loader2 } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-sky-200/10 dark:border-sky-400/10 rounded-lg shadow-lg p-3">
        <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${entry.dataKey === 'actual' ? 'bg-rose-500' : 'bg-sky-400'}`} />
            <span className="text-muted-foreground capitalize">{entry.dataKey}:</span>
            <span className="font-mono font-medium">₹{(entry.value / 100000).toFixed(1)}L</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function CostForecastChart() {
  const { forecast, isLoading } = useCarbonData();

  if (isLoading) {
    return (
      <div className="glass-panel p-6 rounded-2xl flex items-center justify-center h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div
      className="glass-panel p-6 rounded-2xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Cost Forecast
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Actual vs. Projected Compliance Costs
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 border-t-2 border-dashed border-rose-500" />
            <span className="text-muted-foreground">Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-sky-400" />
            <span className="text-muted-foreground">Projected</span>
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={forecast} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              {/* Actual - Rose/Red gradient */}
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
              </linearGradient>
              {/* Projected - Electric Sky/Cyan "Holographic" gradient */}
              <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.35} />
                <stop offset="50%" stopColor="#38BDF8" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
              </linearGradient>
              {/* Electric glow filter for projected line */}
              <filter id="glowSky" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `₹${value / 100000}L`}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Projected Path - Electric Sky Blue with holographic fill */}
            <Area
              type="monotone"
              dataKey="projected"
              stroke="#38BDF8"
              strokeWidth={2.5}
              fill="url(#colorProjected)"
              filter="url(#glowSky)"
              isAnimationActive={true}
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
            {/* Actual Path - Rose dashed */}
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#F43F5E"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="url(#colorActual)"
              connectNulls={false}
              isAnimationActive={true}
              animationDuration={1500}
              animationEasing="ease-in-out"
              animationBegin={200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
