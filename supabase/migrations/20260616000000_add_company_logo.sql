-- Add company_logo_url column to profiles table
alter table public.profiles add column if not exists company_logo_url text;

-- Create storage bucket for company logos
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload their own logos
create policy "Users can upload own logo"
on storage.objects
for insert
with check (
  bucket_id = 'logos' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own logos
create policy "Users can update own logo"
on storage.objects
for update
using (
  bucket_id = 'logos' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own logos
create policy "Users can delete own logo"
on storage.objects
for delete
using (
  bucket_id = 'logos' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to all logos
create policy "Public can view logos"
on storage.objects
for select
using (bucket_id = 'logos');
