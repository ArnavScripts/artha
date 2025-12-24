import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  TreeDeciduous,
  Sun,
  Droplets,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AISuggestionBanner } from '@/components/shared/AISuggestionBanner';

const portfolioAssets = [
  {
    id: 1,
    name: 'Adani Solar Park',
    type: 'Solar',
    credits: 5000,
    value: 2250000,
    change: 12.5,
    status: 'Active',
    vintage: '2024',
    icon: Sun,
    color: 'bg-green-solar'
  },
  {
    id: 2,
    name: 'Sundarbans Mangrove',
    type: 'Blue Carbon',
    credits: 3500,
    value: 1925000,
    change: 8.2,
    status: 'Active',
    vintage: '2024',
    icon: Droplets,
    color: 'bg-carbon-tech'
  },
  {
    id: 3,
    name: 'Western Ghats Reforestation',
    type: 'Forestry',
    credits: 8000,
    value: 3600000,
    change: -2.1,
    status: 'Pending Verification',
    vintage: '2023',
    icon: TreeDeciduous,
    color: 'bg-green-primary'
  },
];

const allocationData = [
  { name: 'Solar', value: 30, color: 'hsl(38, 92%, 50%)' },
  { name: 'Blue Carbon', value: 21, color: 'hsl(217, 91%, 60%)' },
  { name: 'Forestry', value: 49, color: 'hsl(158, 64%, 42%)' },
];

export default function GreenPortfolio() {
  const totalValue = portfolioAssets.reduce((sum, asset) => sum + asset.value, 0);
  const totalCredits = portfolioAssets.reduce((sum, asset) => sum + asset.credits, 0);

  return (
    <>
      <Helmet>
        <title>Green Portfolio | GreenBook</title>
        <meta name="description" content="Manage your green asset portfolio and carbon credits" />
      </Helmet>

      <div className="min-h-screen bg-background p-6">
        <div
          className="max-w-7xl mx-auto space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground flex items-center gap-3">
                <Wallet className="w-7 h-7 text-green-primary" />
                Green Portfolio
              </h1>
              <p className="text-muted-foreground mt-1">Your Sustainable Asset Holdings</p>
            </div>
            <Button className="bg-green-primary hover:bg-green-primary/90">
              <TrendingUp className="w-4 h-4 mr-2" />
              Add Investment
            </Button>
          </div>

          <AISuggestionBanner 
            message="Portfolio diversification tip: Consider adding Blue Carbon assets for better risk-adjusted returns."
            type="success"
          />

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="green-card p-6 contour-pattern">
              <p className="text-sm text-muted-foreground mb-1">Total Portfolio Value</p>
              <p className="text-3xl font-bold font-mono text-green-primary">
                ₹{(totalValue / 100000).toFixed(1)}L
              </p>
              <div className="flex items-center gap-1 mt-2 text-carbon-success">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-medium">+6.8% this month</span>
              </div>
            </div>

            <div className="green-card p-6">
              <p className="text-sm text-muted-foreground mb-1">Total Credits</p>
              <p className="text-3xl font-bold font-mono text-foreground">
                {totalCredits.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Across {portfolioAssets.length} projects
              </p>
            </div>

            <div className="green-card p-6">
              <p className="text-sm text-muted-foreground mb-2">Allocation</p>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={40}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {allocationData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Asset List */}
          <div className="green-card p-6">
            <h2 className="text-lg font-semibold mb-4">Holdings</h2>
            <div className="space-y-4">
              {portfolioAssets.map((asset, index) => {
                const Icon = asset.icon;
                return (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${asset.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{asset.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {asset.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Vintage {asset.vintage}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-semibold text-foreground">
                        ₹{(asset.value / 100000).toFixed(2)}L
                      </p>
                      <div className={`flex items-center justify-end gap-1 text-sm ${
                        asset.change >= 0 ? 'text-carbon-success' : 'text-carbon-risk'
                      }`}>
                        {asset.change >= 0 
                          ? <ArrowUpRight className="w-3 h-3" /> 
                          : <ArrowDownRight className="w-3 h-3" />
                        }
                        <span className="font-mono">{Math.abs(asset.change)}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {asset.credits.toLocaleString()} credits
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}