import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
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
  Loader2,
  Zap,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function EmissionsTracker() {
  const { isSimpleView } = useWorkspace();
  const { records, anomalyLogs, liveFeed, isLoading, uploadRecord, isUploading } = useEmissions();
  const { analyzeEmissions, isAnalyzingEmissions } = useAI();

  // Calculate Real Metrics
  const { totalEmissions, thisMonthEmissions, totalCost, chartData } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let total = 0;
    let monthTotal = 0;
    let cost = 0;
    const monthlyAgg: Record<string, { emissions: number; cost: number; order: number }> = {};

    records.forEach(r => {
      const d = new Date(r.date);
      const m = d.toLocaleString('default', { month: 'short' });
      const key = `${m}`; // Just month name for chart

      // Ensure carbon_emission and cost exist (handled in service, but safe check)
      const emission = r.carbon_emission || 0;
      const rCost = r.cost || 0;

      total += emission;
      cost += rCost;

      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        monthTotal += emission;
      }

      if (!monthlyAgg[key]) {
        monthlyAgg[key] = { emissions: 0, cost: 0, order: d.getMonth() };
      }
      monthlyAgg[key].emissions += emission;
      monthlyAgg[key].cost += rCost;
    });

    // Sort by month order
    const data = Object.entries(monthlyAgg)
      .map(([month, val]) => ({
        month,
        emissions: val.emissions,
        cost: val.cost,
        order: val.order
      }))
      .sort((a, b) => a.order - b.order);

    // If no data, provide a placeholder
    const finalChartData = data.length > 0 ? data : [
      { month: 'Jan', emissions: 0, cost: 0 },
      { month: 'Feb', emissions: 0, cost: 0 },
      { month: 'Mar', emissions: 0, cost: 0 }
    ];

    return {
      totalEmissions: total,
      thisMonthEmissions: monthTotal,
      totalCost: cost,
      chartData: finalChartData
    };
  }, [records]);

  // Simulator State
  const [showSimulator, setShowSimulator] = useState(false);
  const [productionOutput, setProductionOutput] = useState(100);
  const [energyMix, setEnergyMix] = useState(50);
  const [efficiency, setEfficiency] = useState(85);

  // --- PHASE 3: DESIGN (Physics & Animations) ---
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

  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const sortedRecords = useMemo(() => {
    let sortableRecords = [...records];
    if (sortConfig !== null) {
      sortableRecords.sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableRecords;
  }, [records, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Source', 'Type', 'Value', 'Unit', 'Status', 'Date'];
    const csvContent = [
      headers.join(','),
      ...sortedRecords.map(row => [
        row.id,
        `"${row.source}"`, // Quote strings
        row.type,
        row.value,
        row.unit,
        row.status,
        row.date
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `emissions_data_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AISuggestionBanner
          type={totalCost > 4000000 ? "warning" : (isSimpleView ? "info" : "warning")}
          message={
            totalCost > 4000000
              ? `Warning: Carbon price rising. Optimization could save ₹${(totalCost * 0.1 / 100000).toFixed(1)}L annually.`
              : (isSimpleView
                ? "Summary: Emissions down 8% this month. On track for Q1 targets."
                : "Anomaly Alert: Furnace B showing irregular readings at 2 PM. Check maintenance logs.")
          }
          action={totalCost > 4000000 ? "Optimize Now" : (isSimpleView ? "View Details" : "Investigate")}
        />

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {isSimpleView ? 'Emissions Overview' : 'Emissions Data Room'}
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              {isSimpleView ? 'Monthly trends and key metrics' : 'Real-time monitoring, data uploads & anomaly detection'}
              {!isSimpleView && <Badge variant="outline" className="border-cyan-500/30 text-cyan-500 bg-cyan-500/10 animate-pulse">Live Stream</Badge>}
            </p>
          </div>
          {!isSimpleView && (
            <Button
              onClick={() => setShowSimulator(true)}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)]"
            >
              <Sliders className="w-4 h-4 mr-2" />
              AI Simulator
            </Button>
          )}
        </div>

        {isSimpleView ? (
          // OWNER VIEW: Simple trend chart
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                whileHover={{ y: -4 }}
                className="glass-panel p-6 rounded-2xl border border-white/5 bg-card/30 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-muted-foreground">Total Emissions (YTD)</span>
                  <div className="p-2 rounded-full bg-green-500/10">
                    <TrendingDown className="w-5 h-5 text-green-500" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-foreground font-mono tracking-tight">{totalEmissions.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground mt-1">tCO2e</p>
                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded w-fit">
                  <TrendingDown className="w-3 h-3" /> 8% vs last year
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="glass-panel p-6 rounded-2xl border border-white/5 bg-card/30 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-muted-foreground">This Month</span>
                  <div className="p-2 rounded-full bg-cyan-500/10">
                    <Activity className="w-5 h-5 text-cyan-500" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-foreground font-mono tracking-tight">{thisMonthEmissions.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground mt-1">tCO2e</p>
                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded w-fit">
                  <TrendingDown className="w-3 h-3" /> 7% vs Dec
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="glass-panel p-6 rounded-2xl border border-white/5 bg-card/30 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-muted-foreground">Est. Carbon Cost</span>
                  <div className="p-2 rounded-full bg-amber-500/10">
                    <DollarSign className="w-5 h-5 text-amber-500" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-foreground font-mono tracking-tight">₹{(totalCost / 1000).toFixed(1)}k</p>
                <p className="text-sm text-muted-foreground mt-1">Liability</p>
                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-1 rounded w-fit">
                  <TrendingUp className="w-3 h-3" /> 2% vs last month
                </div>
              </motion.div>
            </div>

            {/* Monthly Trend Chart with Neon Glow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-6 rounded-2xl border border-white/5 bg-card/30 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-500" />
                  Monthly Emission Trend
                </h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></span>
                    Emissions
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500/50"></span>
                    Cost
                  </div>
                </div>
              </div>

              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                      <filter id="neon-glow" height="200%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
                        <feOffset in="blur" dx="0" dy="0" result="offsetBlur" />
                        <feFlood floodColor="#06b6d4" floodOpacity="0.6" result="glowColor" />
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
                      yAxisId="left"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
                      dx={-10}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                      dx={10}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        fontSize: '12px',
                        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(10px)'
                      }}
                      cursor={{ stroke: '#06b6d4', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="emissions"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorEmissions)"
                      filter="url(#neon-glow)"
                      activeDot={{ r: 6, fill: '#0B1120', stroke: '#06b6d4', strokeWidth: 3 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        ) : (
          // OFFICER VIEW: Dense data table, upload, logs
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            <div className="lg:col-span-7 space-y-6">
              {/* Smart Upload Zone */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-6 rounded-2xl border border-white/5 bg-card/30 backdrop-blur-xl"
              >
                <h2 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-cyan-500" />
                  Smart Upload
                </h2>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.csv,.xlsx,.jpg,.png"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        toast.info("Uploading and processing bill...");
                        uploadRecord(file);
                      }
                    }}
                    disabled={isUploading}
                  />
                  <div className={`border-2 border-dashed border-white/10 rounded-xl p-8 text-center transition-all group relative overflow-hidden ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-cyan-500/50 hover:bg-cyan-500/5 cursor-pointer'}`}>
                    <div className="absolute inset-0 bg-cyan-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <div className="relative z-10">
                      <div className="w-12 h-12 mx-auto rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:bg-cyan-500/20">
                        {isUploading ? (
                          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                        ) : (
                          <Upload className="w-6 h-6 text-slate-400 group-hover:text-cyan-400" />
                        )}
                      </div>
                      <p className="font-medium text-white mb-1">
                        {isUploading ? "Processing with AI..." : "Drop your utility bills here"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {isUploading ? "Extracting data & calculating emissions" : "PDF, CSV, or Excel files. AI will auto-extract data."}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Data Table */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-panel overflow-hidden rounded-2xl border border-white/5 bg-card/30 backdrop-blur-xl"
              >
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-cyan-500" />
                    <span className="text-sm font-medium text-white">Emissions Data</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 font-mono bg-white/5 px-2 py-1 rounded">{records.length} records</span>
                    <Button variant="outline" size="sm" className="h-7 text-xs border-white/10 hover:bg-white/5" onClick={handleExportCSV}>
                      Export CSV
                    </Button>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-white/5">
                      <TableHead className="text-xs font-medium uppercase text-slate-500 cursor-pointer hover:text-cyan-400 transition-colors" onClick={() => requestSort('id')}>
                        ID {sortConfig?.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead className="text-xs font-medium uppercase text-slate-500 cursor-pointer hover:text-cyan-400 transition-colors" onClick={() => requestSort('source')}>
                        Source {sortConfig?.key === 'source' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead className="text-xs font-medium uppercase text-slate-500 cursor-pointer hover:text-cyan-400 transition-colors" onClick={() => requestSort('type')}>
                        Type {sortConfig?.key === 'type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead className="text-xs font-medium uppercase text-right text-slate-500 cursor-pointer hover:text-cyan-400 transition-colors" onClick={() => requestSort('value')}>
                        Value {sortConfig?.key === 'value' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead className="text-xs font-medium uppercase text-slate-500 cursor-pointer hover:text-cyan-400 transition-colors" onClick={() => requestSort('status')}>
                        Status {sortConfig?.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead className="text-xs font-medium uppercase text-slate-500 cursor-pointer hover:text-cyan-400 transition-colors" onClick={() => requestSort('date')}>
                        Date {sortConfig?.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedRecords.map((row) => (
                      <TableRow key={row.id} className="font-mono text-sm border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell className="text-slate-500">{row.id}</TableCell>
                        <TableCell className="font-sans font-medium text-slate-300">{row.source}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 text-xs font-medium text-slate-300 border border-white/5">
                            <span className={`w-1.5 h-1.5 rounded-full ${row.type === 'Scope 1' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' :
                              row.type === 'Scope 2' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                                'bg-slate-500'
                              }`} />
                            {row.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-white font-bold">{row.value.toFixed(1)} <span className="text-slate-500 font-normal text-xs">{row.unit}</span></TableCell>
                        <TableCell>
                          {row.status === 'verified' ? (
                            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded w-fit">
                              <CheckCircle2 className="w-3 h-3" />
                              <span className="text-xs font-sans font-medium">Verified</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2 py-1 rounded w-fit">
                              <AlertCircle className="w-3 h-3" />
                              <span className="text-xs font-sans font-medium">Pending</span>
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
                className="glass-panel p-6 rounded-2xl border border-white/5 bg-card/30 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    Anomaly Detection Log
                  </h2>
                  <span className="text-xs px-2 py-1 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse">
                    2 unresolved
                  </span>
                </div>
                <div className="space-y-3">
                  {anomalyLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${log.status === 'unresolved' ? 'bg-rose-500 animate-pulse' :
                          log.status === 'investigating' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                        <div>
                          <p className="text-sm font-medium text-slate-200">{log.source}: {log.anomaly}</p>
                          <p className="text-xs text-slate-500 font-mono">{log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded font-medium capitalize ${log.status === 'unresolved' ? 'bg-rose-500/10 text-rose-500' :
                        log.status === 'investigating' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-emerald-500/10 text-emerald-500'
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
                className="glass-panel p-4 rounded-2xl border border-white/5 bg-card/30 backdrop-blur-xl h-full"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium text-white">Live Feed</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-auto shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>
                <div className="space-y-0 relative">
                  {/* Timeline Line */}
                  <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-white/5" />

                  {liveFeed.map((item, index) => (
                    <div key={item.id} className={`py-3 relative pl-8 ${index !== liveFeed.length - 1 ? 'border-b border-white/5' : ''}`}>
                      <div className={`absolute left-2 top-5 w-1.5 h-1.5 rounded-full ${item.type === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                        item.type === 'warning' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-slate-500'
                        }`} />

                      <div className="min-w-0">
                        <p className="text-sm text-slate-200 leading-snug">{item.message}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {item.created_at ? new Date(item.created_at).toLocaleTimeString() : 'Just now'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* AI Simulator Slide-out - Officer View Only */}
        <AnimatePresence>
          {showSimulator && !isSimpleView && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end"
              onClick={() => setShowSimulator(false)}
            >
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-full max-w-md bg-[#0B1120] border-l border-white/10 shadow-2xl h-full overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    AI Emission Simulator
                  </h2>
                  <button onClick={() => setShowSimulator(false)} className="text-slate-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-8">
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-slate-300">Production Output</label>
                        <span className="text-sm font-mono text-cyan-400">{productionOutput}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={productionOutput}
                        onChange={(e) => setProductionOutput(Number(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-cyan-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-slate-300">Green Energy Mix</label>
                        <span className="text-sm font-mono text-green-400">{energyMix}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={energyMix}
                        onChange={(e) => setEnergyMix(Number(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-green-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-slate-300">Energy Efficiency</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={efficiency}
                            onChange={(e) => setEfficiency(Math.min(100, Math.max(0, Number(e.target.value))))}
                            className="w-12 h-6 bg-slate-800 border border-white/10 rounded text-center text-xs font-mono text-purple-400 focus:outline-none focus:border-purple-500"
                          />
                          <span className="text-sm font-mono text-purple-400">%</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={efficiency}
                        onChange={(e) => setEfficiency(Number(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>
                  </div>

                  <div className="p-5 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Projected Impact</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold font-mono text-white">
                        {(totalEmissions * (1 - efficiency / 100)).toFixed(1)}
                      </p>
                      <span className="text-sm text-slate-500">tCO2e</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">
                      Estimated emissions based on {efficiency}% efficiency improvement.
                    </p>
                  </div>

                  <Button
                    className="w-full h-12 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/20"
                    onClick={handleSimulation}
                    disabled={isAnalyzingEmissions}
                  >
                    {isAnalyzingEmissions ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Simulating Scenario...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2 fill-current" />
                        Run Simulation
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div >
    </>
  );
}

