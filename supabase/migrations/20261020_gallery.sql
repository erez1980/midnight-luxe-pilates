-- Gallery for the marketing site: photos and videos Rotem uploads from the
-- app (/app/?page=gallery). Anyone can view; only the gallery admins below
-- can upload, edit or delete.

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  path text not null,                         -- object path in the "gallery" bucket
  kind text not null check (kind in ('image', 'video')),
  caption_he text not null default '',
  caption_en text not null default '',
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

-- Who may manage the gallery. Add an email here to grant access.
create or replace function public.is_gallery_admin()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'email', '') in (
    'rotem1980.shapira@gmail.com',
    'erez1980@gmail.com'
  );
$$;

alter table public.gallery_items enable row level security;

drop policy if exists "gallery items are public" on public.gallery_items;
create policy "gallery items are public"
  on public.gallery_items for select
  using (true);

drop policy if exists "gallery admins manage items" on public.gallery_items;
create policy "gallery admins manage items"
  on public.gallery_items for all
  to authenticated
  using (public.is_gallery_admin())
  with check (public.is_gallery_admin());

-- Public bucket: files are readable by URL; writes are admin-only. 50 MB is
-- the per-file limit on the Supabase free plan.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gallery', 'gallery', true, 52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm']
)
on conflict (id) do nothing;

drop policy if exists "gallery admins upload" on storage.objects;
create policy "gallery admins upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'gallery' and public.is_gallery_admin());

drop policy if exists "gallery admins delete" on storage.objects;
create policy "gallery admins delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'gallery' and public.is_gallery_admin());
