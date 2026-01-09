-- Green Marketplace Schema (Voluntary Market)
-- "Amazon for Carbon Credits"

-- 1. Projects Catalog
create table green_projects (
    id bigint primary key generated always as identity,
    name text not null,
    location text not null,
    type text not null, -- 'Renewable Check', 'Forestry', etc
    description text,
    image_url text,
    registry_id text, -- Verra/Gold Standard ID
    sdg_goals text[], -- Array of SDG goals supported
    impact_vcp text, -- e.g. "24,500 tonnes CO2/year"
    rating numeric(2,1) default 5.0,
    roi_percentage numeric(4,2), -- Financial return estimation
    created_at timestamptz default now()
);

-- 2. Inventory (Stock Keeping Unit)
create table green_inventory (
    id bigint primary key generated always as identity,
    project_id bigint references green_projects(id),
    vintage_year int not null,
    price_per_credit numeric(10,2) not null,
    available_quantity int not null check (available_quantity >= 0),
    total_issued int not null,
    created_at timestamptz default now(),
    unique(project_id, vintage_year)
);

-- 3. Transactions (Order History)
create table green_transactions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id),
    project_id bigint references green_projects(id),
    inventory_id bigint references green_inventory(id),
    quantity int not null,
    total_price numeric(12,2) not null,
    status text default 'completed', -- 'completed', 'pending_registry_retirement'
    certificate_url text, -- URL to PDFs after retirement
    created_at timestamptz default now()
);

-- 4. RLS Policies
alter table green_projects enable row level security;
alter table green_inventory enable row level security;
alter table green_transactions enable row level security;

-- Public can view projects/inventory
create policy "Public view projects" on green_projects for select using (true);
create policy "Public view inventory" on green_inventory for select using (true);

-- Authenticated users can buy (insert transactions) and view their own
create policy "Users buy credits" on green_transactions for insert with check (auth.uid() = user_id);
create policy "Users view own orders" on green_transactions for select using (auth.uid() = user_id);

-- 5. Atomic Purchase Function (The "Checkout" Button)
create or replace function purchase_green_credits(
    p_inventory_id bigint,
    p_quantity int
) returns json
language plpgsql
security definer
as $$
declare
    v_price numeric;
    v_project_id bigint;
    v_user_id uuid;
    v_current_stock int;
    v_total_cost numeric;
    v_tx_id uuid;
begin
    v_user_id := auth.uid();
    
    -- Check Stock & Lock Row
    select available_quantity, price_per_credit, project_id
    into v_current_stock, v_price, v_project_id
    from green_inventory
    where id = p_inventory_id
    for update; -- Lock to prevent race condition double-spend

    if v_current_stock < p_quantity then
        return json_build_object('success', false, 'message', 'Insufficient stock');
    end if;

    v_total_cost := v_price * p_quantity;

    -- Deduct Stock
    update green_inventory
    set available_quantity = available_quantity - p_quantity
    where id = p_inventory_id;

    -- Record Transaction
    insert into green_transactions (user_id, project_id, inventory_id, quantity, total_price)
    values (v_user_id, v_project_id, p_inventory_id, p_quantity, v_total_cost)
    returning id into v_tx_id;

    return json_build_object(
        'success', true, 
        'transaction_id', v_tx_id,
        'message', 'Purchase successful'
    );
end;
$$;

-- 6. Seed Data (Mock Catalog)
insert into green_projects (name, location, type, image_url, impact_vcp, rating, roi_percentage) -- Note: price display is just for catalog, real price in inventory
values 
('Adani Solar Park', 'Rajasthan, India', 'Renewable Energy', 'https://images.unsplash.com/photo-1509391366360-2e959784a276', '24,500 tCO2', 4.9, 12.5),
('Sundarbans Mangrove', 'West Bengal, India', 'Nature Restoration', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e', '15,000 tCO2', 4.8, 8.2),
('Gujarat Wind Farm', 'Gujarat, India', 'Wind Energy', 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51', '42,000 tCO2', 4.7, 10.1);

-- Seed Inventory
insert into green_inventory (project_id, vintage_year, price_per_credit, available_quantity, total_issued)
select id, 2025, 450, 5000, 5000 from green_projects where name = 'Adani Solar Park';

insert into green_inventory (project_id, vintage_year, price_per_credit, available_quantity, total_issued)
select id, 2024, 380, 2000, 2000 from green_projects where name = 'Sundarbans Mangrove';

insert into green_inventory (project_id, vintage_year, price_per_credit, available_quantity, total_issued)
select id, 2025, 520, 10000, 10000 from green_projects where name = 'Gujarat Wind Farm';
