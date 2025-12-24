-- DIAGNOSTIC SCRIPT for 500 Error
-- Run this in Supabase SQL Editor

-- 1. Create a "Clean" User (No Profile, No Triggers)
-- We want to see if we can login with a user that has NO relation to the public schema.
INSERT INTO auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES (
  'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
  'authenticated',
  'authenticated',
  'clean_test@carbonbook.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"full_name": "Clean Test User"}',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- 2. Disable RLS on EVERYTHING in Public (Temporarily)
-- This rules out infinite recursion in policies.
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_checklist DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.emissions_records DISABLE ROW LEVEL SECURITY;

-- 3. Grant Super-Permissive Access to Auth Admin
-- "Database error querying schema" usually means Auth Admin can't see something.
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO supabase_auth_admin;

-- 4. Explicitly set search_path for the role (Skipped due to permissions)
-- ALTER ROLE supabase_auth_admin SET search_path TO public, auth, extensions;

-- 5. Check for any hidden triggers on auth.users
SELECT event_object_table, trigger_name, action_statement 
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' AND event_object_table = 'users';
