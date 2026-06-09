create extension if not exists "pgcrypto";

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can delete own profile" on public.profiles;
drop policy if exists "Users can view own clients" on public.clients;
drop policy if exists "Users can insert own clients" on public.clients;
drop policy if exists "Users can update own clients" on public.clients;
drop policy if exists "Users can delete own clients" on public.clients;
drop policy if exists "Users can view own quotes" on public.quotes;
drop policy if exists "Users can insert own quotes" on public.quotes;
drop policy if exists "Users can update own quotes" on public.quotes;
drop policy if exists "Users can delete own quotes" on public.quotes;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  company_name text not null default '',
  phone text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  company text,
  email text,
  phone text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  quote_number text,
  status text not null default 'draft',
  project_title text,
  project_type text,
  brief_text text,
  line_items jsonb not null default '[]'::jsonb,
  subtotal_aed numeric(12, 2),
  vat_5_aed numeric(12, 2),
  total_aed numeric(12, 2),
  share_token text unique,
  pdf_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint quotes_status_check check (
    status in ('draft', 'review', 'sent', 'accepted', 'rejected', 'won', 'lost')
  )
);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists profiles_handle_updated_at on public.profiles;
create trigger profiles_handle_updated_at
before update on public.profiles
for each row
execute function public.handle_updated_at();

drop trigger if exists quotes_handle_updated_at on public.quotes;
create trigger quotes_handle_updated_at
before update on public.quotes
for each row
execute function public.handle_updated_at();

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.quotes enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can delete own profile" on public.profiles;
create policy "Users can delete own profile"
on public.profiles
for delete
using (auth.uid() = id);

drop policy if exists "Users can view own clients" on public.clients;
create policy "Users can view own clients"
on public.clients
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own clients" on public.clients;
create policy "Users can insert own clients"
on public.clients
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own clients" on public.clients;
create policy "Users can update own clients"
on public.clients
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own clients" on public.clients;
create policy "Users can delete own clients"
on public.clients
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can view own quotes" on public.quotes;
create policy "Users can view own quotes"
on public.quotes
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own quotes" on public.quotes;
create policy "Users can insert own quotes"
on public.quotes
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.clients
    where clients.id = quotes.client_id
      and clients.user_id = auth.uid()
  )
);

drop policy if exists "Users can update own quotes" on public.quotes;
create policy "Users can update own quotes"
on public.quotes
for update
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.clients
    where clients.id = quotes.client_id
      and clients.user_id = auth.uid()
  )
);

drop policy if exists "Users can delete own quotes" on public.quotes;
create policy "Users can delete own quotes"
on public.quotes
for delete
using (auth.uid() = user_id);

create index if not exists clients_user_id_idx on public.clients (user_id);
create index if not exists quotes_user_id_idx on public.quotes (user_id);
create index if not exists quotes_client_id_idx on public.quotes (client_id);
create index if not exists quotes_share_token_idx on public.quotes (share_token);
