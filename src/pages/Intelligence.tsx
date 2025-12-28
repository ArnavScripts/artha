import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import {
  BrainCircuit,
  Sparkles,
  TrendingUp,
  Zap,
  CheckCircle2,
  Play,
  Loader2,
  ArrowRight,
  Activity,
  Target,
  ShieldCheck,
  FileText,
  Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import ReactMarkdown from 'react-markdown';
import { useSimulation } from '@/hooks/useSimulation';
import { format } from 'date-fns';

export default function Intelligence() {
  const { setChatPanelOpen, setInitialChatMessage } = useWorkspace();
  const { scenario, interventions, projections, isLoading, isSimulating, runSimulation } = useSimulation();

  // UI State
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  // Calculate Totals
  const totalSavings = useMemo(() => {
    if (projections.length === 0) return 0;
    const bauTotal = projections.reduce((sum, p) => sum + Number(p.bau_value), 0);
    const optTotal = projections.reduce((sum, p) => sum + Number(p.optimized_value), 0);
    return bauTotal - optTotal;
  }, [projections]);

  const handleOpenSage = () => {
    setChatPanelOpen(true);
  };

  const handleNewSimulation = () => {
    setInitialChatMessage("Generate a strategic decarbonization plan based on my current financial and environmental data. Focus on high-impact, low-effort wins first.");
    setChatPanelOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Intelligence War Room | Artha</title>
      </Helmet>

      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                <BrainCircuit className="w-6 h-6 text-indigo-400" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Intelligence War Room</h1>
            </div>
            <p className="text-slate-400 max-w-2xl">
              AI-driven simulations and predictive modeling for carbon liability management.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20"
              onClick={handleNewSimulation}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              New Simulation
            </Button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column: Simulator */}
          <div className="lg:col-span-2 space-y-6">

            {/* Chart Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <TrendingUp className="w-32 h-32 text-indigo-500" />
              </div>

              <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    Price Shock Simulator
                    <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10">
                      Live Model
                    </Badge>
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Projected liability under current vs. optimized scenarios
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Total Savings Opportunity</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    ₹{(totalSavings / 100000).toFixed(1)}L
                  </p>
                </div>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={projections}>
                    <defs>
                      <linearGradient id="colorBau" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorOpt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                      dataKey="month"
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => format(new Date(value), 'MMM')}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                      itemStyle={{ color: '#e2e8f0' }}
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                      labelFormatter={(label) => format(new Date(label), 'MMMM yyyy')}
                    />
                    <Area
                      type="monotone"
                      dataKey="bau_value"
                      stroke="#ef4444"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorBau)"
                      name="Business As Usual"
                    />
                    <Area
                      type="monotone"
                      dataKey="optimized_value"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorOpt)"
                      name="Optimized Path"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Simulation Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Target className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h4 className="font-medium text-slate-200">Carbon Price</h4>
                </div>
                <p className="text-2xl font-bold text-white">₹2,500<span className="text-sm text-slate-500 font-normal">/ton</span></p>
                <p className="text-xs text-slate-500 mt-1">Market Projection</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Activity className="w-4 h-4 text-blue-400" />
                  </div>
                  <h4 className="font-medium text-slate-200">Production Vol</h4>
                </div>
                <p className="text-2xl font-bold text-white">100%</p>
                <p className="text-xs text-slate-500 mt-1">Capacity Utilization</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                  </div>
                  <h4 className="font-medium text-slate-200">Risk Score</h4>
                </div>
                <p className="text-2xl font-bold text-white">Low</p>
                <p className="text-xs text-slate-500 mt-1">Compliance Status</p>
              </div>
            </div>
          </div>

          {/* Right Column: Decarbonization Roadmap */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Decarbonization Roadmap</h3>
              <Badge variant="outline" className="border-slate-700 text-slate-400">
                {interventions.filter(i => i.is_applied).length}/{interventions.length} Applied
              </Badge>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
              ) : interventions.map((action) => (
                <motion.div
                  key={action.id}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${action.is_applied
                    ? 'bg-cyan-500/10 border-cyan-500/50'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                    }`}
                  onMouseEnter={() => setHoveredAction(action.id)}
                  onMouseLeave={() => setHoveredAction(null)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className={`font-medium ${action.is_applied ? 'text-cyan-400' : 'text-slate-200'}`}>
                        {action.title}
                      </h4>
                      <p className="text-sm text-slate-400 mt-1">{action.impact_description}</p>
                    </div>
                    <Badge variant={action.is_applied ? "default" : "secondary"} className={action.is_applied ? "bg-cyan-500/20 text-cyan-400" : ""}>
                      {action.reduction_percentage}% Red.
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div>
                      <span className="text-slate-500 block text-xs">CapEx</span>
                      <span className="text-slate-300">₹{(action.capex_cost / 100000).toFixed(1)}L</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs">NPV</span>
                      <span className="text-green-400">₹{(action.npv_value / 100000).toFixed(1)}L</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between">
                    <span className="text-xs text-slate-500">AI Confidence: 94%</span>
                    <Button
                      size="sm"
                      variant={action.is_applied ? "ghost" : "default"}
                      className={action.is_applied ? "text-cyan-400 hover:text-cyan-300" : "bg-cyan-600 hover:bg-cyan-500"}
                      onClick={() => !action.is_applied && runSimulation(action.id)}
                      disabled={action.is_applied || isSimulating}
                    >
                      {isSimulating && hoveredAction === action.id ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : action.is_applied ? (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      {isSimulating && hoveredAction === action.id ? "Simulating..." : action.is_applied ? "Applied" : "Simulate"}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
