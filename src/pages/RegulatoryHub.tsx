import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  Landmark, 
  TrendingUp, 
  Building2, 
  FileCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Shield,
  Users,
  Wallet
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AISuggestionBanner } from '@/components/shared/AISuggestionBanner';
import { useWorkspace } from '@/contexts/WorkspaceContext';

const cctsObligatedEntities = [
  { 
    facility: 'Steel Plant A', 
    baselineEmissions: 45000,
    currentEmissions: 42500,
    targetReduction: 10,
    ccccRequired: 2500,
    ccccHeld: 1800,
    compliancePeriod: '2024-26',
    status: 'action_required'
  },
  { 
    facility: 'Cement Unit B', 
    baselineEmissions: 28000,
    currentEmissions: 25200,
    targetReduction: 8,
    ccccRequired: 0,
    ccccHeld: 560,
    compliancePeriod: '2024-26',
    status: 'on_track'
  },
  { 
    facility: 'Refinery C', 
    baselineEmissions: 62000,
    currentEmissions: 58000,
    targetReduction: 12,
    ccccRequired: 4440,
    ccccHeld: 1200,
    compliancePeriod: '2024-26',
    status: 'critical'
  },
];

const cctsHoldingAccount = {
  totalCredits: 3560,
  marketValue: 5340000,
  averagePrice: 1500,
  lastTransaction: '18 Dec 2024',
  pendingTransfers: 2,
};

const beeAuditors = [
  { name: 'M/s Green Audit India', accreditation: 'BEE/AUD/2024/089', rating: 4.8, available: true },
  { name: 'EcoVerify Consultants', accreditation: 'BEE/AUD/2023/156', rating: 4.6, available: true },
  { name: 'Carbon Trust India', accreditation: 'BEE/AUD/2024/023', rating: 4.9, available: false },
];

const filings = [
  { id: 1, name: 'CCTS Entity Registration', status: 'approved', date: '01 Apr 2024' },
  { id: 2, name: 'Annual Emission Report FY24', status: 'submitted', date: '15 Dec 2024' },
  { id: 3, name: 'CCCC Purchase Declaration', status: 'pending', date: '31 Jan 2025' },
  { id: 4, name: 'Compliance Period Statement', status: 'draft', date: '31 Mar 2026' },
];

export default function RegulatoryHub() {
  const { isSimpleView } = useWorkspace();

  return (
    <>
      <Helmet>
        <title>Regulatory Hub | CarbonBook Enterprise</title>
        <meta name="description" content="CCTS Compliance Engine - Indian Carbon Credit Trading Scheme tracking" />
      </Helmet>

      <div className="min-h-screen bg-background p-6">
        <div
          className="max-w-7xl mx-auto space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground flex items-center gap-3">
                <Landmark className="w-7 h-7 text-carbon-tech" />
                CCTS Compliance Engine
              </h1>
              <p className="text-muted-foreground mt-1">Carbon Credit Trading Scheme - Ministry of Power, India</p>
            </div>
            <Badge variant="outline" className="bg-carbon-tech-light text-carbon-tech border-carbon-tech/20">
              <Clock className="w-3 h-3 mr-1" />
              Compliance Period 2024-26
            </Badge>
          </div>

          {isSimpleView && (
            <AISuggestionBanner 
              message="CCTS Alert: You need 5,940 more CCCCs to meet compliance. Current market price: ₹1,500/credit. Estimated cost: ₹89.1L"
              type="warning"
            />
          )}

          {/* CCCC Holding Account - Top Card */}
          <div className="carbon-card p-6 border-l-4 border-l-carbon-tech">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-carbon-tech-light flex items-center justify-center">
                  <Wallet className="w-7 h-7 text-carbon-tech" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">CCCC Holding Account</h2>
                  <p className="text-sm text-muted-foreground">Certified Carbon Credit Certificates</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-mono font-bold text-foreground">
                  {cctsHoldingAccount.totalCredits.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Worth ₹{(cctsHoldingAccount.marketValue / 100000).toFixed(1)}L
                </p>
              </div>
            </div>
            
            {!isSimpleView && (
              <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">Avg. Purchase Price</p>
                  <p className="font-mono text-lg font-semibold">₹{cctsHoldingAccount.averagePrice}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">Last Transaction</p>
                  <p className="font-mono text-lg font-semibold">{cctsHoldingAccount.lastTransaction}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">Pending Transfers</p>
                  <p className="font-mono text-lg font-semibold">{cctsHoldingAccount.pendingTransfers}</p>
                </div>
                <div className="flex items-center justify-center">
                  <Button className="bg-carbon-tech hover:bg-carbon-tech/90">
                    Buy CCCCs
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Obligated Entity Targets */}
          <div className="carbon-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Obligated Entity Targets</h2>
                  <p className="text-sm text-muted-foreground">Ministry of Power mandated emission reduction targets</p>
                </div>
              </div>
              {!isSimpleView && (
                <Badge variant="outline" className="text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  CCTS Regulation 2023
                </Badge>
              )}
            </div>

            <div className="space-y-6">
              {cctsObligatedEntities.map((entity, index) => (
                <div
                  key={entity.facility}
                  className="p-4 rounded-lg bg-muted/30 border border-border"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-foreground">{entity.facility}</h3>
                      <p className="text-xs text-muted-foreground">
                        Compliance Period: {entity.compliancePeriod} • Target: {entity.targetReduction}% reduction
                      </p>
                    </div>
                    <Badge 
                      variant="outline"
                      className={
                        entity.status === 'on_track' ? 'pill-success' : 
                        entity.status === 'critical' ? 'pill-risk' : 'pill-warning'
                      }
                    >
                      {entity.status === 'on_track' ? 'On Track' : 
                       entity.status === 'critical' ? 'Critical' : 'Action Required'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Emission Reduction Progress</span>
                        <span className="font-mono text-foreground">
                          {((1 - entity.currentEmissions / entity.baselineEmissions) * 100).toFixed(1)}% / {entity.targetReduction}%
                        </span>
                      </div>
                      <Progress 
                        value={((1 - entity.currentEmissions / entity.baselineEmissions) / (entity.targetReduction / 100)) * 100}
                        className="h-2"
                      />
                      {!isSimpleView && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {entity.currentEmissions.toLocaleString()} / {entity.baselineEmissions.toLocaleString()} tCO2e
                        </p>
                      )}
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">CCCC Holdings</span>
                        <span className="font-mono text-foreground">
                          {entity.ccccHeld.toLocaleString()} / {entity.ccccRequired.toLocaleString()} needed
                        </span>
                      </div>
                      <Progress 
                        value={entity.ccccRequired > 0 ? (entity.ccccHeld / entity.ccccRequired) * 100 : 100} 
                        className={`h-2 ${entity.ccccHeld >= entity.ccccRequired ? '[&>div]:bg-carbon-success' : '[&>div]:bg-carbon-risk'}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BEE Auditor Connect & Filings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* BEE Auditor Connect */}
            <div className="carbon-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-green-primary-light flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">BEE Auditor Connect</h2>
                  <p className="text-sm text-muted-foreground">Bureau of Energy Efficiency accredited auditors</p>
                </div>
              </div>

              <div className="space-y-3">
                {beeAuditors.map((auditor) => (
                  <div 
                    key={auditor.accreditation}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${auditor.available ? 'bg-carbon-success' : 'bg-muted-foreground'}`} />
                      <div>
                        <p className="text-sm font-medium text-foreground">{auditor.name}</p>
                        {!isSimpleView && (
                          <p className="text-xs text-muted-foreground">{auditor.accreditation}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        ⭐ {auditor.rating}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant={auditor.available ? 'default' : 'outline'}
                        disabled={!auditor.available}
                        className={auditor.available ? 'bg-green-primary hover:bg-green-primary/90' : ''}
                      >
                        {auditor.available ? 'Invite' : 'Unavailable'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MoEFCC / MoP Filings */}
            <div className="carbon-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-carbon-success-light flex items-center justify-center">
                  <FileCheck className="w-5 h-5 text-carbon-success" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Regulatory Filings</h2>
                  <p className="text-sm text-muted-foreground">MoP & Grid India submissions</p>
                </div>
              </div>

              <div className="space-y-3">
                {filings.map((filing) => (
                  <div 
                    key={filing.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {filing.status === 'approved' && <CheckCircle2 className="w-4 h-4 text-carbon-success" />}
                      {filing.status === 'submitted' && <Clock className="w-4 h-4 text-carbon-tech" />}
                      {filing.status === 'pending' && <AlertCircle className="w-4 h-4 text-carbon-warning" />}
                      {filing.status === 'draft' && <FileCheck className="w-4 h-4 text-muted-foreground" />}
                      <div>
                        <p className="text-sm font-medium text-foreground">{filing.name}</p>
                        <p className="text-xs text-muted-foreground">{filing.date}</p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline"
                      className={
                        filing.status === 'approved' ? 'bg-carbon-success-light text-carbon-success border-carbon-success/20' :
                        filing.status === 'submitted' ? 'bg-carbon-tech-light text-carbon-tech border-carbon-tech/20' :
                        filing.status === 'pending' ? 'bg-carbon-warning-light text-carbon-warning border-carbon-warning/20' :
                        'bg-muted text-muted-foreground'
                      }
                    >
                      {filing.status.charAt(0).toUpperCase() + filing.status.slice(1)}
                    </Badge>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full mt-4">
                View All Filings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
