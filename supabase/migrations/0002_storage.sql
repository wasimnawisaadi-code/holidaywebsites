-- Media storage for the Nawi Saadi site.
--
-- Run after 0001_analytics.sql, in the Supabase SQL editor.
--
-- Scope, deliberately: this bucket is for images added *after* launch — a new
-- package photograph uploaded from /admin without a code deploy. The ~183MB of
-- destination photography that ships with the repo stays on Vercel's CDN,
-- which already serves it with immutable caching at no egress cost. Supabase's
-- free tier allows 5GB of egress a month, and an image-heavy travel site would
-- clear that in roughly a thousand visits, so routing the whole library through
-- it would be slower and eventually billable for no gain.

-- Public-read bucket: these are marketing photographs meant to be seen. Writes
-- are restricted below.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760,  -- 10MB; the site's own images are re-encoded to well under 1MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Anyone may read. The bucket holds published marketing imagery only.
drop policy if exists "media is publicly readable" on storage.objects;
create policy "media is publicly readable"
  on storage.objects
  for select
  to public
  using (bucket_id = 'media');

-- Nobody may write with the anon key. Uploads happen server-side with the
-- service role, which bypasses these policies — so there is deliberately no
-- insert/update/delete policy here. A leaked anon key cannot replace a
-- photograph on the live site.

-- Record of what was uploaded and why, so the admin media list does not depend
-- on scraping the bucket and can carry alt text.
create table if not exists public.media (
  id          bigserial primary key,
  created_at  timestamptz not null default now(),
  path        text not null unique,     -- object path within the bucket
  alt         text,                     -- accessibility text, required at upload
  caption     text,
  width       int,
  height      int,
  bytes       int,
  uploaded_by text                      -- which admin, for the audit trail
);

create index if not exists media_created_idx on public.media (created_at desc);

alter table public.media enable row level security;

-- Readable by anyone (the site renders these); writes are service-role only,
-- same reasoning as the bucket.
drop policy if exists "media rows are publicly readable" on public.media;
create policy "media rows are publicly readable"
  on public.media
  for select
  to public
  using (true);
