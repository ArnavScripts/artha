-- Function to seed data for a new organization
CREATE OR REPLACE FUNCTION public.seed_organization_data()
RETURNS trigger AS $$
BEGIN
    -- 1. Seed Organization Impact
    INSERT INTO public.organization_impact (
        organization_id, trees_planted, co2_offset, water_saved, clean_energy,
        csr_rating, media_value, engagement_rate, certifications
    ) VALUES (
        NEW.id,
        0, -- Initial values
        0,
        0,
        0,
        'B+', -- Default rating
        '₹0',
        '0%',
        ARRAY['Pending Verification']
    );

    -- 2. Seed Offset History (Empty or initial dummy data)
    -- Let's add a few months of 0 data or small dummy data to show the chart works
    INSERT INTO public.offset_history (organization_id, month, offset_value)
    VALUES 
        (NEW.id, 'Jan', 0),
        (NEW.id, 'Feb', 0),
        (NEW.id, 'Mar', 0);

    -- 3. Seed Project Verifications (Empty or sample)
    INSERT INTO public.project_verifications (
        organization_id, project_name, vintage, credits, status, auditor, last_audit
    ) VALUES (
        NEW.id, 'Sample Solar Project', '2024', 1000, 'pending', 'Internal', NOW()
    );

    -- 4. Seed Registry Reconciliation
    INSERT INTO public.registry_reconciliation (
        organization_id, registry_name, credits, status, last_sync
    ) VALUES (
        NEW.id, 'Verra (VCS)', 0, 'synced', NOW()
    );

    -- 5. Seed Forecasts
    INSERT INTO public.forecasts (organization_id, month, projected, actual)
    VALUES 
        (NEW.id, 'Jan', 5000, 4800),
        (NEW.id, 'Feb', 5200, NULL),
        (NEW.id, 'Mar', 5400, NULL);

    -- 6. Seed Trade Recommendations
    INSERT INTO public.trade_recommendations (
        organization_id, action, quantity, price_per_unit, confidence, rationale, status
    ) VALUES (
        NEW.id, 'BUY', 1000, 550.00, 85, 'Initial portfolio setup recommendation.', 'active'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run after organization creation
DROP TRIGGER IF EXISTS on_organization_created ON public.organizations;
CREATE TRIGGER on_organization_created
    AFTER INSERT ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.seed_organization_data();
