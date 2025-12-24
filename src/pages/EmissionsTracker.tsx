import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Upload,
  FileSpreadsheet,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Play,
  X,
  TrendingUp,
  TrendingDown,
  Loader2
} from 'lucide-react';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { AISuggestionBanner } from '@/components/shared/AISuggestionBanner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useEmissions } from '@/hooks/useEmissions';
import { useAI } from '@/hooks/useAI';
import { TableSkeleton } from '@/components/loading/TableSkeleton';
import { toast } from 'sonner';



export default function EmissionsTracker() {
  const { isSimpleView } = useWorkspace();
  const { records, anomalyLogs, liveFeed, isLoading, uploadRecord, isUploading } = useEmissions();
  const { analyzeEmissions, isAnalyzingEmissions } = useAI();

  // Simulator State
  const [showSimulator, setShowSimulator] = useState(false);
  const [productionOutput, setProductionOutput] = useState(100);
  const [energyMix, setEnergyMix] = useState(50);
  const [efficiency, setEfficiency] = useState(85);

  const handleSimulation = () => {
    toast.info("AI is running predictive simulation...");
    analyzeEmissions(
      `Simulate emissions with Production: ${productionOutput}%, Green Energy: ${energyMix}%, Efficiency: ${efficiency}%`,
      {
        onSuccess: (data) => {
          toast.success("Simulation Complete", {
            description: data.response,
            duration: 6000,
          });
        }
      }
    );
  };

  // Mock trend data for now (since we haven't implemented aggregation API yet)
  const monthlyTrendData = [
    { month: 'Jul', emissions: 1850 },
    { month: 'Aug', emissions: 1920 },
    { month: 'Sep', emissions: 1780 },
    { month: 'Oct', emissions: 2100 },
    { month: 'Nov', emissions: 1950 },
    { month: 'Dec', emissions: 1820 },
    { month: 'Jan', emissions: 1680 },
  ];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto mt-8">
        <TableSkeleton />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Emissions Tracker - CarbonBook Enterprise</title>
        <meta name="description" content="Track and manage your emissions data with smart upload, live monitoring, and AI simulation capabilities." />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        <AISuggestionBanner
          type={isSimpleView ? "info" : "warning"}
          message={isSimpleView
            ? "Summary: Emissions down 8% this month. On track for Q1 targets."
            : "Anomaly Alert: Furnace B showing irregular readings at 2 PM. Check maintenance logs."
          }
          action={isSimpleView ? "View Details" : "Investigate"}
        />

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isSimpleView ? 'Emissions Overview' : 'Emissions Data Room'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isSimpleView ? 'Monthly trends and key metrics' : 'Real-time monitoring, data uploads & anomaly detection'}
            </p>
          </div>
          {!isSimpleView && (
            <button
              onClick={() => setShowSimulator(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              <Sliders className="w-4 h-4" />
              <span>AI Simulator</span>
            </button>
          )}
        </div>

        {isSimpleView ? (
          // OWNER VIEW: Simple trend chart
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                className="glass-panel p-6 rounded-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-label">Total Emissions (YTD)</span>
                  <TrendingDown className="w-5 h-5 text-carbon-success" />
                </div>
                <p className="text-value text-3xl font-bold">12,450</p>
                <p className="text-sm text-slate-500">tCO2e</p>
                <p className="text-xs text-carbon-success mt-2">↓ 8% vs last year</p>
              </div>

              <div
                className="glass-panel p-6 rounded-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-label">This Month</span>
                  <Activity className="w-5 h-5 text-carbon-tech" />
                </div>
                <p className="text-value text-3xl font-bold">1,680</p>
                <p className="text-sm text-slate-500">tCO2e</p>
                <p className="text-xs text-carbon-success mt-2">↓ 7% vs Dec</p>
              </div>

              <div
                className="glass-panel p-6 rounded-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-label">Target Progress</span>
                  <TrendingUp className="w-5 h-5 text-carbon-warning" />
                </div>
                <p className="text-value text-3xl font-bold">68%</p>
                <p className="text-sm text-slate-500">of annual reduction</p>
                <p className="text-xs text-carbon-warning mt-2">4 months remaining</p>
              </div>
            </div>

            {/* Monthly Trend Chart */}
            <div className="glass-panel p-6 rounded-2xl">
              <h2 className="text-lg font-semibold mb-6 text-white">Monthly Emission Trend</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrendData}>
                    <defs>
                      <filter id="neon-glow" height="200%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
                        <feOffset in="blur" dx="0" dy="0" result="offsetBlur" />
                        <feFlood floodColor="#22d3ee" floodOpacity="0.6" result="glowColor" />
                        <feComposite in="glowColor" in2="offsetBlur" operator="in" result="glow" />
                        <feMerge>
                          <feMergeNode in="glow" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
                      dx={-10}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                      }}
                      cursor={{ stroke: '#22d3ee', strokeWidth: 1, strokeDasharray: '4 4' }}
                      formatter={(value: number) => [`${value.toLocaleString()} tCO2e`, 'Emissions']}
                    />
                    <Line
                      type="monotone"
                      dataKey="emissions"
                      stroke="#22d3ee"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, fill: '#0B1120', stroke: '#22d3ee', strokeWidth: 3 }}
                      filter="url(#neon-glow)"
                      isAnimationActive={true}
                      animationDuration={1500}
                      animationEasing="ease-in-out"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          // OFFICER VIEW: Dense data table, upload, logs
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            <div className="lg:col-span-7 space-y-6">
              {/* Smart Upload Zone */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-6 rounded-2xl"
              >
                <h2 className="text-label mb-4">
                  Smart Upload
                </h2>
                <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-colors cursor-pointer group">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-cyan-400" />
                  </div>
                  <p className="font-medium text-white mb-1">Drop your utility bills here</p>
                  <p className="text-sm text-slate-500">PDF, CSV, or Excel files. AI will auto-extract data.</p>
                </div>
              </motion.div>

              {/* Data Table */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-panel overflow-hidden rounded-2xl"
              >
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-white">Emissions Data</span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">{records.length} records</span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-white/5">
                      <TableHead className="text-xs font-medium uppercase text-slate-500">ID</TableHead>
                      <TableHead className="text-xs font-medium uppercase text-slate-500">Source</TableHead>
                      <TableHead className="text-xs font-medium uppercase text-slate-500">Type</TableHead>
                      <TableHead className="text-xs font-medium uppercase text-right text-slate-500">Value</TableHead>
                      <TableHead className="text-xs font-medium uppercase text-slate-500">Status</TableHead>
                      <TableHead className="text-xs font-medium uppercase text-slate-500">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((row) => (
                      <TableRow key={row.id} className="font-mono text-sm border-white/5 hover:bg-white/5">
                        <TableCell className="text-slate-500">{row.id}</TableCell>
                        <TableCell className="font-sans font-medium text-slate-300">{row.source}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 text-xs font-medium text-slate-300">
                            <span className={`w-2 h-2 rounded-full ${row.type === 'Scope 1' ? 'bg-rose-500' :
                              row.type === 'Scope 2' ? 'bg-amber-500' :
                                'bg-slate-500'
                              }`} />
                            {row.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-white">{row.value.toFixed(1)} {row.unit}</TableCell>
                        <TableCell>
                          {row.status === 'verified' ? (
                            <span className="flex items-center gap-1 text-carbon-success">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span className="text-xs font-sans">Verified</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-carbon-warning">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span className="text-xs font-sans">Pending</span>
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-500">{row.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </motion.div>

              {/* Anomaly Logs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-panel p-6 rounded-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-label">
                    Anomaly Detection Log
                  </h2>
                  <span className="text-xs px-2 py-1 rounded bg-carbon-risk/10 text-carbon-risk border border-carbon-risk/20">
                    2 unresolved
                  </span>
                </div>
                <div className="space-y-3">
                  {anomalyLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${log.status === 'unresolved' ? 'bg-carbon-risk' :
                          log.status === 'investigating' ? 'bg-carbon-warning' : 'bg-carbon-success'
                          }`} />
                        <div>
                          <p className="text-sm font-medium text-slate-200">{log.source}: {log.anomaly}</p>
                          <p className="text-xs text-slate-500 font-mono">{log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded font-medium capitalize ${log.status === 'unresolved' ? 'bg-carbon-risk/10 text-carbon-risk' :
                        log.status === 'investigating' ? 'bg-carbon-warning/10 text-carbon-warning' :
                          'bg-carbon-success/10 text-carbon-success'
                        }`}>
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Live Feed */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-panel p-4 rounded-2xl"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-4 h-4 text-carbon-success" />
                  <span className="text-sm font-medium text-white">Live Feed</span>
                  <span className="w-2 h-2 rounded-full bg-carbon-success animate-pulse ml-auto" />
                </div>
                <div className="space-y-0">
                  {liveFeed.map((item, index) => (
                    <div key={item.id} className={`py-3 ${index !== liveFeed.length - 1 ? 'border-b border-white/5' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full mt-2 ${item.type === 'success' ? 'bg-carbon-success' :
                          item.type === 'warning' ? 'bg-carbon-warning' : 'bg-slate-500'
                          }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-200">{item.message}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {item.created_at ? new Date(item.created_at).toLocaleTimeString() : 'Just now'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* AI Simulator Slide-out - Officer View Only */}
        {showSimulator && !isSimpleView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
            onClick={() => setShowSimulator(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-semibold">AI Emission Simulator</h2>
                <button onClick={() => setShowSimulator(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Production Output: {productionOutput}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={productionOutput}
                    onChange={(e) => setProductionOutput(Number(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Green Energy Mix: {energyMix}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={energyMix}
                    onChange={(e) => setEnergyMix(Number(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Energy Efficiency: {efficiency}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={efficiency}
                    onChange={(e) => setEfficiency(Number(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer"
                  />
                </div>
                <div className="p-4 bg-secondary rounded-xl">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Projected Impact</p>
                  <p className="text-2xl font-bold font-mono">
                    {((productionOutput * 0.8 - energyMix * 0.2 - efficiency * 0.3) * 100).toFixed(0)} tCO2e
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Monthly emissions estimate</p>
                </div>
                <div className="pt-4">
                  <button
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    onClick={handleSimulation}
                    disabled={isAnalyzingEmissions}
                  >
                    {isAnalyzingEmissions ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Simulating...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Run Simulation
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div >
    </>
  );
}
