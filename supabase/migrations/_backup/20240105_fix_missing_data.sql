-- 1. Backfill missing profiles for existing auth users
INSERT INTO public.profiles (id, email, full_name, role, organization_id)
SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data->>'full_name',
    'admin',
    '00000000-0000-0000-0000-000000000000' -- Default Org ID
FROM auth.users au
LEFT JOIN public.profiles pp ON au.id = pp.id
WHERE pp.id IS NULL;

-- 2. Seed initial trade recommendation if none exists
INSERT INTO public.trade_recommendations (
    organization_id,
    action,
    quantity,
    price_per_unit,
    confidence,
    rationale,
    status
)
SELECT 
    '00000000-0000-0000-0000-000000000000',
    'BUY',
    1500,
    580.00,
    87,
    'Based on rising carbon prices and Q3 compliance deadline approaching.',
    'active'
WHERE NOT EXISTS (SELECT 1 FROM public.trade_recommendations);
