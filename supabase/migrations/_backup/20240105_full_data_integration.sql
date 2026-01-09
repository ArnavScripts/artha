-- Create forecasts table
CREATE TABLE IF NOT EXISTS public.forecasts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) NOT NULL,
    month TEXT NOT NULL,
    actual NUMERIC,
    projected NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trade_recommendations table
CREATE TABLE IF NOT EXISTS public.trade_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('BUY', 'SELL', 'HOLD')),
    quantity NUMERIC NOT NULL,
    price_per_unit NUMERIC NOT NULL,
    confidence NUMERIC NOT NULL,
    rationale TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create organization_impact table
CREATE TABLE IF NOT EXISTS public.organization_impact (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) NOT NULL,
    trees_planted NUMERIC DEFAULT 0,
    co2_offset NUMERIC DEFAULT 0,
    water_saved NUMERIC DEFAULT 0,
    clean_energy NUMERIC DEFAULT 0,
    csr_rating TEXT,
    media_value TEXT,
    engagement_rate TEXT,
    certifications TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create offset_history table
CREATE TABLE IF NOT EXISTS public.offset_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) NOT NULL,
    month TEXT NOT NULL,
    offset_value NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create project_verifications table
CREATE TABLE IF NOT EXISTS public.project_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) NOT NULL,
    project_name TEXT NOT NULL,
    vintage TEXT NOT NULL,
    credits NUMERIC NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('verified', 'pending', 'in_review', 'rejected')),
    auditor TEXT,
    last_audit DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create registry_reconciliation table
CREATE TABLE IF NOT EXISTS public.registry_reconciliation (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) NOT NULL,
    registry_name TEXT NOT NULL,
    credits NUMERIC NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('synced', 'pending', 'error')),
    last_sync TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_impact ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offset_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registry_reconciliation ENABLE ROW LEVEL SECURITY;

-- Create policies (simplified for demo: allow all authenticated users to read/write)
-- In production, restrict to organization members
CREATE POLICY "Allow all access for authenticated users" ON public.forecasts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all access for authenticated users" ON public.trade_recommendations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all access for authenticated users" ON public.organization_impact FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all access for authenticated users" ON public.offset_history FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all access for authenticated users" ON public.project_verifications FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all access for authenticated users" ON public.registry_reconciliation FOR ALL USING (auth.role() = 'authenticated');
