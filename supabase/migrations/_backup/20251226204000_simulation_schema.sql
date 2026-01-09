-- Create scenarios table
create table if not exists public.scenarios (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  status text default 'draft' check (status in ('draft', 'active', 'archived')),
  baseline_cost numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create interventions table
create table if not exists public.interventions (
  id uuid default gen_random_uuid() primary key,
  scenario_id uuid references public.scenarios(id) on delete cascade not null,
  title text not null,
  impact_description text,
  capex_cost numeric,
  npv_value numeric,
  reduction_percentage numeric,
  is_applied boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create projections table
create table if not exists public.projections (
  id uuid default gen_random_uuid() primary key,
  scenario_id uuid references public.scenarios(id) on delete cascade not null,
  month date not null,
  bau_value numeric not null,
  optimized_value numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.scenarios enable row level security;
alter table public.interventions enable row level security;
alter table public.projections enable row level security;

-- RLS Policies
create policy "Users can view their own scenarios"
  on public.scenarios for select
  using (auth.uid() = user_id);

create policy "Users can insert their own scenarios"
  on public.scenarios for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own scenarios"
  on public.scenarios for update
  using (auth.uid() = user_id);

create policy "Users can view interventions for their scenarios"
  on public.interventions for select
  using (exists (
    select 1 from public.scenarios
    where scenarios.id = interventions.scenario_id
    and scenarios.user_id = auth.uid()
  ));

create policy "Users can insert interventions for their scenarios"
  on public.interventions for insert
  with check (exists (
    select 1 from public.scenarios
    where scenarios.id = interventions.scenario_id
    and scenarios.user_id = auth.uid()
  ));

create policy "Users can update interventions for their scenarios"
  on public.interventions for update
  using (exists (
    select 1 from public.scenarios
    where scenarios.id = interventions.scenario_id
    and scenarios.user_id = auth.uid()
  ));

create policy "Users can view projections for their scenarios"
  on public.projections for select
  using (exists (
    select 1 from public.scenarios
    where scenarios.id = projections.scenario_id
    and scenarios.user_id = auth.uid()
  ));

create policy "Users can insert projections for their scenarios"
  on public.projections for insert
  with check (exists (
    select 1 from public.scenarios
    where scenarios.id = projections.scenario_id
    and scenarios.user_id = auth.uid()
  ));
