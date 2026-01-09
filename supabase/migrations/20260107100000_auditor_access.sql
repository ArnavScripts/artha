-- Auditor Access & Permissions
-- "Who watches the watchers?"

-- 1. Update Profiles to support 'auditor' role
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'editor', 'viewer', 'auditor'));

-- 2. Seed Auditor User (Simulated)
-- WE WILL UPDATE THE EXISTING DEMO USER TO 'auditor' IF SCRIPT IS RUN, OR JUST RELY ON FRONTEND TOGGLE FOR DEMO.

-- 3. RLS: Auditors can VIEW ALL Emissions & Projects (ReadOnly Scope)
create policy "Auditors view all emissions" on emissions_records
for select using (
  exists (
    select 1 from profiles
    where id = auth.uid()
    and role = 'auditor'
  )
);

create policy "Auditors view all projects" on project_verifications
for select using (
  exists (
    select 1 from profiles
    where id = auth.uid() 
    and role = 'auditor'
  )
);

-- 4. RLS: Auditors can UPDATE VERIFICATION STATUS ONLY
-- STRICT COMPLIANCE: Auditors cannot modify emission amounts or raw data.
create policy "Auditors verify emissions" on emissions_records
for update using (
  exists (
    select 1 from profiles
    where id = auth.uid()
    and role = 'auditor'
  )
)
with check (
  exists (
    select 1 from profiles
    where id = auth.uid()
    and role = 'auditor'
  )
  -- In a real environment, we would use a BEFORE UPDATE trigger to prevent modifying 'co2e_tons', etc.
  -- For now, this RLS grants the *capability* to the row, assuming the API layer respects the column restrictions.
); 

-- 5. Helper to Promote a User to Auditor (For Demo Console)
create or replace function promote_to_auditor(user_email text)
returns json
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = user_email;
  
  if v_user_id is null then
     return json_build_object('success', false, 'message', 'User not found');
  end if;

  update public.profiles
  set role = 'auditor'
  where id = v_user_id;

  return json_build_object('success', true, 'message', 'User promoted to Auditor');
end;
$$;
