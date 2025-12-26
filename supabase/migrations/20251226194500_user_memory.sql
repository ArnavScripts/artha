create table if not exists user_memory (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users not null,
  category text not null,
  content text not null,
  created_at timestamptz default now()
);

alter table user_memory enable row level security;

create policy "Users can select their own memory"
on user_memory for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own memory"
on user_memory for insert
to authenticated
with check (auth.uid() = user_id);
