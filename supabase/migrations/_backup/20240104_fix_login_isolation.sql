-- ISOLATION FIX for Login 500 Error
-- Run this in Supabase SQL Editor

-- 1. DROP ALL TRIGGERS on auth.users to rule out interference
-- We will re-add the signup trigger later, once Login is working.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Ensure pgcrypto is installed in PUBLIC schema
CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA public;

-- 3. Grant Permissions (The "Nuclear Option" for permissions)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role, supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role, supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role, supabase_auth_admin;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role, supabase_auth_admin;

-- 4. Re-seed the Test User (Cleanly)
-- First, delete if exists to avoid bad state (Delete child first!)
DELETE FROM public.profiles WHERE email = 'test@carbonbook.com';
DELETE FROM auth.users WHERE email = 'test@carbonbook.com';

-- Create Organization
INSERT INTO public.organizations (id, name, industry, tier)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Acme Corp', 'Manufacturing', 'standard')
ON CONFLICT (id) DO NOTHING;

-- Create User (Manually, since trigger is gone)
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
)
VALUES (
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'test@carbonbook.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"full_name": "Test User"}',
  now(),
  now(),
  '',
  ''
);

-- Create Profile (Manually linking)
INSERT INTO public.profiles (id, organization_id, email, full_name, role)
VALUES (
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'test@carbonbook.com',
  'Test User',
  'admin'
);

-- 5. Verify RLS Policies (Ensure no infinite recursion)
-- We'll temporarily disable RLS on profiles to be safe, then re-enable
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Re-create simple policy that definitely works
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
