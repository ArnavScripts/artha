-- 1. The Emissions Log (Source of Truth)
create table public.emissions_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  created_at timestamptz default now(),
  
  -- The Evidence
  bill_url text not null,
  
  -- The Extracted Data (Raw)
  source_type text check (source_type in ('electricity', 'diesel', 'natural_gas', 'coal')),
  unit_type text check (unit_type in ('kWh', 'L', 'kg', 'MT')),
  consumption numeric not null,
  total_cost numeric,
  bill_date date,
  
  -- The Calculated Impact (Deterministic)
  carbon_emission numeric, -- tCO2e (Calculated by code, not AI)
  
  -- The Trust Layer
  ai_confidence numeric, -- 0.0 to 1.0
  status text default 'needs_review' check (status in ('verified', 'needs_review', 'rejected')),
  raw_ai_response jsonb -- Keep the raw AI output for debugging
);

-- 2. RLS Security (Crucial)
alter table public.emissions_log enable row level security;

create policy "Users see own data" on public.emissions_log
  for select using (auth.uid() = user_id);

create policy "Users insert own data" on public.emissions_log
  for insert with check (auth.uid() = user_id);
