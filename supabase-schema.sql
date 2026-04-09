-- Run this SQL in your Supabase Dashboard → SQL Editor
-- Creates the profiles table for Academic & Research profiles

-- Drop existing table if you ran a previous schema
drop table if exists public.profiles;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  first_name text,
  last_name text,
  age integer,
  gender text,
  university text,
  degree_level text,
  field_of_study text,
  research_focus text,
  funding_needed text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_profile_updated on public.profiles;

create trigger on_profile_updated
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- Saved grants
drop table if exists public.saved_grants;

create table public.saved_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  grant_record_id text not null,
  grant_name text,
  department text,
  agreement_value numeric,
  agreement_type text,
  start_date text,
  grant_data jsonb not null,
  created_at timestamptz default now(),
  unique(user_id, grant_record_id)
);

alter table public.saved_grants enable row level security;

create policy "Users can view their own saved grants"
  on public.saved_grants for select
  using (auth.uid() = user_id);

create policy "Users can insert their own saved grants"
  on public.saved_grants for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own saved grants"
  on public.saved_grants for delete
  using (auth.uid() = user_id);
