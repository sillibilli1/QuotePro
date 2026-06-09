alter table public.quotes
add column if not exists viewed_at timestamptz;

create index if not exists quotes_viewed_at_idx on public.quotes (viewed_at);
