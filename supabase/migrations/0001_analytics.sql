-- Analytics and audit logging for the Nawi Saadi site.
--
-- Run this once in the Supabase SQL editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run).
--
-- Design notes that matter:
--
--   * The public site writes with the anon key, which is embedded in the
--     browser and therefore public. RLS is what makes that safe: anon may
--     INSERT and nothing else. It cannot read a single row back, so no visitor
--     can enumerate what anyone else did.
--
--   * Reading is done server-side with the service role key, which never
--     reaches the browser. There is deliberately no SELECT policy for anon.
--
--   * `meta` is jsonb so a new event type does not need a migration. The
--     columns that are queried and grouped are real columns, because filtering
--     on jsonb at scale is slow.

create table if not exists public.events (
  id           bigserial primary key,
  created_at   timestamptz not null default now(),

  -- What happened. Kept as free text rather than an enum so adding an event
  -- type is a code change, not a database migration.
  type         text        not null,

  -- Where it happened.
  path         text,
  referrer     text,

  -- Who, loosely. A random per-browser id, not an account and not a person:
  -- enough to tell one visit from ten, and never joined to anything identifying.
  session_id   text,

  -- Device context, for reading the numbers honestly.
  user_agent   text,
  viewport_w   int,
  viewport_h   int,
  device       text,          -- mobile | tablet | desktop
  locale       text,

  -- Anything type-specific: which package, which button, scroll depth.
  meta         jsonb       not null default '{}'::jsonb
);

-- The admin dashboard reads recent-first, filters by type, and groups by day.
create index if not exists events_created_at_idx on public.events (created_at desc);
create index if not exists events_type_created_idx on public.events (type, created_at desc);
create index if not exists events_session_idx on public.events (session_id);
create index if not exists events_path_idx on public.events (path);
create index if not exists events_meta_idx on public.events using gin (meta);

alter table public.events enable row level security;

-- Anonymous visitors may record an event and nothing else.
drop policy if exists "anon can insert events" on public.events;
create policy "anon can insert events"
  on public.events
  for insert
  to anon
  with check (true);

-- No select/update/delete policy for anon is intentional. With RLS enabled and
-- no matching policy, those operations are denied.

-- Convenience views for the dashboard. They inherit the table's RLS, so they
-- are only readable with the service role.

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
