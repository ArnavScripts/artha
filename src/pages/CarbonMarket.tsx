import { Helmet } from 'react-helmet-async';
import {
  TrendingUp,
  BarChart3,
  Loader2,
  ShieldCheck,
  ChevronRight,
  Leaf,
  Check,
  Download,
  X,
  Globe,
  Monitor,
  Command,
  LayoutTemplate,
  TerminalSquare
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { marketService, MarketTicker } from '@/services/market.service';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export default function CarbonMarket() {
  const { viewDensity } = useWorkspace(); // Global State
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('0');
  const [price, setPrice] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeframe, setTimeframe] = useState<'1H' | '1D' | '1W' | '1M'>('1D');

  // Receipt State
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // Market Data
  const [tickerData, setTickerData] = useState<MarketTicker[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);

  // AI State
  interface AIRecommendation {
    action: 'ACCUMULATE' | 'DEFER' | 'HEDGE';
    recommended_volume_tier: string;
    limit_price_suggestion: number;
    confidence: number;
    strategic_rationale: string;
  }
  const [aiRec, setAiRec] = useState<AIRecommendation | null>(null);
  const [loadingAI, setLoadingAI] = useState(true);

  // Slider State
  const [sliderValue, setSliderValue] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // --- Keyboard Shortcuts (Officer Only) ---
  useEffect(() => {
    if (viewDensity === 'owner') return; // Disable shortcuts in Owner mode

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        setTradeType('buy');
        toast.info("Mode: Acquire (Offset)");
      }
      if (e.altKey && e.key === 'l') {
        e.preventDefault();
        setTradeType('sell');
        toast.info("Mode: Liquidate (Surplus)");
      }
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        setQuantity('25000');
        toast.info("Max Budget Applied");
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewDensity]);

  // --- Data Loading ---
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const history = await marketService.getTickerHistory();
        setTickerData(history);
        if (history.length > 0) {
          setCurrentPrice(history[history.length - 1].price);
          setPrice(history[history.length - 1].price.toFixed(2));
        }
      } catch (error) {
        console.error("Failed to load market data", error);
      }
    };

    const fetchAI = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('ai-trade-recommendation');
        if (error) throw error;
        setAiRec(data);
      } catch (e) {
        console.error("AI Failure", e);
      } finally {
        setLoadingAI(false);
      }
    };

    loadInitialData();
    fetchAI();

    const tickerSub = marketService.subscribeToTicker((newTicker) => {
      setTickerData(prev => {
        const newData = [...prev, newTicker];
        if (newData.length > 50) newData.shift();
        return newData;
      });
      setCurrentPrice(newTicker.price);
    });

    return () => {
      tickerSub.unsubscribe();
    };
  }, []);

  // --- Logic ---
  const handleProcurement = async () => {
    try {
      setIsSubmitting(true);
      await new Promise(resolve => setTimeout(resolve, 1500));

      const totalValue = parseFloat(quantity) * parseFloat(price);
      const fees = totalValue * 0.001;
      const orderId = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      setReceiptData({
        id: orderId,
        type: tradeType,
        quantity,
        price,
        total: totalValue,
        fees,
        timestamp: new Date().toISOString()
      });

      setShowReceipt(true);
      setSliderValue(0);
      setQuantity('0');
    } catch (error: any) {
      toast.error("Procurement failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyStrategy = () => {
    if (!aiRec) return;
    let vol = '1000';
    if (aiRec.recommended_volume_tier.includes('High')) vol = '10000';
    if (aiRec.recommended_volume_tier.includes('Medium')) vol = '5000';

    setQuantity(vol);
    setPrice(aiRec.limit_price_suggestion.toString());
    toast.success(`Strategy Applied: Target @ ₹${aiRec.limit_price_suggestion}`);
  };

  // Slider Logic
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current || isSubmitting) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setSliderValue(percentage);

    if (percentage > 95) {
      setIsDragging(false);
      setSliderValue(100);
      handleProcurement();
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (sliderValue < 95) {
      setSliderValue(0);
    }
  };

  // derived
  const startingPrice = tickerData.length > 0 ? tickerData[0].price : currentPrice;
  const priceChange = currentPrice - startingPrice;
  const priceChangePercent = startingPrice > 0 ? ((priceChange / startingPrice) * 100).toFixed(2) : '0.00';

  // --- Shared Components ---

  const SignalBadge = ({ value }: { value: number }) => {
    let label = "Neutral";
    let color = "text-slate-400 bg-slate-400/10";
    if (value > 80) { label = "Strong Consensus"; color = "text-emerald-400 bg-emerald-400/10 shadow-[0_0_10px_rgba(52,211,153,0.2)]"; }
    else if (value > 50) { label = "Moderate Signal"; color = "text-amber-400 bg-amber-400/10"; }
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider border border-white/5 ${color}`}>
        {label}
      </span>
    );
  };

  const GlobalTicker = () => (
    <div className="w-full bg-black/60 border-b border-white/5 overflow-hidden flex items-center h-8">
      <div className="flex animate-marquee whitespace-nowrap gap-12 text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-2"><span className="text-emerald-500">IND-CCTS</span> ₹{currentPrice.toFixed(2)} ▲ 2.4%</span>
        <span className="flex items-center gap-2"><span className="text-slate-200">EU-ETS</span> €84.20 ▼ 0.1%</span>
        <span className="flex items-center gap-2"><span className="text-slate-200">UK-ETS</span> £72.15 ▲ 0.5%</span>
        <span className="flex items-center gap-2"><span className="text-slate-200">UKA</span> $42.50 ▲ 1.2%</span>
        <span className="flex items-center gap-2"><span className="text-slate-200">CFI (AUS)</span> A$38.90 ▼ 0.8%</span>
      </div>
    </div>
  );

  const MarketStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 bg-slate-900/40 p-2 rounded-lg border border-white/5 backdrop-blur-sm">
      {[
        { label: "OPEN", value: "₹538.00" },
        { label: "HIGH", value: "₹552.40" },
        { label: "LOW", value: "₹536.10" },
        { label: "VOL (24H)", value: "128,400" },
        { label: "VWAP", value: "₹544.20" },
        { label: "SPREAD", value: "₹1.50" }
      ].map(stat => (
        <div key={stat.label} className="flex flex-col px-3 py-1 bg-black/20 rounded border border-white/5">
          <span className="text-[9px] text-slate-500 tracking-widest uppercase">{stat.label}</span>
          <span className="text-xs font-mono text-slate-200">{stat.value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent flex flex-col" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <Helmet>
        <title>{viewDensity === 'owner' ? 'Overview' : 'Terminal'} - Artha OS</title>
      </Helmet>

      {/* --- OFFICER ONLY: GLOBAL TICKER --- */}
      {viewDensity === 'officer' && <GlobalTicker />}

      <div className="max-w-[1920px] px-4 md:px-8 py-6 space-y-6 animate-in fade-in duration-700 flex-1 relative">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="flex items-center gap-4">
            {viewDensity === 'owner' ? (
              // OWNER Header
              <div>
                <h1 className="text-3xl font-light text-white tracking-tight">Liability Procurement</h1>
                <p className="text-slate-400 mt-1 font-light">FY26 Carbon Offset Strategy</p>
              </div>
            ) : (
              // OFFICER Header
              <>
                <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                  <Monitor className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-white tracking-tight uppercase">Procurement Terminal</h1>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-500 font-mono uppercase">Live</span>
                  </div>
                  <div className="flex gap-4 text-xs text-slate-400 font-mono">
                    <span>WS-ID: 8829-X</span>
                    <span>LATENCY: 24ms</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Price Display */}
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest">{viewDensity === 'officer' ? 'Mark Price' : 'Index Price (CCTS)'}</div>
            <div className="flex items-center justify-end gap-3">
              <div className={`font-mono font-medium text-white tracking-tighter ${viewDensity === 'officer' ? 'text-5xl' : 'text-4xl font-light'}`}>₹{currentPrice.toFixed(2)}</div>
              <div className={`text-sm font-medium px-2 py-1 rounded font-mono ${priceChange >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                {priceChange >= 0 ? '▲' : '▼'} {priceChangePercent}%
              </div>
            </div>
          </div>
        </div>

        {/* --- OFFICER ONLY: MARKET STATS --- */}
        {viewDensity === 'officer' && <MarketStats />}

        {/* HERO: CSRO Intelligence (Shared Logic, Different Style) */}
        <div className={`relative group rounded-xl overflow-hidden border border-white/5 backdrop-blur-sm ${viewDensity === 'owner' ? 'bg-slate-900/40 rounded-3xl' : 'bg-slate-900/40'}`}>
          {/* Owner: Aurora / Officer: Dark Conic */}
          {viewDensity === 'owner' ? (
            <>
              <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-1000 bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-emerald-900"></div>
              <div className="absolute -top-[200px] -left-[200px] w-[500px] h-[500px] bg-emerald-500/10 blur-[100px] rounded-full mix-blend-screen animate-pulse"></div>
            </>
          ) : (
            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-1000 bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-emerald-900"></div>
          )}

          <div className={`relative z-10 grid grid-cols-1 md:grid-cols-4 gap-8 items-center ${viewDensity === 'owner' ? 'p-8' : 'p-6'}`}>
            <div className="md:col-span-3 space-y-3">
              <div className="flex items-center gap-3 mb-1">
                <span className={`text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-2 ${viewDensity === 'owner' ? 'text-slate-300' : 'text-indigo-400'}`}>
                  <Command className="w-3 h-3" />
                  {viewDensity === 'owner' ? 'CSRO Intelligence' : 'Strategy Algorithm'}
                </span>
                {aiRec && !loadingAI && <SignalBadge value={aiRec.confidence} />}
              </div>

              {loadingAI ? (
                <div className="h-20 flex items-center gap-3 text-slate-500 animate-pulse">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-mono text-sm">PROCESSING...</span>
                </div>
              ) : aiRec ? (
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className={`font-light text-white leading-tight ${viewDensity === 'owner' ? 'text-3xl md:text-4xl' : 'text-3xl'}`}>
                      {viewDensity === 'officer' && <span className="text-slate-500 font-mono text-xl mr-3">RECOMMENDATION ::</span>}
                      <span className={aiRec.action === 'ACCUMULATE' ? 'font-medium text-emerald-400' : 'font-medium text-amber-400'}>
                        {viewDensity === 'owner'
                          ? (aiRec.action === 'ACCUMULATE' ? 'ACQUIRE & OFFSET' : aiRec.action)
                          : (aiRec.action === 'ACCUMULATE' ? 'STRATEGIC ACQUISITION' : aiRec.action)
                        }
                      </span>
                    </h2>
                    <p className={`mt-2 text-lg font-light leading-relaxed max-w-4xl border-l-2 pl-3 ${viewDensity === 'owner' ? 'text-slate-300 border-white/10' : 'text-slate-400 text-sm font-mono border-indigo-500/30'}`}>
                      {aiRec.strategic_rationale}
                    </p>
                  </div>
                  <button
                    onClick={handleApplyStrategy}
                    className={`hidden md:flex items-center gap-2 px-4 py-2 border rounded text-[10px] font-bold uppercase tracking-widest transition-all ${viewDensity === 'owner'
                        ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/50 text-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                        : 'bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/50 text-indigo-300 hover:text-white'
                      }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {viewDensity === 'owner' ? 'Apply Strategy' : 'EXECUTE_STRATEGY()'}
                  </button>
                </div>
              ) : (
                <div className="text-slate-500">Signal Unavailable</div>
              )}
            </div>

            {/* Metrics */}
            <div className="hidden md:block space-y-4 border-l border-white/5 pl-8">
              <div className={viewDensity === 'owner' ? 'space-y-6' : 'flex justify-between gap-8'}>
                <div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Target Entry</div>
                  <div className={`text-white ${viewDensity === 'owner' ? 'font-mono text-2xl' : 'font-mono text-xl'}`}>₹{aiRec?.limit_price_suggestion || '---'}</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">{viewDensity === 'owner' ? 'Current Gap' : 'Vol Tier'}</div>
                  <div className={`text-slate-300 ${viewDensity === 'owner' ? 'font-mono text-xl' : 'font-mono text-xl'}`}>
                    {viewDensity === 'owner' ? '12,500 MT' : 'Med'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className={`grid grid-cols-1 gap-6 h-full flex-1 ${viewDensity === 'owner' ? 'lg:grid-cols-3 gap-8' : 'lg:grid-cols-12'}`}>

          {/* Chart Section */}
          <div className={`rounded-xl border border-white/5 backdrop-blur-sm p-4 flex flex-col min-h-[500px] ${viewDensity === 'owner' ? 'lg:col-span-2 bg-slate-900/20 rounded-3xl p-6' : 'lg:col-span-8 bg-black/40'
            }`}>
            <div className="flex justify-between items-center mb-6 opacity-70">
              <div className="flex items-center gap-2">
                <BarChart3 className={`w-4 h-4 ${viewDensity === 'officer' ? 'text-emerald-500' : ''}`} />
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{viewDensity === 'owner' ? 'CCTS Market Trend' : 'Price Action'}</span>
              </div>
              {/* TIMEFRAMES */}
              <div className="flex bg-white/5 rounded p-0.5 border border-white/5">
                {['1H', '1D', '1W', '1M', '1Y'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf as any)}
                    className={`px-3 py-1 text-[9px] font-bold font-mono transition-all rounded ${timeframe === tf ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                {viewDensity === 'owner' ? (
                  // OWNER: Area Chart (Pretty)
                  <AreaChart data={tickerData}>
                    <defs>
                      <linearGradient id="colorPriceOwner" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.2} />
                    <XAxis dataKey="timestamp" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(val) => new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} minTickGap={40} />
                    <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(value) => `₹${value}`} width={40} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} itemStyle={{ color: '#e2e8f0', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPriceOwner)" />
                  </AreaChart>
                ) : (
                  // OFFICER: Step Line Chart (Technical)
                  <LineChart data={tickerData}>
                    <defs>
                      <linearGradient id="colorPriceOfficer" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} opacity={0.5} />
                    <XAxis dataKey="timestamp" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#525252', fontFamily: 'monospace' }} tickFormatter={(val) => new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} minTickGap={60} />
                    <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#525252', fontFamily: 'monospace' }} tickFormatter={(value) => `₹${value}`} width={50} orientation="right" />
                    <Tooltip contentStyle={{ backgroundColor: '#000000', border: '1px solid #333', borderRadius: '4px' }} itemStyle={{ color: '#e2e8f0', fontSize: '11px', fontFamily: 'monospace' }} cursor={{ stroke: '#333', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Line type="step" dataKey="price" stroke="#10b981" strokeWidth={1.5} dot={false} fill="url(#colorPriceOfficer)" />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Procurement Form */}
          <div className={`rounded-xl border border-white/5 backdrop-blur-sm flex flex-col ${viewDensity === 'owner' ? 'bg-slate-900/40 rounded-3xl p-1' : 'lg:col-span-4 bg-black/40'}`}>
            <div className={`flex justify-between items-center ${viewDensity === 'owner' ? 'hidden' : 'p-4 border-b border-white/5 bg-white/[0.02]'}`}>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Entry</span>
              <div className="flex gap-2">
                <span className="text-[9px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">CONNECTED</span>
              </div>
            </div>

            <div className="flex-1 p-6 space-y-6">

              {/* Mode Toggle UI (Redundant but Styled) */}
              <div className={`grid grid-cols-2 gap-px rounded overflow-hidden ${viewDensity === 'owner' ? 'gap-1 p-1 bg-black/20 rounded-xl' : 'bg-white/10 p-px'}`}>
                {['buy', 'sell'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setTradeType(mode as any)}
                    className={`text-[10px] font-bold uppercase tracking-widest transition-all ${viewDensity === 'owner'
                        ? `py-2.5 rounded-lg ${tradeType === mode ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`
                        : `py-3 ${tradeType === mode ? (mode === 'buy' ? 'bg-emerald-900/80 text-emerald-100' : 'bg-rose-900/80 text-rose-100') : 'bg-black/40 text-slate-500 hover:bg-white/5'}`
                      }`}
                  >
                    {mode === 'buy' ? (viewDensity === 'owner' ? 'Acquire (Offset)' : 'Acquire') : (viewDensity === 'owner' ? 'Liquidate (Surplus)' : 'Liquidate')}
                  </button>
                ))}
              </div>

              {/* Inputs */}
              <div className={viewDensity === 'owner' ? 'space-y-4' : 'space-y-6'}>
                <div className="group">
                  {viewDensity === 'officer' && (
                    <div className="flex justify-between mb-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest group-focus-within:text-emerald-500 transition-colors">Volume (MT)</label>
                      <span className="text-[9px] text-slate-600 font-mono">AVAIL: ∞</span>
                    </div>
                  )}
                  <div className="relative">
                    <label className={viewDensity === 'owner' ? 'text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block' : 'hidden'}>Volume (MTCO2e)</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className={`w-full bg-transparent text-white focus:outline-none focus:border-emerald-500/50 transition-colors font-mono placeholder-slate-800 ${viewDensity === 'owner'
                          ? 'border-b border-white/10 py-3 text-2xl font-light'
                          : 'bg-black/40 border border-white/10 rounded px-4 py-3 text-right text-xl focus:ring-1 focus:ring-emerald-500/20'
                        }`}
                      placeholder={viewDensity === 'owner' ? "0" : "0.00"}
                    />
                    {viewDensity === 'officer' && <span className="absolute left-4 top-4 text-xs text-slate-600 font-mono pointer-events-none">QTY</span>}
                  </div>

                  {/* Preset Buttons for easy access */}
                  <div className={`flex gap-2 mt-2 ${viewDensity === 'officer' && 'justify-end'}`}>
                    {[1000, 5000, 10000].map(val => (
                      <button
                        key={val}
                        onClick={() => setQuantity(val.toString())}
                        className={`text-[9px] px-2 rounded font-mono border border-white/5 transition-colors ${viewDensity === 'owner'
                            ? 'py-1 bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full'
                            : 'py-0.5 bg-white/5 hover:bg-white/10 text-slate-400'
                          }`}
                      >
                        +{val >= 1000 ? `${val / 1000}k` : val}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="group">
                  {viewDensity === 'officer' && (
                    <div className="flex justify-between mb-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest group-focus-within:text-emerald-500 transition-colors">Limit Price</label>
                      <div className="flex gap-2"><span className="text-[9px] text-slate-600 font-mono">MKT: ₹{currentPrice.toFixed(2)}</span></div>
                    </div>
                  )}
                  <div className={viewDensity === 'owner' ? 'pt-2' : 'relative'}>
                    <label className={viewDensity === 'owner' ? 'text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block' : 'hidden'}>Limit Price (INR)</label>

                    {viewDensity === 'owner' ? (
                      <div className="flex items-baseline justify-between border-b border-white/10 py-3">
                        <input
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="bg-transparent text-xl font-light text-white focus:outline-none w-32 font-mono"
                        />
                        <div className="text-right">
                          <span className="text-slate-500 text-xs mr-2">Market:</span>
                          <span className="text-emerald-500 text-xs font-mono cursor-pointer hover:underline" onClick={() => setPrice(currentPrice.toFixed(2))}>
                            ₹{currentPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <input
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded px-4 py-3 text-right font-mono text-xl text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder-slate-800"
                        />
                        <span className="absolute left-4 top-4 text-xs text-slate-600 font-mono pointer-events-none">LMT</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Calculations */}
                <div className={`p-4 space-y-1 ${viewDensity === 'owner' ? 'bg-emerald-500/5 rounded-xl border border-emerald-500/10' : 'bg-white/[0.02] rounded border border-white/5'}`}>
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-500 uppercase">Gross</span>
                    <span className={viewDensity === 'owner' ? 'text-white' : 'text-slate-300'}>₹{(parseFloat(quantity || '0') * parseFloat(price || '0')).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-500 uppercase">Fees (0.1%)</span>
                    <span className="text-slate-500">₹{((parseFloat(quantity || '0') * parseFloat(price || '0')) * 0.001).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  {viewDensity === 'officer' && (
                    <div className="border-t border-white/5 pt-2 mt-2 flex justify-between text-xs font-mono font-bold">
                      <span className="text-slate-400 uppercase">Net Total</span>
                      <span className="text-emerald-400">₹{((parseFloat(quantity || '0') * parseFloat(price || '0')) * 1.001).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Slider Action */}
            <div className={viewDensity === 'owner' ? 'p-2 mt-auto' : 'p-4 mt-auto border-t border-white/5 bg-white/[0.02]'}>
              <div
                className={`relative rounded overflow-hidden cursor-pointer select-none group ${viewDensity === 'owner'
                    ? 'h-14 bg-black/40 border border-white/5 rounded-2xl'
                    : 'h-12 bg-black border border-white/10'
                  }`}
                onMouseDown={() => !isSubmitting && setIsDragging(true)}
                ref={sliderRef}
              >
                {/* Track Background */}
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-75 ease-out ${viewDensity === 'owner'
                      ? 'bg-emerald-600/20'
                      : (tradeType === 'buy' ? 'bg-emerald-900/50' : 'bg-rose-900/50')
                    }`}
                  style={{ width: `${sliderValue}%` }}
                ></div>

                {/* Text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <span className={`font-bold uppercase transition-opacity duration-300 ${isSubmitting ? 'opacity-0' : 'opacity-100'} ${sliderValue > 50 ? 'text-white' : 'text-slate-500'} ${viewDensity === 'owner' ? 'text-xs tracking-widest' : 'text-[10px] tracking-[0.2em]'}`}>
                    {isSubmitting ? '' : (viewDensity === 'owner' ? 'Slide to Confirm' : 'SLIDE TO EXECUTE')}
                  </span>
                </div>

                {/* Loader */}
                {isSubmitting && (
                  <div className="absolute inset-0 flex items-center justify-center z-30">
                    <Loader2 className={`animate-spin ${viewDensity === 'owner' ? 'w-5 h-5 text-emerald-500' : 'w-4 h-4 text-white'}`} />
                  </div>
                )}

                {/* Handle */}
                {!isSubmitting && (
                  <div
                    className={`absolute top-0.5 bottom-0.5 w-12 flex items-center justify-center transition-all duration-75 ease-out z-30 ${viewDensity === 'owner'
                        ? 'bg-emerald-500 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] inset-y-1'
                        : `rounded shadow-lg border border-white/10 ${tradeType === 'buy' ? 'bg-emerald-600' : 'bg-rose-600'}`
                      }`}
                    style={{ left: `calc(${sliderValue}% - ${sliderValue > 90 ? 48 : 0}px)` }}
                  >
                    <ChevronRight className={`text-white ${viewDensity === 'owner' ? 'w-5 h-5' : 'w-4 h-4'}`} />
                  </div>
                )}
              </div>
              {viewDensity === 'officer' && (
                <div className="text-center mt-3 text-[9px] text-slate-600 font-mono flex justify-center gap-4">
                  <span>[ALT+A] ACQUIRE</span>
                  <span>[ALT+L] LIQUIDATE</span>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* SHARED: RECEIPT MODAL */}
      {showReceipt && receiptData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowReceipt(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <Check className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-light text-white">{viewDensity === 'owner' ? 'Procurement Successful' : 'Execution Confirmed'}</h2>
              <p className="text-slate-400 text-sm mt-1">Order #{receiptData.id}</p>
            </div>
            <div className="space-y-4 border-t border-b border-white/5 py-6 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{viewDensity === 'owner' ? 'Action' : 'Side'}</span>
                <span className="text-white font-medium uppercase font-mono">{receiptData.type === 'buy' ? 'Acquire' : 'Liquidate'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Volume</span>
                <span className="text-white font-mono">{parseFloat(receiptData.quantity).toLocaleString()} MT</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{viewDensity === 'owner' ? 'Limit Price' : 'Avg Price'}</span>
                <span className="text-white font-mono">₹{parseFloat(receiptData.price).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-white/5">
                <span className="text-slate-500">Settlement</span>
                <span className="text-emerald-400 font-mono">T+2</span>
              </div>
            </div>
            <button
              onClick={() => setShowReceipt(false)}
              className="w-full py-3 bg-white text-black font-medium rounded-lg hover:bg-slate-200 transition-colors mb-3"
            >
              {viewDensity === 'owner' ? 'Done' : 'Acknowledge'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
