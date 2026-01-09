-- Emergency Fix for Login 500 Error
-- Run this in Supabase SQL Editor

-- 1. Drop the trigger to ensure it's not blocking Login (even though it shouldn't)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Ensure pgcrypto is available (crucial for auth)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 3. Fix Permissions (often the cause of "Database error querying schema")
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- 4. Ensure profiles table exists and has correct columns
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    organization_id UUID REFERENCES organizations(id),
    email TEXT,
    full_name TEXT,
    role TEXT CHECK (role IN ('admin', 'editor', 'viewer')) DEFAULT 'viewer',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Manual Seed Check (Ensure the test user exists)
-- If this fails, it means the user already exists, which is fine.
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
  crypt('password123', gen_salt('bf')),
  now(),
  '{"full_name": "Test User"}',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;
