-- Seed Demo Organization for Artha Sage
-- Ensures demo@artha.com has a real organization in the DB for backend lookups

DO $$
DECLARE
    v_user_id uuid;
    v_org_id uuid;
BEGIN
    -- 1. Find the Demo User (Assuming they exist in auth.users)
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'demo@artha.com';

    IF v_user_id IS NOT NULL THEN
        
        -- 2. Create the Organization (if not exists)
        -- We explicitly handle the conflict to avoid duplicate inserts
        SELECT id INTO v_org_id FROM organizations WHERE name = 'Artha Demo Corp';

        IF v_org_id IS NULL THEN
            INSERT INTO organizations (name, industry, tier, credits_purchased, cash_balance)
            VALUES (
                'Artha Demo Corp', 
                'Manufacturing & Heavy Industry', 
                'enterprise', 
                150000, 
                1000000.00
            )
            RETURNING id INTO v_org_id;
        END IF;

        -- 3. Link Profile to Organization
        UPDATE public.profiles
        SET 
            organization_id = v_org_id,
            full_name = 'Demo Administrator', -- Ensure nice name
            role = 'admin' -- Ensure admin access
        WHERE id = v_user_id;

        RAISE NOTICE 'Linked demo user % to org %', v_user_id, v_org_id;
    
    ELSE
        RAISE NOTICE 'Demo user not found. Skipping seed.';
    END IF;
END $$;
