-- 1. Fix Profiles: Add email column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Update existing profiles with email from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id;

-- 2. Fix Organizations: Add industry column
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS industry TEXT;
