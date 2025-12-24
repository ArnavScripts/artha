import { Helmet } from 'react-helmet-async';
import { motion, Variants, Easing } from 'framer-motion';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  FileCheck,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { NetComplianceLiability } from '@/components/carbon/NetComplianceLiability';
import { CostForecastChart } from '@/components/carbon/CostForecastChart';
import { CarbonWallet } from '@/components/carbon/CarbonWallet';
import { AITradeTicket } from '@/components/carbon/AITradeTicket';
import { AISuggestionBanner } from '@/components/shared/AISuggestionBanner';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Progress } from '@/components/ui/progress';
import { useDashboard } from '@/hooks/useDashboard';
import { useAI } from '@/hooks/useAI';
import { DashboardSkeleton } from '@/components/loading/DashboardSkeleton';
import { toast } from 'sonner';

// Stagger animation variants - snappy timing
const snappyEase: Easing = [0.32, 0.72, 0, 1];

const containerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.15,
      ease: snappyEase,
    },
  },
};

const sidebarItemVariants: Variants = {
  hidden: { opacity: 0, x: 8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.15,
      ease: snappyEase,
    },
  },
};

export default function CarbonDashboard() {
  const { isSimpleView } = useWorkspace();
  const { checklist, audits, dataGaps, isLoading } = useDashboard();
  const { getTradeRecommendation, isAnalyzingTrade } = useAI();

  const handleAutoHedge = () => {
    toast.info("AI Analyst is analyzing market conditions...");
    getTradeRecommendation(
      { portfolioId: 'demo-portfolio', context: 'rising carbon prices' },
      {
        onSuccess: (data) => {
          toast.success(`AI Recommendation: ${data.action} ${data.quantity} credits @ ₹${data.price_per_unit}`, {
            description: data.rationale,
            duration: 5000,
          });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto mt-8">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Carbon Dashboard - CarbonBook Enterprise</title>
        <meta name="description" content="Monitor your carbon compliance liability, cost forecasts, and manage your carbon wallet with AI-powered trading recommendations." />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        <AISuggestionBanner
          type="warning"
          message={isSimpleView
            ? "Warning: Carbon price rising. Auto-hedge recommended to save ₹4.2L this quarter."
            : "Alert: 3 data gaps detected. Audit deadline in 5 days. Immediate action required."
          }
          action={isSimpleView ? "Enable Auto-Hedge" : "View Data Gaps"}
          onAction={isSimpleView ? handleAutoHedge : undefined}
          isLoading={isAnalyzingTrade}
        />

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            {isSimpleView ? 'CFO Dashboard' : 'Compliance Operations'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isSimpleView ? 'Real-time carbon compliance overview' : 'Audit tracking, data quality & regulatory compliance'}
          </p>
        </div>

        {isSimpleView ? (
          // OWNER VIEW: Financial focus with staggered entry
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-10 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Main content - Hero cards first */}
            <motion.div
              className="lg:col-span-7 space-y-6"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants}>
                <NetComplianceLiability />
              </motion.div>
              <motion.div variants={itemVariants}>
                <CostForecastChart />
              </motion.div>
            </motion.div>

            {/* Sidebar - appears 100ms later */}
            <motion.div
              className="lg:col-span-3 space-y-6"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05,
                    delayChildren: 0.08,
                  },
                },
              }}
            >
              <motion.div variants={sidebarItemVariants}>
                <CarbonWallet />
              </motion.div>
              <motion.div variants={sidebarItemVariants}>
                <AITradeTicket />
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          // OFFICER VIEW: Compliance & Technical focus
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Compliance Checklist */}
              <div
                className="glass-panel p-6 rounded-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                    <FileCheck className="w-5 h-5 text-carbon-tech" />
                    Compliance Checklist
                  </h2>
                  <span className="text-xs text-muted-foreground font-mono">
                    {checklist.filter(c => c.status === 'pending' || c.status === 'in_progress').length} pending tasks
                  </span>
                </div>
                <div className="space-y-3">
                  {checklist.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border hover:bg-muted/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {item.status === 'scheduled' && <CheckCircle2 className="w-4 h-4 text-carbon-success" />}
                        {item.status === 'in_progress' && <Clock className="w-4 h-4 text-carbon-tech" />}
                        {item.status === 'pending' && <AlertCircle className="w-4 h-4 text-carbon-warning" />}
                        {item.status === 'not_started' && <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />}
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.task}</p>
                          <p className="text-xs text-muted-foreground">Due: {item.due_date}</p>
                        </div>
                      </div>
                      <span className={
                        item.priority === 'high' ? 'pill-risk' :
                          item.priority === 'medium' ? 'pill-warning' :
                            'pill-info'
                      }>
                        {item.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Audits */}
              <div
                className="glass-panel p-6 rounded-2xl"
              >
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-foreground">
                  <Calendar className="w-5 h-5 text-carbon-tech" />
                  Upcoming Audit Dates
                </h2>
                <div className="space-y-3">
                  {audits.map((audit, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/40 border border-border"
                    >
                      <div>
                        <p className="font-medium text-foreground">{audit.name}</p>
                        <p className="text-sm text-muted-foreground">{audit.auditor}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm text-foreground">{audit.date}</p>
                        <span className={
                          audit.type === 'Mandatory' ? 'pill-risk' :
                            audit.type === 'Voluntary' ? 'pill-success' :
                              'pill-info'
                        }>
                          {audit.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar: Data Gaps & Quick Stats */}
            <div className="lg:col-span-3 space-y-6">
              {/* Data Gaps Alert */}
              <div
                className="glass-panel p-6 rounded-2xl border-l-4 border-l-carbon-risk"
              >
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-4 text-foreground">
                  <AlertTriangle className="w-4 h-4 text-carbon-risk" />
                  Data Gaps Detected
                </h3>
                <div className="space-y-3">
                  {dataGaps.map((gap, index) => (
                    <div key={index} className="p-3 rounded-lg bg-muted/40 border border-border">
                      <p className="text-sm font-medium text-foreground">{gap.source}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">Last: {gap.last_update ? new Date(gap.last_update).toLocaleDateString() : 'N/A'}</span>
                        <span className={`w-2 h-2 rounded-full ${gap.severity === 'critical' ? 'bg-carbon-risk' : 'bg-carbon-warning'
                          }`} />
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 flex items-center justify-center gap-2 py-2 text-sm font-medium text-carbon-tech hover:underline">
                  Fix Data Gaps
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Compliance Score */}
              <div
                className="glass-panel p-6 rounded-2xl"
              >
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Compliance Score</h3>
                <div className="text-center mb-4">
                  <span className="text-4xl font-mono font-bold text-carbon-warning drop-shadow-md">72%</span>
                  <p className="text-xs text-muted-foreground mt-1">Action Required</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1 text-muted-foreground">
                      <span>Data Quality</span>
                      <span className="font-mono text-foreground">85%</span>
                    </div>
                    <Progress value={85} className="h-1.5 bg-muted" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1 text-muted-foreground">
                      <span>CCTS Readiness</span>
                      <span className="font-mono text-foreground">65%</span>
                    </div>
                    <Progress value={65} className="h-1.5 bg-muted [&>div]:bg-carbon-warning" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1 text-muted-foreground">
                      <span>Audit Preparation</span>
                      <span className="font-mono text-foreground">58%</span>
                    </div>
                    <Progress value={58} className="h-1.5 bg-muted [&>div]:bg-carbon-risk" />
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
