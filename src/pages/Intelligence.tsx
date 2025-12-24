import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  Send,
  Sparkles,
  X,
  FileSpreadsheet,
  FileText,
  TrendingDown,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AISuggestionBanner } from '@/components/shared/AISuggestionBanner';
import { useWorkspace } from '@/contexts/WorkspaceContext';

// Heatmap data
const heatmapData = [
  { hour: '00:00', mon: 12, tue: 15, wed: 14, thu: 13, fri: 11, sat: 5, sun: 4 },
  { hour: '04:00', mon: 8, tue: 9, wed: 10, thu: 9, fri: 8, sat: 3, sun: 2 },
  { hour: '08:00', mon: 45, tue: 48, wed: 52, thu: 49, fri: 47, sat: 15, sun: 10 },
  { hour: '12:00', mon: 62, tue: 65, wed: 68, thu: 64, fri: 60, sat: 20, sun: 12 },
  { hour: '14:00', mon: 78, tue: 82, wed: 85, thu: 80, fri: 75, sat: 22, sun: 15 },
  { hour: '16:00', mon: 70, tue: 72, wed: 75, thu: 71, fri: 68, sat: 18, sun: 12 },
  { hour: '20:00', mon: 35, tue: 38, wed: 40, thu: 37, fri: 32, sat: 10, sun: 8 },
];

const getHeatColor = (value: number) => {
  if (value >= 75) return 'bg-carbon-risk';
  if (value >= 50) return 'bg-carbon-warning';
  if (value >= 25) return 'bg-carbon-warning/50';
  return 'bg-carbon-success/30';
};

// Base projection data
const generateProjectionData = (renewablePercent: number, efficiency: number) => {
  const baseEmissions = 15000;
  const years = [2025, 2026, 2027, 2028, 2029, 2030];
  const targetNetZero = 0;
  
  return years.map((year, index) => {
    const yearFactor = index / (years.length - 1);
    const renewableImpact = (renewablePercent / 100) * 0.6;
    const efficiencyImpact = (efficiency / 100) * 0.4;
    const totalReduction = (renewableImpact + efficiencyImpact) * yearFactor;
    
    const projected = baseEmissions * (1 - totalReduction * 0.8);
    const target = baseEmissions * (1 - yearFactor);
    
    return {
      year: year.toString(),
      projected: Math.max(projected, targetNetZero),
      target: Math.max(target, targetNetZero),
      gap: Math.max(0, projected - target),
    };
  });
};

const chatResponses: Record<string, string> = {
  'analyze my scope 1 spikes': 'Based on the data, Furnace B is showing anomalous energy consumption at 2 PM daily. This correlates with a 23% increase in Scope 1 emissions. Recommendation: Check maintenance logs for Furnace B - likely heat exchanger inefficiency.',
  'predict next quarter': 'Based on current trends and seasonal patterns, Q2 2025 emissions are projected at 8,450 tCO2e (+12% vs Q1). Key drivers: Summer cooling demand, production ramp-up. Mitigation opportunity: Solar PV installation could offset 15%.',
  'cost optimization': 'Top 3 cost reduction opportunities identified:\n1. Shift furnace operations to off-peak hours: ₹2.3L/month savings\n2. Replace Furnace B heat exchanger: ₹1.8L/month\n3. Optimize HVAC schedules: ₹0.9L/month',
};

export default function Intelligence() {
  const { isSimpleView, isChatPanelOpen, setChatPanelOpen } = useWorkspace();
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai'; content: string}[]>([]);
  
  // Simulator state
  const [renewableEnergy, setRenewableEnergy] = useState([25]);
  const [energyEfficiency, setEnergyEfficiency] = useState([15]);
  const [projectionData, setProjectionData] = useState(generateProjectionData(25, 15));

  // Update projection when sliders change
  useEffect(() => {
    setProjectionData(generateProjectionData(renewableEnergy[0], energyEfficiency[0]));
  }, [renewableEnergy, energyEfficiency]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput.toLowerCase().trim();
    setChatMessages(prev => [...prev, { role: 'user', content: chatInput }]);
    
    const matchedKey = Object.keys(chatResponses).find(key => 
      userMessage.includes(key) || key.includes(userMessage.split(' ').slice(0, 3).join(' '))
    );
    
    const aiResponse = matchedKey 
      ? chatResponses[matchedKey]
      : "I can help analyze your emissions data. Try asking about 'scope 1 spikes', 'predict next quarter', or 'cost optimization'.";
    
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
    }, 500);
    
    setChatInput('');
  };

  const openChat = () => setChatPanelOpen(true);
  const closeChat = () => setChatPanelOpen(false);

  return (
    <>
      <Helmet>
        <title>Intelligence | CarbonBook Enterprise</title>
        <meta name="description" content="AI-powered analytics and insights for emissions data" />
      </Helmet>

      <div className="min-h-screen bg-background p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground flex items-center gap-3">
                <BrainCircuit className="w-7 h-7 text-carbon-tech" />
                Intelligence Center
              </h1>
              <p className="text-muted-foreground mt-1">AI-Powered Analytics & Net Zero Projections</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={openChat}
                className="border-purple-500/30 text-purple-600 hover:bg-purple-50"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Artha SAGE
              </Button>
              {!isSimpleView && (
                <Button variant="outline" size="sm">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              )}
              <Button size="sm" className="bg-carbon-tech hover:bg-carbon-tech/90">
                <FileText className="w-4 h-4 mr-2" />
                Generate Board Pack
              </Button>
            </div>
          </div>

          {isSimpleView && (
            <AISuggestionBanner 
              message="AI Summary: Increasing renewable energy to 60% would put you on track for Net Zero by 2029 - 1 year ahead of target."
              type="info"
            />
          )}

          {/* Net Zero Projection Simulator - Adaptive Glass */}
          <div className="carbon-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-carbon-tech/20 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-carbon-tech" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Net Zero Pathway Simulator</h3>
                  <p className="text-sm text-muted-foreground">Adjust parameters to see projected impact</p>
                </div>
              </div>
              <Badge className="bg-carbon-success/20 text-carbon-success border-carbon-success/30">
                <Zap className="w-3 h-3 mr-1" />
                Interactive
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sliders */}
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-muted/50 dark:bg-white/5 border border-border dark:border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-foreground">Renewable Energy Mix</label>
                    <span className="text-lg font-mono text-carbon-tech">{renewableEnergy[0]}%</span>
                  </div>
                  <Slider
                    value={renewableEnergy}
                    onValueChange={setRenewableEnergy}
                    max={100}
                    step={5}
                    className="[&_[role=slider]]:bg-carbon-tech"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Current: 25% | Target: 80%</p>
                </div>

                <div className="p-4 rounded-xl bg-muted/50 dark:bg-white/5 border border-border dark:border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-foreground">Energy Efficiency Improvement</label>
                    <span className="text-lg font-mono text-green-primary">{energyEfficiency[0]}%</span>
                  </div>
                  <Slider
                    value={energyEfficiency}
                    onValueChange={setEnergyEfficiency}
                    max={50}
                    step={5}
                    className="[&_[role=slider]]:bg-green-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Current: 15% | Best Practice: 35%</p>
                </div>

                <div className="p-4 rounded-xl bg-muted/50 dark:bg-white/5 border border-border dark:border-white/10">
                  <p className="text-xs text-muted-foreground mb-2">Projected Net Zero Year</p>
                  <p className="text-3xl font-mono font-bold text-foreground">
                    {renewableEnergy[0] >= 80 && energyEfficiency[0] >= 30 ? '2028' : 
                     renewableEnergy[0] >= 60 && energyEfficiency[0] >= 20 ? '2029' : 
                     renewableEnergy[0] >= 40 ? '2030' : '2031+'}
                  </p>
                  <p className={`text-sm mt-1 ${
                    renewableEnergy[0] >= 60 ? 'text-carbon-success' : 'text-carbon-warning'
                  }`}>
                    {renewableEnergy[0] >= 60 ? 'On track for 2030 target' : 'Behind 2030 target'}
                  </p>
                </div>
              </div>

              {/* Projection Chart */}
              <div className="lg:col-span-2 p-4 rounded-xl bg-muted/50 dark:bg-white/5 border border-border dark:border-white/10">
                <h4 className="text-sm font-medium text-foreground mb-4">Emission Trajectory (tCO2e)</h4>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projectionData}>
                      <defs>
                        <linearGradient id="projectedGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="year" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))'
                        }}
                        formatter={(value: number) => [`${value.toLocaleString()} tCO2e`, '']}
                      />
                      <Area
                        type="monotone"
                        dataKey="target"
                        stroke="hsl(142, 71%, 45%)"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        fill="url(#targetGradient)"
                        name="Target Path"
                      />
                      <Area
                        type="monotone"
                        dataKey="projected"
                        stroke="hsl(217, 91%, 60%)"
                        strokeWidth={2}
                        fill="url(#projectedGradient)"
                        name="Projected"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-carbon-tech" />
                    <span className="text-xs text-muted-foreground">Projected Path</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-carbon-success border-dashed" style={{ borderStyle: 'dashed' }} />
                    <span className="text-xs text-muted-foreground">Net Zero Target</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Heatmap - Only show in Officer view */}
          {!isSimpleView && (
            <div className="carbon-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Emission Intensity by Hour</h3>
                <Badge className="bg-carbon-risk/20 text-carbon-risk border-carbon-risk/30">
                  Spikes Detected
                </Badge>
              </div>
              <div className="bg-muted/50 dark:bg-white/5 rounded-xl p-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-xs text-muted-foreground font-normal p-2 text-left">Hour</th>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                          <th key={day} className="text-xs text-muted-foreground font-normal p-2 text-center">{day}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {heatmapData.map((row) => (
                        <tr key={row.hour}>
                          <td className="text-xs text-foreground/80 font-mono p-2">{row.hour}</td>
                          {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => (
                            <td key={day} className="p-1">
                              <div 
                                className={`w-full h-8 rounded ${getHeatColor(row[day as keyof typeof row] as number)} flex items-center justify-center`}
                              >
                                <span className="text-xs font-mono text-white/90">
                                  {row[day as keyof typeof row]}
                                </span>
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-carbon-success/30" />
                    <span className="text-xs text-muted-foreground">Low (&lt;25)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-carbon-warning/50" />
                    <span className="text-xs text-muted-foreground">Medium (25-50)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-carbon-warning" />
                    <span className="text-xs text-muted-foreground">High (50-75)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-carbon-risk" />
                    <span className="text-xs text-muted-foreground">Critical (&gt;75)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Simplified Energy Flow - Only in Officer view */}
          {!isSimpleView && (
            <div className="carbon-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Energy Flow Analysis</h3>
                <Badge className="bg-carbon-tech/20 text-carbon-tech border-carbon-tech/30">
                  Live Data
                </Badge>
              </div>
              <div className="bg-muted/50 dark:bg-white/5 rounded-xl p-4">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Sources</p>
                    {['Coal', 'Natural Gas', 'Solar', 'Grid'].map((source, i) => (
                      <div 
                        key={source}
                        className={`p-2 rounded-lg text-xs font-medium ${
                          i < 2 ? 'bg-carbon-risk/30 text-carbon-risk' : 'bg-carbon-success/30 text-carbon-success'
                        }`}
                      >
                        {source}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-full h-px bg-gradient-to-r from-carbon-risk/50 to-carbon-warning/50" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Facilities</p>
                    {['Furnace A', 'Furnace B', 'Office', 'Warehouse'].map((facility) => (
                      <div 
                        key={facility}
                        className="p-2 rounded-lg text-xs font-medium bg-carbon-warning/30 text-carbon-warning"
                      >
                        {facility}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Scope</p>
                    <div className="p-2 rounded-lg text-xs font-medium bg-carbon-risk/30 text-carbon-risk">
                      Scope 1
                      <p className="font-mono mt-1">9,700 tCO2e</p>
                    </div>
                    <div className="p-2 rounded-lg text-xs font-medium bg-carbon-tech/30 text-carbon-tech">
                      Scope 2
                      <p className="font-mono mt-1">1,000 tCO2e</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* CarbonGPT Chat Sidebar */}
        <AnimatePresence>
          {isChatPanelOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 z-40"
                onClick={closeChat}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-xl z-50 flex flex-col"
              >
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">CarbonGPT</h3>
                      <p className="text-xs text-muted-foreground">AI Analytics Assistant</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={closeChat}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-8">
                      <BrainCircuit className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">
                        Ask me about your emissions data, predictions, or optimization opportunities.
                      </p>
                      <div className="mt-4 space-y-2">
                        {['Analyze my Scope 1 spikes', 'Predict next quarter', 'Cost optimization'].map((prompt) => (
                          <button
                            key={prompt}
                            onClick={() => {
                              setChatInput(prompt);
                            }}
                            className="w-full p-2 text-sm text-left rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-xl text-sm ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask CarbonGPT..."
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} size="icon">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
