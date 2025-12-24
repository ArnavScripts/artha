-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdraw')),
    amount NUMERIC NOT NULL, -- Amount in INR
    credits NUMERIC NOT NULL, -- Converted Credits
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Allow all access for authenticated users" ON public.transactions FOR ALL USING (auth.role() = 'authenticated');
