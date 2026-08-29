-- =====================================================================
-- NAWI SAADI HOLIDAYS - ALL-IN-ONE SUPABASE DATABASE INITIALIZATION
-- =====================================================================
-- Run this single script in Supabase Dashboard -> SQL Editor -> New Query -> Run.
-- It initializes:
--   1. Analytics & Events table with RLS & indexes & views
--   2. Media Storage bucket, media metadata table & policies
--   3. Leads & Subscriber Pipeline table with RLS, triggers & indexes
-- =====================================================================

-- ---------------------------------------------------------------------
-- PART 1: ANALYTICS & EVENT LOGGING
-- ---------------------------------------------------------------------

create table if not exists public.events (
  id           bigserial primary key,
  created_at   timestamptz not null default now(),
  type         text        not null,
  path         text,
  referrer     text,
  session_id   text,
  user_agent   text,
  viewport_w   int,
  viewport_h   int,
  device       text,
  locale       text,
  meta         jsonb       not null default '{}'::jsonb
);

create index if not exists events_created_at_idx on public.events (created_at desc);
create index if not exists events_type_created_idx on public.events (type, created_at desc);
create index if not exists events_session_idx on public.events (session_id);
create index if not exists events_path_idx on public.events (path);
create index if not exists events_meta_idx on public.events using gin (meta);

alter table public.events enable row level security;

drop policy if exists "anon can insert events" on public.events;
create policy "anon can insert events"
  on public.events
  for insert
  to anon
  with check (true);

create or replace view public.events_daily as
select
  date_trunc('day', created_at) as day,
  type,
  count(*)                      as total,
  count(distinct session_id)    as sessions
from public.events
group by 1, 2
order by 1 desc, 3 desc;

create or replace view public.whatsapp_clicks_by_context as
select
  coalesce(meta ->> 'context', path, 'unknown') as context,
  count(*)                                      as clicks,
  count(distinct session_id)                    as sessions,
  max(created_at)                               as last_click
from public.events
where type = 'whatsapp_click'
group by 1
order by 2 desc;

-- ---------------------------------------------------------------------
-- PART 2: STORAGE BUCKET & MEDIA TABLE
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760,  -- 10MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media is publicly readable" on storage.objects;
create policy "media is publicly readable"
  on storage.objects
  for select
  to public
  using (bucket_id = 'media');

create table if not exists public.media (
  id          bigserial primary key,
  created_at  timestamptz not null default now(),
  path        text not null unique,
  alt         text,
  caption     text,
  width       int,
  height      int,
  bytes       int,
  uploaded_by text
);

create index if not exists media_created_idx on public.media (created_at desc);

alter table public.media enable row level security;

drop policy if exists "media rows are publicly readable" on public.media;
create policy "media rows are publicly readable"
  on public.media
  for select
  to public
  using (true);

-- ---------------------------------------------------------------------
-- PART 3: LEADS & SUBSCRIBER PIPELINE
-- ---------------------------------------------------------------------

create table if not exists public.leads (
  id           bigserial primary key,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  email        text not null,
  name         text,
  phone        text,
  source       text not null default 'subscribe',
  path         text,
  referrer     text,
  detail       jsonb not null default '{}'::jsonb,
  session_id   text,
  status       text not null default 'new',
  notes        text
);

create unique index if not exists leads_email_key on public.leads (lower(email));
create index if not exists leads_created_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status, created_at desc);
create index if not exists leads_source_idx on public.leads (source);

alter table public.leads enable row level security;

drop policy if exists "anon can submit a lead" on public.leads;
create policy "anon can submit a lead"
  on public.leads
  for insert
  to anon
  with check (
    email is not null
    and length(email) between 5 and 320
    and position('@' in email) > 1
  );

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_touch_updated_at on public.leads;
create trigger leads_touch_updated_at
  before update on public.leads
  for each row
  execute function public.touch_updated_at();
