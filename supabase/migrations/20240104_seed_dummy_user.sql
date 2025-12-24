-- Seed Dummy User for Testing (Safer Version)
-- Run this in Supabase SQL Editor

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create Organization
INSERT INTO public.organizations (id, name, industry, tier)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Acme Corp', 'Manufacturing', 'standard')
ON CONFLICT (id) DO NOTHING;

-- 2. Create Auth User (Password: password123)
-- We do NOT specify instance_id, letting Supabase default it (usually to the project ID)
INSERT INTO auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token
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
  now(),
  ''
)
ON CONFLICT (id) DO NOTHING;

-- 3. Create Profile
-- We use ON CONFLICT DO UPDATE to ensure the profile is linked even if it already exists
INSERT INTO public.profiles (id, organization_id, email, full_name, role)
VALUES (
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'test@carbonbook.com',
  'Test User',
  'admin'
)
ON CONFLICT (id) DO UPDATE
SET 
  organization_id = EXCLUDED.organization_id,
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- 4. Create some dummy data for this org
INSERT INTO public.carbon_wallet (organization_id, balance, currency)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 50000.00, 'USD')
ON CONFLICT (organization_id) DO NOTHING;
