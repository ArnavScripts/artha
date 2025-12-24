import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Globe, 
  Shield, 
  Download, 
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';

const reportCards = [
  {
    id: 'brsr',
    title: 'SEBI BRSR Report',
    description: 'Business Responsibility and Sustainability Report for FY 2023-24',
    icon: FileText,
    status: 'ready',
    action: 'Generate PDF',
    color: 'bg-primary',
  },
  {
    id: 'cbam',
    title: 'CBAM Declaration',
    description: 'Carbon Border Adjustment Mechanism declaration for EU exports',
    icon: Globe,
    status: 'pending',
    action: 'Start Audit',
    color: 'bg-carbon-warning',
  },
  {
    id: 'audit',
    title: 'Audit Trail',
    description: 'Complete audit log of all emissions data and modifications',
    icon: Shield,
    status: 'ready',
    action: 'Download Log',
    color: 'bg-carbon-success',
  },
];

const complianceTimeline = [
  { date: 'Jan 15, 2024', event: 'Q4 Emissions Report Submitted', status: 'complete' },
  { date: 'Jan 10, 2024', event: 'CBAM Data Collection Started', status: 'complete' },
  { date: 'Dec 31, 2023', event: 'FY 2023 Data Finalized', status: 'complete' },
  { date: 'Dec 15, 2023', event: 'External Verification Complete', status: 'complete' },
  { date: 'Mar 31, 2024', event: 'Annual BRSR Submission Due', status: 'upcoming' },
  { date: 'Jun 30, 2024', event: 'CBAM Declaration Due', status: 'upcoming' },
];

export default function ComplianceReports() {
  return (
    <>
      <Helmet>
        <title>Compliance Reports - CarbonBook Enterprise</title>
        <meta name="description" content="Generate BRSR reports, CBAM declarations, and audit trails with one-click compliance reporting." />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Compliance Reports</h1>
          <p className="text-muted-foreground mt-1">One-click regulatory reporting</p>
        </div>

        {/* Generator Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {reportCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="carbon-card p-6 hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{card.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {card.status === 'ready' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-carbon-success" />
                        <span className="text-xs text-carbon-success font-medium">Ready</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-carbon-warning" />
                        <span className="text-xs text-carbon-warning font-medium">Pending Data</span>
                      </>
                    )}
                  </div>
                  <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    card.status === 'ready' 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}>
                    {card.action}
                    {card.status === 'ready' && <Download className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Compliance Timeline */}
        <div
          className="carbon-card p-6"
        >
          <h2 className="text-lg font-semibold mb-6">Compliance Timeline</h2>
          <div className="space-y-0">
            {complianceTimeline.map((item, index) => (
              <div key={index} className="flex items-start gap-4 py-4 border-b border-border last:border-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  item.status === 'complete' ? 'bg-carbon-success-light' : 'bg-carbon-warning-light'
                }`}>
                  {item.status === 'complete' ? (
                    <CheckCircle2 className="w-5 h-5 text-carbon-success" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-carbon-warning" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{item.event}</p>
                  <p className="text-sm text-muted-foreground">{item.date}</p>
                </div>
                <button className="text-muted-foreground hover:text-foreground">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
