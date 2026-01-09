-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations & Users (Multi-tenancy Core)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    tier TEXT CHECK (tier IN ('standard', 'enterprise', 'premium')) DEFAULT 'standard',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    organization_id UUID REFERENCES organizations(id),
    email TEXT,
    full_name TEXT,
    role TEXT CHECK (role IN ('admin', 'editor', 'viewer')) DEFAULT 'viewer',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Compliance Domain
CREATE TABLE compliance_checklist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    task TEXT NOT NULL,
    due_date DATE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'scheduled', 'in_progress', 'not_started', 'completed')) DEFAULT 'pending',
    priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    name TEXT NOT NULL,
    date DATE NOT NULL,
    auditor TEXT,
    type TEXT CHECK (type IN ('Mandatory', 'Voluntary', 'Internal')),
    status TEXT DEFAULT 'scheduled'
);

CREATE TABLE data_gaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    source TEXT NOT NULL,
    last_update TIMESTAMPTZ,
    severity TEXT CHECK (severity IN ('critical', 'warning', 'info')) DEFAULT 'warning',
    resolved BOOLEAN DEFAULT FALSE
);

-- 3. Emissions Domain
CREATE TABLE emissions_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    source TEXT NOT NULL,
    type TEXT CHECK (type IN ('Scope 1', 'Scope 2', 'Scope 3')) NOT NULL,
    value NUMERIC(10, 2) NOT NULL,
    unit TEXT DEFAULT 'tCO2e',
    status TEXT CHECK (status IN ('verified', 'pending', 'rejected')) DEFAULT 'pending',
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE anomaly_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    source TEXT NOT NULL,
    anomaly TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    status TEXT CHECK (status IN ('unresolved', 'investigating', 'resolved')) DEFAULT 'unresolved'
);

-- 4. Market & Trading Domain
CREATE TABLE market_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol TEXT DEFAULT 'CCTS',
    price NUMERIC(10, 2) NOT NULL,
    volume INTEGER,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_book (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id), -- Nullable for public market view
    type TEXT CHECK (type IN ('bid', 'ask')) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    status TEXT CHECK (status IN ('open', 'filled', 'cancelled')) DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE carbon_wallet (
    organization_id UUID PRIMARY KEY REFERENCES organizations(id),
    balance NUMERIC(12, 2) DEFAULT 0,
    currency TEXT DEFAULT 'INR',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Regulatory Domain
CREATE TABLE ccts_entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    facility_name TEXT NOT NULL,
    baseline_emissions NUMERIC(12, 2),
    current_emissions NUMERIC(12, 2),
    target_reduction NUMERIC(5, 2), -- Percentage
    compliance_period TEXT,
    status TEXT CHECK (status IN ('action_required', 'on_track', 'critical'))
);

CREATE TABLE regulatory_filings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    name TEXT NOT NULL,
    status TEXT CHECK (status IN ('approved', 'submitted', 'pending', 'draft')),
    submission_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Green Portfolio Domain
CREATE TABLE portfolio_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    credits_held INTEGER DEFAULT 0,
    vintage TEXT,
    status TEXT DEFAULT 'Active'
);

CREATE TABLE marketplace_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location TEXT,
    type TEXT,
    price_per_credit NUMERIC(10, 2),
    available_credits INTEGER,
    rating NUMERIC(3, 1),
    image_url TEXT,
    verified_by TEXT
);

-- 7. Live Feed
CREATE TABLE live_feed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('update', 'success', 'warning', 'error')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES --------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE emissions_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomaly_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY; -- Public read
ALTER TABLE order_book ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE ccts_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulatory_filings ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_projects ENABLE ROW LEVEL SECURITY; -- Public read
ALTER TABLE live_feed ENABLE ROW LEVEL SECURITY;

-- Helper function for RLS
CREATE OR REPLACE FUNCTION get_auth_org_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT organization_id FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies

-- Profiles: Users can see their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Organizations: Users can view their own org
CREATE POLICY "Users can view own organization" ON organizations
    FOR SELECT USING (id = get_auth_org_id());

-- Compliance Checklist: Org isolation
CREATE POLICY "Org isolation for checklist" ON compliance_checklist
    FOR ALL USING (organization_id = get_auth_org_id());

-- Emissions: Org isolation
CREATE POLICY "Org isolation for emissions" ON emissions_records
    FOR ALL USING (organization_id = get_auth_org_id());

-- Market Prices: Public read, Admin write (mocking admin as null for now)
CREATE POLICY "Public read market prices" ON market_prices
    FOR SELECT USING (true);

-- Marketplace Projects: Public read
CREATE POLICY "Public read marketplace" ON marketplace_projects
    FOR SELECT USING (true);

-- Live Feed: Org isolation
CREATE POLICY "Org isolation for feed" ON live_feed
    FOR ALL USING (organization_id = get_auth_org_id());

-- (Add similar policies for all other org-specific tables)
CREATE POLICY "Org isolation for audits" ON audits FOR ALL USING (organization_id = get_auth_org_id());
CREATE POLICY "Org isolation for data_gaps" ON data_gaps FOR ALL USING (organization_id = get_auth_org_id());
CREATE POLICY "Org isolation for anomaly_logs" ON anomaly_logs FOR ALL USING (organization_id = get_auth_org_id());
CREATE POLICY "Org isolation for carbon_wallet" ON carbon_wallet FOR ALL USING (organization_id = get_auth_org_id());
CREATE POLICY "Org isolation for ccts_entities" ON ccts_entities FOR ALL USING (organization_id = get_auth_org_id());
CREATE POLICY "Org isolation for regulatory_filings" ON regulatory_filings FOR ALL USING (organization_id = get_auth_org_id());
CREATE POLICY "Org isolation for portfolio_assets" ON portfolio_assets FOR ALL USING (organization_id = get_auth_org_id());

-- Indexes for Performance
CREATE INDEX idx_emissions_org_date ON emissions_records(organization_id, date);
CREATE INDEX idx_checklist_org_status ON compliance_checklist(organization_id, status);
CREATE INDEX idx_market_prices_time ON market_prices(timestamp DESC);
