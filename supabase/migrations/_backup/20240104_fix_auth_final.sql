-- FINAL FIX for Auth 500 Error
-- Run this in Supabase SQL Editor

-- 1. Reset: Drop existing trigger and function to ensure clean slate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Permissions: Ensure Auth Admin has access to Public Schema
-- This is often the cause of "Database error querying schema"
GRANT USAGE ON SCHEMA public TO supabase_auth_admin, service_role, anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin, service_role, postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin, service_role, postgres;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO supabase_auth_admin, service_role, postgres;

-- 3. Schema: Ensure Profiles table exists and is correct
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id),
    email TEXT,
    full_name TEXT,
    role TEXT CHECK (role IN ('admin', 'editor', 'viewer')) DEFAULT 'viewer',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Function: Robust handle_new_user with search_path set
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    'admin'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
    
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Trigger: Re-attach
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Verification: Create a dummy user to test (Optional, can be commented out if running manually)
-- INSERT INTO auth.users (
--   id,
--   aud,
--   role,
--   email,
--   encrypted_password,
--   email_confirmed_at,
--   raw_user_meta_data,
--   created_at,
--   updated_at
-- )
-- VALUES (
--   'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
--   'authenticated',
--   'authenticated',
--   'test_final@carbonbook.com',
--   crypt('password123', gen_salt('bf')),
--   now(),
--   '{"full_name": "Final Test User"}',
--   now(),
--   now()
-- )
-- ON CONFLICT (id) DO NOTHING;
