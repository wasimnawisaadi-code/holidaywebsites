-- Prepares the analytics table for paid ad traffic.
--
-- Applied to production on 2026-09-03.
--
-- Two problems, both only visible under volume:
--
-- 1. events_meta_idx was a GIN index on the meta JSONB column with zero scans
--    since it was created (confirmed against pg_stat_user_indexes: idx_scan
--    was 0 while events_created_at_idx had 38). GIN is the most expensive
--    index type to maintain on INSERT — every write tokenises the whole
--    document and updates the posting lists — and this table takes one INSERT
--    per page view plus one per interaction. It was pure write cost for a read
--    that never happens.
--
--    Reversible. If a query ever needs to search inside meta:
--      create index events_meta_idx on public.events using gin (meta);
--
-- 2. Nothing ever deleted an event. At roughly 15 events per visitor session,
--    a thousand visitors a day is ~450k rows a month against a 500MB budget.
--    Without retention the table quietly fills it and INSERTs begin failing —
--    which would present as the ads breaking, not as a database problem, and
--    would be diagnosed late.
--
--    180 days is well past the point where a raw event row is useful. GA4
--    holds the long-range aggregate and the admin dashboard only ever reads
--    recent activity.

drop index if exists public.events_meta_idx;

create extension if not exists pg_cron;

create or replace function public.prune_old_events()
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  delete from public.events where created_at < now() - interval '180 days';
$$;

-- SECURITY DEFINER, so it must not be callable by the public or anon roles.
revoke all on function public.prune_old_events() from public, anon, authenticated;

-- 03:20 UTC is the quiet hour for a Gulf audience.
select cron.unschedule('prune-old-events')
where exists (select 1 from cron.job where jobname = 'prune-old-events');

select cron.schedule('prune-old-events', '20 3 * * *', 'select public.prune_old_events()');

comment on function public.prune_old_events() is
  'Nightly retention for the analytics table. Raw events older than 180 days are dropped; GA4 holds the long-range aggregate and the dashboard only reads recent activity.';
