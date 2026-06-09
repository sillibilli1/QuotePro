-- ============================================================================
-- Day 8: Clients Table
-- ============================================================================
-- This migration creates the public.clients table which stores client 
-- information for quote generation. Each user can have multiple clients,
-- and each client can have multiple quotes.
-- ============================================================================

-- Create the clients table
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  company text,
  email text,
  phone text,
  created_at timestamptz not null default timezone('utc', now())
);

-- Add index for faster lookups by user_id
create index if not exists clients_user_id_idx on public.clients (user_id);

-- Add composite index for the findOrCreateClient query pattern (user_id + name + company)
create index if not exists clients_user_name_company_idx on public.clients (user_id, name, company);

-- Enable Row Level Security
alter table public.clients enable row level security;

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Policy: Users can view their own clients
drop policy if exists "Users can view own clients" on public.clients;
create policy "Users can view own clients"
on public.clients
for select
using (auth.uid() = user_id);

-- Policy: Users can insert their own clients
drop policy if exists "Users can insert own clients" on public.clients;
create policy "Users can insert own clients"
on public.clients
for insert
with check (auth.uid() = user_id);

-- Policy: Users can update their own clients
drop policy if exists "Users can update own clients" on public.clients;
create policy "Users can update own clients"
on public.clients
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Policy: Users can delete their own clients
drop policy if exists "Users can delete own clients" on public.clients;
create policy "Users can delete own clients"
on public.clients
for delete
using (auth.uid() = user_id);
