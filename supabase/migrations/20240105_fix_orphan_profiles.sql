-- Create a default organization if it doesn't exist
INSERT INTO public.organizations (id, name, tier, industry, credits_purchased)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Default Organization',
    'standard',
    'Technology',
    0
)
ON CONFLICT (id) DO NOTHING;

-- Update profiles that have no organization_id to point to the default organization
UPDATE public.profiles
SET organization_id = '00000000-0000-0000-0000-000000000000'
WHERE organization_id IS NULL;
