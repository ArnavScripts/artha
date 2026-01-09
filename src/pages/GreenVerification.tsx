import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSearch,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AISuggestionBanner } from '@/components/shared/AISuggestionBanner';

const verificationProjects = [
  {
    id: 1,
    name: 'Western Ghats Reforestation',
    standard: 'Verra VCS',
    status: 'in_progress',
    progress: 85,
    stage: 'Third-Party Audit',
    estimatedCredits: 15000,
    startDate: '15 Oct 2025',
    expectedCompletion: '15 Mar 2026',
    auditor: 'RINA India'
  },
  {
    id: 2,
    name: 'Gujarat Wind Farm Ph-2',
    standard: 'Gold Standard',
    status: 'pending',
    progress: 45,
    stage: 'Validation',
    estimatedCredits: 25000,
    startDate: '01 Jan 2026',
    expectedCompletion: '01 Jun 2026',
    auditor: 'TÜV SÜD'
  },
  {
    id: 3,
    name: 'Kerala Mangrove Restoration',
    standard: 'Verra VCS',
    status: 'completed',
    progress: 100,
    stage: 'Credits Issued',
    estimatedCredits: 5500,
    startDate: '01 Jun 2025',
    expectedCompletion: '15 Nov 2025',
    auditor: 'DNV GL'
  },
  {
    id: 4,
    name: 'Assam Solar Grid Integration',
    standard: 'I-REC',
    status: 'pending',
    progress: 15,
    stage: 'Project Design',
    estimatedCredits: 12000,
    startDate: '01 Feb 2026',
    expectedCompletion: '01 Aug 2026',
    auditor: 'Pending'
  }
];

const gcpStages = [
  { name: 'Project Design Document', status: 'completed' },
  { name: 'Validation', status: 'completed' },
  { name: 'Implementation', status: 'completed' },
  { name: 'Monitoring', status: 'in_progress' },
  { name: 'Verification', status: 'pending' },
  { name: 'Credit Issuance', status: 'pending' },
];

export default function GreenVerification() {
  return (
    <>
      <Helmet>
        <title>Verification | GreenBook</title>
        <meta name="description" content="Green Credit Programme verification and audit tracking" />
      </Helmet>

      <div className="min-h-screen bg-background p-6">
        <div
          className="max-w-7xl mx-auto space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground flex items-center gap-3">
                <ShieldCheck className="w-7 h-7 text-green-primary" />
                Verification Center
              </h1>
              <p className="text-muted-foreground mt-1">GCP Audit & Certification Tracking</p>
            </div>
            <Button className="bg-green-primary hover:bg-green-primary/90">
              <FileSearch className="w-4 h-4 mr-2" />
              Submit New Project
            </Button>
          </div>

          <AISuggestionBanner
            message="Western Ghats project audit scheduled for next week. Ensure all monitoring data is uploaded."
            type="info"
            action="View Schedule"
          />

          {/* GCP Stage Overview */}
          <div className="green-card p-6">
            <h2 className="text-lg font-semibold mb-6">Green Credit Programme Pipeline</h2>
            <div className="flex items-center justify-between">
              {gcpStages.map((stage, index) => (
                <div key={stage.name} className="flex items-center">
                  <div className="text-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${stage.status === 'completed'
                        ? 'bg-green-primary text-white'
                        : stage.status === 'in_progress'
                          ? 'bg-green-solar text-white'
                          : 'bg-muted text-muted-foreground'
                        }`}
                    >
                      {stage.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : stage.status === 'in_progress' ? (
                        <Clock className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-mono">{index + 1}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground max-w-[80px]">{stage.name}</p>
                  </div>
                  {index < gcpStages.length - 1 && (
                    <div className={`w-12 h-0.5 mx-2 ${stage.status === 'completed' ? 'bg-green-primary' : 'bg-muted'
                      }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Projects List */}
          <div className="space-y-4">
            {verificationProjects.map((project, index) => (
              <div
                key={project.id}
                className="green-card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-foreground">{project.name}</h3>
                      <Badge
                        className={
                          project.status === 'completed'
                            ? 'bg-green-primary-light text-green-primary border-green-primary/20'
                            : project.status === 'in_progress'
                              ? 'bg-green-solar-light text-green-solar border-green-solar/20'
                              : 'bg-muted text-muted-foreground'
                        }
                      >
                        {project.status === 'completed' ? 'Verified' :
                          project.status === 'in_progress' ? 'In Progress' : 'Pending'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{project.standard}</span>
                      <span>•</span>
                      <span>Auditor: {project.auditor}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                    <ExternalLink className="w-3 h-3 ml-2" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Current Stage</p>
                    <p className="font-medium text-foreground">{project.stage}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Est. Credits</p>
                    <p className="font-mono font-medium text-foreground">
                      {project.estimatedCredits.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Started</p>
                    <p className="text-foreground">{project.startDate}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Expected Completion</p>
                    <p className="text-foreground">{project.expectedCompletion}</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Verification Progress</span>
                    <span className="font-mono text-foreground">{project.progress}%</span>
                  </div>
                  <Progress
                    value={project.progress}
                    className={`h-2 ${project.status === 'completed'
                      ? '[&>div]:bg-green-primary'
                      : '[&>div]:bg-green-solar'
                      }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}