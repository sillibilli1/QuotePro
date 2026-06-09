alter table public.profiles
add column if not exists is_subscribed boolean not null default false,
add column if not exists plan text,
add column if not exists stripe_customer_id text;

create index if not exists profiles_plan_idx on public.profiles (plan);
create index if not exists profiles_stripe_customer_id_idx on public.profiles (stripe_customer_id);
