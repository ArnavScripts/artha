-- NUCLEAR PERMISSIONS FIX
-- Run this in Supabase SQL Editor

-- 1. Grant USAGE on public schema to EVERYONE (to be absolutely sure)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role, supabase_auth_admin, postgres;

-- 2. Grant ALL privileges on ALL tables in public to EVERYONE
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role, supabase_auth_admin, postgres;

-- 3. Grant ALL privileges on ALL sequences in public to EVERYONE
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role, supabase_auth_admin, postgres;

-- 4. Grant ALL privileges on ALL routines in public to EVERYONE
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role, supabase_auth_admin, postgres;

-- 5. Ensure pgcrypto is available in public
CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA public;

-- 6. DROP ALL TRIGGERS on auth.users (Again, to be safe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 7. Disable RLS on profiles (Temporarily, to rule it out completely)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
