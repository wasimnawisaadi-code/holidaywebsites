-- Security hardening and lead-capture correctness.
--
-- Run after 0003_leads.sql.
--
-- Three problems this fixes, all found against the live project:
--
--   1. `events_daily` and `whatsapp_clicks_by_context` were readable with the
--      public anon key. A view in Postgres 15+ runs as its *owner* unless told
--      otherwise, and these are owned by `postgres`, which is exempt from RLS.
--      So the "anon may INSERT and never SELECT" rule that `events` enforces
--      was being walked straight around by querying the view instead:
--
--        GET /rest/v1/events_daily      -> 200, full traffic breakdown
--        GET /rest/v1/whatsapp_clicks_by_context -> 200, every enquiry context
--
--      Both are now security_invoker, and anon's SELECT grant is revoked, so
--      the views obey the same RLS as the table they read.
--
--   2. `public.touch_updated_at` ran with a mutable search_path, which lets a
--      caller who can create objects shadow an unqualified name the function
--      resolves. Pinned.
--
--   3. The unique index on lower(email) covered *every* lead, not just
--      newsletter signups. A returning customer sending a second enquiry hit a
--      409, and because the caller ignored the result the form still showed a
--      booking reference — the enquiry was lost in silence. Newsletter signups
--      still deduplicate; enquiries no longer do, because two enquiries from
--      one person are two pieces of work.

-- --------------------------------------------------------------------------
-- 1. Views must not bypass Row Level Security
-- --------------------------------------------------------------------------

alter view public.events_daily set (security_invoker = on);
alter view public.whatsapp_clicks_by_context set (security_invoker = on);

-- Belt and braces: even as invoker, anon has no reason to hold SELECT here.
revoke all on public.events_daily from anon, authenticated;
revoke all on public.whatsapp_clicks_by_context from anon, authenticated;

-- --------------------------------------------------------------------------
-- 2. Pin the trigger function's search_path
-- --------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- --------------------------------------------------------------------------
-- 3. Deduplicate newsletter signups only — never enquiries
-- --------------------------------------------------------------------------

drop index if exists public.leads_email_key;

-- One newsletter row per address, from whichever form offered the signup.
create unique index if not exists leads_subscribe_email_key
  on public.leads (lower(email))
  where source in ('subscribe', 'footer', 'newsletter');

-- Enquiries are looked up by address constantly in the admin panel, so keep a
-- plain index even though duplicates are now allowed.
create index if not exists leads_email_idx on public.leads (lower(email));
