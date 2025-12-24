-- Consolidated Fix for Signup Flow
-- Run this entire script in the Supabase SQL Editor

-- 1. Ensure Profiles table has all necessary columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- 2. Ensure Organizations table has industry column
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS industry TEXT;

-- 3. Update the handle_new_user function to be robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    'admin' -- Default role for first user
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
    
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-create the trigger to ensure it's active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Grant necessary permissions (just in case)
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;
