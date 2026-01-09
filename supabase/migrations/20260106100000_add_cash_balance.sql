-- Wallet & Ledger Integration
-- "Show me the money"

-- 1. Add Cash Balance to Organization
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS cash_balance NUMERIC(15,2) DEFAULT 0.00;

-- 2. Seed Demo Money (Venture Capital Injection)
-- Give everyone $1,000,000 to play with
UPDATE public.organizations 
SET cash_balance = 1000000.00;

-- 3. Update Purchase RPC with Solvency Check
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
    v_org_id uuid;
    v_current_stock int;
    v_current_balance numeric;
    v_total_cost numeric;
    v_tx_id uuid;
begin
    v_user_id := auth.uid();
    
    -- Get User's Organization
    select organization_id::uuid into v_org_id
    from profiles
    where id = v_user_id;

    if v_org_id is null then
        return json_build_object('success', false, 'message', 'User not linked to an organization');
    end if;
    
    -- Check Stock & Lock Inventory Row
    select available_quantity, price_per_credit, project_id
    into v_current_stock, v_price, v_project_id
    from green_inventory
    where id = p_inventory_id
    for update; 

    if v_current_stock < p_quantity then
        return json_build_object('success', false, 'message', 'Insufficient stock');
    end if;

    v_total_cost := v_price * p_quantity;

    -- Check Balance & Lock Organization Row
    select cash_balance into v_current_balance
    from organizations
    where id = v_org_id
    for update;

    if v_current_balance < v_total_cost then
        return json_build_object('success', false, 'message', 'Insufficient funds');
    end if;

    -- Deduct Balance
    update organizations
    set cash_balance = cash_balance - v_total_cost
    where id = v_org_id;

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
        'message', 'Purchase successful',
        'remaining_balance', (v_current_balance - v_total_cost)
    );
end;
$$;
