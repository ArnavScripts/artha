import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  User,
  Building2,
  Shield,
  Key,
  CreditCard,
  ChevronRight,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { useProfile } from '@/hooks/useProfile';

export default function Settings() {
  const [showApiKey, setShowApiKey] = useState(false);
  const { profile, organization, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Settings - CarbonBook Enterprise</title>
        <meta name="description" content="Manage your identity, emission caps, banking details, and API keys." />
      </Helmet>

      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Identity Section */}
          <div
            className="carbon-card overflow-hidden"
          >
            <div className="p-4 border-b border-border flex items-center gap-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Identity</span>
            </div>
            <div className="divide-y divide-border">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Organization Name</p>
                  <p className="text-sm text-muted-foreground">{organization?.name || 'Not set'}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-carbon-success-light">
                  <Check className="w-4 h-4 text-carbon-success" />
                  <span className="text-xs font-medium text-carbon-success">Verified</span>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">User Profile</p>
                  <p className="text-sm text-muted-foreground font-mono">{profile?.full_name || profile?.email}</p>
                </div>
                <button className="text-sm text-primary hover:underline">Edit</button>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Industry Sector</p>
                  <p className="text-sm text-muted-foreground">{organization?.industry || 'Not specified'}</p>
                </div>
                <button className="text-sm text-primary hover:underline">Edit</button>
              </div>
            </div>
          </div>

          {/* Emission Caps Section */}
          <div
            className="carbon-card overflow-hidden"
          >
            <div className="p-4 border-b border-border flex items-center gap-3">
              <Building2 className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Emission Caps</span>
            </div>
            <div className="divide-y divide-border">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Annual Cap (FY 2024)</p>
                  <p className="text-sm text-muted-foreground font-mono">125,000 tCO2e</p>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-carbon-warning" />
                  <span className="text-sm text-carbon-warning">92% utilized</span>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Scope 1 Limit</p>
                  <p className="text-sm text-muted-foreground font-mono">50,000 tCO2e</p>
                </div>
                <button className="text-sm text-primary hover:underline">Adjust</button>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Auto-Offset Threshold</p>
                  <p className="text-sm text-muted-foreground">Trigger at 85% utilization</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          {/* Banking Section */}
          <div
            className="carbon-card-dark p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-5 h-5 text-white/70" />
              <span className="font-medium text-white">Banking Details</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Bank Account</span>
                <span className="font-mono text-white">HDFC ****4521</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">UPI ID</span>
                <span className="font-mono text-white">corporate@hdfcbank</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Auto-Debit</span>
                <span className="text-carbon-success text-sm font-medium">Enabled</span>
              </div>
            </div>
            <button className="w-full mt-6 py-3 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors">
              Update Banking
            </button>
          </div>

          {/* API Keys Section */}
          <div
            className="carbon-card overflow-hidden"
          >
            <div className="p-4 border-b border-border flex items-center gap-3">
              <Key className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">API Keys</span>
            </div>
            <div className="divide-y divide-border">
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-foreground">Production API Key</p>
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="font-mono text-sm text-muted-foreground">
                  {showApiKey ? `sk_live_${organization?.id?.slice(0, 8)}...` : 'sk_live_••••••••••••••••••••'}
                </p>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-foreground">Sandbox API Key</p>
                </div>
                <p className="font-mono text-sm text-muted-foreground">
                  sk_test_••••••••••••••••••••
                </p>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Webhook URL</p>
                  <p className="text-sm text-muted-foreground font-mono">https://api.artha.finance/webhook</p>
                </div>
                <button className="text-sm text-primary hover:underline">Configure</button>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div
            className="carbon-card overflow-hidden"
          >
            <div className="p-4 border-b border-border flex items-center gap-3">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Security</span>
            </div>
            <div className="divide-y divide-border">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">SMS verification enabled</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Session Timeout</p>
                  <p className="text-sm text-muted-foreground">Auto-logout after 30 minutes</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Login History</p>
                  <p className="text-sm text-muted-foreground">Last login: Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <button className="text-sm text-primary hover:underline">View All</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
