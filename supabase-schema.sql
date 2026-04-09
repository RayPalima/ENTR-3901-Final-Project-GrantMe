-- Run this SQL in your Supabase Dashboard → SQL Editor
-- Creates the profiles table for Academic & Research profiles

-- Drop existing table if you ran a previous schema
drop table if exists public.profiles;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
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
