import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  TreeDeciduous,
  Leaf,
  Droplets,
  Sun,
  TrendingUp,
  Coins,
  Award,
  FileCheck,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AISuggestionBanner } from '@/components/shared/AISuggestionBanner';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Progress } from '@/components/ui/progress';
import { useGreenDashboard } from '@/hooks/useGreenDashboard';

export default function GreenDashboard() {
  const { isSimpleView } = useWorkspace();
  const { impact, offsetHistory, verifications, registry, isLoading } = useGreenDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const impactStats = [
    { label: 'Trees Planted', value: impact?.trees_planted?.toLocaleString() || '0', icon: TreeDeciduous, color: 'text-green-primary', bgColor: 'bg-green-primary-light' },
    { label: 'CO2 Offset', value: `${impact?.co2_offset?.toLocaleString() || '0'} t`, icon: Leaf, color: 'text-green-accent', bgColor: 'bg-green-accent-light' },
    { label: 'Water Saved', value: `${impact?.water_saved?.toLocaleString() || '0'} L`, icon: Droplets, color: 'text-blue-500', bgColor: 'bg-blue-50' },
    { label: 'Clean Energy', value: `${impact?.clean_energy?.toLocaleString() || '0'} MWh`, icon: Sun, color: 'text-green-solar', bgColor: 'bg-amber-50' },
  ];

  return (
    <>
      <Helmet>
        <title>Green Dashboard - CarbonBook Enterprise</title>
        <meta name="description" content="View your environmental impact, green credits balance, and offset velocity with the GreenBook impact dashboard." />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        <AISuggestionBanner
          type="suggestion"
          message={isSimpleView
            ? `PR Insight: Your solar investment generated ${impact?.media_value || '₹0'} media value. Share your impact story!`
            : "Verification Alert: 2 projects pending VCS audit. Deadline: Feb 15, 2025."
          }
          action={isSimpleView ? "Create Report" : "Schedule Audit"}
        />

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            {isSimpleView ? 'Impact Dashboard' : 'Green Portfolio Operations'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isSimpleView ? 'Your environmental contribution & brand impact' : 'Project verification, registry sync & compliance tracking'}
          </p>
        </div>

        {isSimpleView ? (
          // OWNER VIEW: PR/Brand focus
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            <div className="lg:col-span-7 space-y-6">
              {/* Total Impact Card */}
              <div
                className="carbon-card p-8 relative overflow-hidden contour-pattern"
              >
                <div className="relative z-10">
                  <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Total Environmental Impact
                  </h2>
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-5xl font-bold text-green-primary">+{impact?.trees_planted?.toLocaleString() || '0'}</span>
                    <span className="text-xl text-green-primary font-medium">Trees</span>
                  </div>
                  <p className="text-muted-foreground">Equivalent to offsetting {impact?.co2_offset?.toLocaleString() || '0'} tonnes of CO2</p>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10">
                  <TreeDeciduous className="w-full h-full text-green-primary" />
                </div>
              </div>

              {/* Impact Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {impactStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="carbon-card p-4"
                    >
                      <div className={`w-10 h-10 rounded-xl ${stat.bgColor} dark:bg-opacity-20 flex items-center justify-center mb-3`}>
                        <Icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <p className="text-2xl font-bold text-foreground font-mono">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Offset Velocity Chart */}
              <div
                className="carbon-card p-6"
              >
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-green-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Offset Velocity</h2>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={offsetHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={(value) => `${value}t`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '12px',
                          fontSize: '12px',
                          color: 'hsl(var(--foreground))'
                        }}
                        formatter={(value: number) => [`${value} tonnes CO2`, 'Offset']}
                      />
                      <Bar
                        dataKey="offset_value"
                        fill="hsl(158, 64%, 42%)"
                        radius={[8, 8, 0, 0]}
                        isAnimationActive={true}
                        animationDuration={1200}
                        animationEasing="ease-out"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Sidebar: Brand Metrics */}
            <div className="lg:col-span-3 space-y-6">
              {/* Green Credits Balance */}
              <div
                className="rounded-2xl p-6 text-white relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, hsl(158, 64%, 42%) 0%, hsl(142, 76%, 36%) 100%)' }}
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Coins className="w-5 h-5 text-white/80" />
                    <span className="text-sm font-medium text-white/80">Green Credits</span>
                  </div>
                  <p className="text-4xl font-bold font-mono mb-2">20,000</p>
                  <p className="text-sm text-white/70">G-Credits Balance</p>
                  <div className="mt-6 pt-4 border-t border-white/20">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">This Month</span>
                      <span className="font-mono font-medium">+2,400</span>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-8 -bottom-8 opacity-10">
                  <Leaf className="w-32 h-32" />
                </div>
              </div>

              {/* Brand Metrics */}
              <div
                className="carbon-card p-6"
              >
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                  Brand Impact
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">CSR Rating</span>
                    <span className="text-2xl font-bold text-emerald-400">{impact?.csr_rating || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Media Value Generated</span>
                    <span className="font-mono font-medium text-foreground">{impact?.media_value || '₹0'}</span>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Certifications</p>
                    <div className="flex flex-wrap gap-2">
                      {impact?.certifications?.map((cert) => (
                        <span key={cert} className="pill-success">
                          {cert}
                        </span>
                      )) || <span className="text-xs text-muted-foreground">None</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div
                className="carbon-card p-6"
              >
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button className="w-full py-3 px-4 rounded-xl bg-green-primary text-white font-medium text-sm hover:bg-green-primary/90 transition-colors flex items-center justify-center gap-2">
                    <Award className="w-4 h-4" />
                    Generate Impact Report
                  </button>
                  <button className="w-full py-3 px-4 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-accent transition-colors flex items-center justify-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Share on LinkedIn
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // OFFICER VIEW: Verification & Technical focus
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            <div className="lg:col-span-7 space-y-6">
              {/* Project Verifications */}
              <div
                className="carbon-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-green-primary" />
                    Project Verification Status
                  </h2>
                  <span className="text-xs text-muted-foreground font-mono">
                    {verifications.filter(p => p.status === 'verified').length}/{verifications.length} verified
                  </span>
                </div>
                <div className="space-y-3">
                  {verifications.map((project, index) => (
                    <div
                      key={project.project_name}
                      className="p-4 rounded-lg bg-muted/30 dark:bg-slate-800/50 border border-border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {project.status === 'verified' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          {project.status === 'pending' && <Clock className="w-4 h-4 text-amber-400" />}
                          {project.status === 'in_review' && <AlertCircle className="w-4 h-4 text-blue-400" />}
                          <div>
                            <p className="font-medium text-foreground">{project.project_name}</p>
                            <p className="text-xs text-muted-foreground">Vintage: {project.vintage} • Auditor: {project.auditor}</p>
                          </div>
                        </div>
                        <span className={`${project.status === 'verified' ? 'pill-success' :
                            project.status === 'pending' ? 'pill-warning' :
                              'pill-info'
                          }`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Credits: <span className="font-mono text-foreground">{project.credits.toLocaleString()}</span></span>
                        <span className="text-muted-foreground">Last Audit: {project.last_audit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Registry Reconciliation */}
              <div
                className="carbon-card p-6"
              >
                <h2 className="text-lg font-semibold text-foreground mb-4">Registry Reconciliation</h2>
                <div className="space-y-3">
                  {registry.map((reg) => (
                    <div key={reg.registry_name} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 dark:bg-slate-800/50 border border-border">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${reg.status === 'synced' ? 'bg-emerald-400' : 'bg-amber-400'
                          }`} />
                        <div>
                          <p className="font-medium text-foreground">{reg.registry_name}</p>
                          <p className="text-xs text-muted-foreground">Last sync: {reg.last_sync ? new Date(reg.last_sync).toLocaleString() : 'N/A'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-medium text-foreground">{reg.credits.toLocaleString()}</p>
                        <span className={`text-xs ${reg.status === 'synced' ? 'text-emerald-400' : 'text-amber-300'
                          }`}>
                          {reg.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-3 space-y-6">
              {/* Portfolio Summary */}
              <div className="carbon-card p-6">
                <h3 className="text-sm font-semibold mb-4 text-foreground">Portfolio Summary</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Total Credits</span>
                      <span className="font-mono font-medium text-foreground">62,060</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Verified</span>
                      <span className="font-mono font-medium text-emerald-400">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Verification Pipeline</p>
                    <div className="relative">
                      {/* Progress Line */}
                      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-700 -z-0 transform -translate-y-1/2" />
                      <div className="flex justify-between relative z-10">
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-[10px] mt-1 text-muted-foreground">Submit</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-[10px] mt-1 text-muted-foreground">Review</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center animate-pulse">
                            <Clock className="w-4 h-4 text-slate-900" />
                          </div>
                          <span className="text-[10px] mt-1 text-muted-foreground">Audit</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
                            <FileCheck className="w-4 h-4 text-slate-400" />
                          </div>
                          <span className="text-[10px] mt-1 text-muted-foreground">Issue</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance Alerts */}
              <div
                className="carbon-card p-6"
              >
                <h3 className="text-sm font-semibold mb-4 text-foreground">Compliance Alerts</h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                    <p className="text-xs font-medium text-rose-400">VCS Audit Overdue</p>
                    <p className="text-xs text-muted-foreground mt-1">Sundarbans Mangrove - 15 days</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-400/10 border border-amber-400/20">
                    <p className="text-xs font-medium text-amber-300">Registry Sync Pending</p>
                    <p className="text-xs text-muted-foreground mt-1">Indian Carbon Registry - 24hrs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
