import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowRight,
  Clock,
  BarChart3
} from 'lucide-react';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const priceData = [
  { time: '09:00', price: 575, volume: 12400 },
  { time: '09:30', price: 578, volume: 15600 },
  { time: '10:00', price: 572, volume: 18200 },
  { time: '10:30', price: 580, volume: 22100 },
  { time: '11:00', price: 585, volume: 19800 },
  { time: '11:30', price: 582, volume: 16400 },
  { time: '12:00', price: 588, volume: 21300 },
  { time: '12:30', price: 592, volume: 25600 },
  { time: '13:00', price: 590, volume: 23400 },
  { time: '13:30', price: 595, volume: 28100 },
  { time: '14:00', price: 598, volume: 31200 },
  { time: '14:30', price: 594, volume: 27800 },
];

const orderBook = {
  bids: [
    { price: 593.50, quantity: 1250, total: 741875 },
    { price: 593.00, quantity: 890, total: 527770 },
    { price: 592.50, quantity: 2100, total: 1244250 },
    { price: 592.00, quantity: 1560, total: 923520 },
    { price: 591.50, quantity: 3200, total: 1892800 },
  ],
  asks: [
    { price: 594.00, quantity: 1100, total: 653400 },
    { price: 594.50, quantity: 780, total: 463710 },
    { price: 595.00, quantity: 1890, total: 1124550 },
    { price: 595.50, quantity: 2340, total: 1393470 },
    { price: 596.00, quantity: 1670, total: 995320 },
  ],
};

export default function CarbonMarket() {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('1000');
  const [price, setPrice] = useState('594.00');

  const currentPrice = priceData[priceData.length - 1].price;
  const priceChange = currentPrice - priceData[0].price;
  const priceChangePercent = ((priceChange / priceData[0].price) * 100).toFixed(2);

  return (
    <>
      <Helmet>
        <title>Carbon Market - CarbonBook Enterprise</title>
        <meta name="description" content="Trade carbon credits on the IND-CCC exchange with real-time market data and order book." />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Carbon Market</h1>
          <p className="text-muted-foreground mt-1">IND-CCC Exchange Terminal</p>
        </div>

        {/* Price Header */}
        <div
          className="carbon-card p-4 mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">IND-CCC</p>
              <p className="text-3xl font-bold font-mono">₹{currentPrice.toFixed(2)}</p>
            </div>
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border ${priceChange >= 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'}`}>
              {priceChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="font-mono font-medium">
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent}%)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Market Open</span>
            <span className="w-2 h-2 rounded-full bg-carbon-success animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Chart + Order Book - Left 70% */}
          <div className="lg:col-span-7 space-y-6">
            {/* Price Chart */}
            <div className="carbon-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Price Chart</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      domain={['dataMin - 5', 'dataMax + 5']}
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Price']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke={priceChange >= 0 ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)'} 
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={true}
                      animationDuration={1500}
                      animationEasing="ease-in-out"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Order Book */}
            <div className="carbon-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <span className="text-sm font-medium">Order Book</span>
              </div>
              <div className="grid grid-cols-2 divide-x divide-border">
                {/* Bids */}
                <div>
                  <div className="grid grid-cols-3 gap-4 px-4 py-2 text-xs text-muted-foreground uppercase border-b border-border bg-emerald-500/10">
                    <span>Price (₹)</span>
                    <span className="text-right">Qty</span>
                    <span className="text-right">Total</span>
                  </div>
                  {orderBook.bids.map((bid, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 px-4 py-2 terminal-row font-mono text-sm">
                      <span className="text-carbon-success">{bid.price.toFixed(2)}</span>
                      <span className="text-right">{bid.quantity.toLocaleString()}</span>
                      <span className="text-right text-muted-foreground">{(bid.total / 100000).toFixed(1)}L</span>
                    </div>
                  ))}
                </div>
                {/* Asks */}
                <div>
                  <div className="grid grid-cols-3 gap-4 px-4 py-2 text-xs text-muted-foreground uppercase border-b border-border bg-rose-500/10">
                    <span>Price (₹)</span>
                    <span className="text-right">Qty</span>
                    <span className="text-right">Total</span>
                  </div>
                  {orderBook.asks.map((ask, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 px-4 py-2 terminal-row font-mono text-sm">
                      <span className="text-carbon-risk">{ask.price.toFixed(2)}</span>
                      <span className="text-right">{ask.quantity.toLocaleString()}</span>
                      <span className="text-right text-muted-foreground">{(ask.total / 100000).toFixed(1)}L</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Trade Form - Right 30% */}
          <div className="lg:col-span-3">
            <div
              className="carbon-card p-6"
            >
              <h3 className="text-sm font-medium mb-4">Quick Trade</h3>
              
              {/* Trade Type Toggle */}
              <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-secondary rounded-lg">
                <button
                  onClick={() => setTradeType('buy')}
                  className={`py-2.5 rounded-md text-sm font-medium transition-colors ${
                    tradeType === 'buy' 
                      ? 'bg-carbon-success text-white' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setTradeType('sell')}
                  className={`py-2.5 rounded-md text-sm font-medium transition-colors ${
                    tradeType === 'sell' 
                      ? 'bg-carbon-risk text-white' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Sell
                </button>
              </div>

              {/* Quantity */}
              <div className="mb-4">
                <label className="text-sm text-muted-foreground mb-2 block">Quantity (Credits)</label>
                <input
                  type="text"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background font-mono text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Price */}
              <div className="mb-6">
                <label className="text-sm text-muted-foreground mb-2 block">Price (₹/Credit)</label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background font-mono text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Order Summary */}
              <div className="p-4 bg-secondary rounded-lg mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Order Value</span>
                  <span className="font-mono font-medium">
                    ₹{(parseFloat(quantity || '0') * parseFloat(price || '0')).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fee (0.5%)</span>
                  <span className="font-mono font-medium">
                    ₹{((parseFloat(quantity || '0') * parseFloat(price || '0')) * 0.005).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Execute Button */}
              <button
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-lg font-medium text-white ${
                  tradeType === 'buy' ? 'bg-carbon-success hover:bg-carbon-success/90' : 'bg-carbon-risk hover:bg-carbon-risk/90'
                } transition-colors`}
              >
                <span>{tradeType === 'buy' ? 'Buy Credits' : 'Sell Credits'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
