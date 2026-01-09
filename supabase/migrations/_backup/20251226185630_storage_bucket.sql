-- Create a private bucket for bills
insert into storage.buckets (id, name, public)
values ('bills', 'bills', false);

-- Policy: Users can upload their own bills
create policy "Users can upload own bills"
on storage.objects for insert
with check (
  bucket_id = 'bills' and
  auth.uid() = owner
);

-- Policy: Users can view their own bills
create policy "Users can view own bills"
on storage.objects for select
using (
  bucket_id = 'bills' and
  auth.uid() = owner
);
