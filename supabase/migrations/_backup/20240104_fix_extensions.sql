-- FIX EXTENSIONS & PERMISSIONS
-- Run this in Supabase SQL Editor

-- 1. Create the extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- 2. Move pgcrypto to extensions (or create it there)
-- We try to create it first. If it exists in public, we might need to move it or leave it.
-- Best practice is usually 'extensions'.
CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA extensions;

-- 3. Grant usage on extensions to everyone
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role, supabase_auth_admin;

-- 4. Grant execute on all functions in extensions to everyone
GRANT ALL ON ALL ROUTINES IN SCHEMA extensions TO postgres, anon, authenticated, service_role, supabase_auth_admin;

-- 5. Ensure public schema access (Redundant but safe)
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin;

-- 6. Set the search_path for the database to include extensions
-- This helps if the role doesn't have it set.
ALTER DATABASE postgres SET search_path TO public, extensions;

-- 7. Re-verify the test user (Clean slate)
DELETE FROM public.profiles WHERE email = 'test@carbonbook.com';
DELETE FROM auth.users WHERE email = 'test@carbonbook.com';

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
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'authenticated',
  'authenticated',
  'test@carbonbook.com',
  crypt('password123', gen_salt('bf')), -- This will use pgcrypto from search_path
  now(),
  '{"full_name": "Test User"}',
  now(),
  now()
);

INSERT INTO public.profiles (id, organization_id, email, full_name, role)
VALUES (
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'test@carbonbook.com',
  'Test User',
  'admin'
);
