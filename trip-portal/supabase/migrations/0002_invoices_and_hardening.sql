-- Nawi Saadi Trip Portal — invoices, the admin list view, and hardening.
--
-- Run after 0001. Applied to the live project on 2026-09-28 as the migrations
-- `trip_portal_invoices`, `trip_portal_security` (the view) and
-- `trip_portal_hardening`; this file reproduces that end state on a fresh one.

-- ---------------------------------------------------------------------------
-- Invoices
-- ---------------------------------------------------------------------------
--
-- Money is numeric(12,2), never a float. The column is exact; what the
-- application does with it is covered in src/lib/types.ts, because PostgREST
-- sends numeric to the browser as a JSON number and the arithmetic has to be
-- done in integer fils to stay exact.
--
-- Totals are stored rather than computed from the line items. A quoted trip
-- price routinely carries a negotiated discount or a rounded-down figure that
-- does not decompose cleanly into lines, so the total the customer agreed is a
-- fact in its own right. `subtotal` is what the lines add up to; `total` is
-- what they owe. The admin recomputes both from the lines on every save, so
-- nobody types a total by hand.

do $$ begin
  create type trip_invoice_status as enum ('draft', 'sent', 'part_paid', 'paid', 'void');
exception when duplicate_object then null;
end $$;

create table if not exists public.trip_invoices (
  id             uuid primary key default gen_random_uuid(),
  trip_id        uuid not null references public.trips (id) on delete cascade,
  invoice_number text not null unique,
  currency       text not null default 'AED',
  status         trip_invoice_status not null default 'draft',
  issued_date    date not null default current_date,
  due_date       date,
  subtotal       numeric(12,2) not null default 0,
  discount       numeric(12,2) not null default 0,
  total          numeric(12,2) not null default 0,
  amount_paid    numeric(12,2) not null default 0,
  notes          text,
  -- Invisible to the customer until the office says otherwise, like a day of
  -- the itinerary. A draft invoice appearing in someone's portal mid-negotiation
  -- is the kind of mistake that costs a booking.
  published      boolean not null default false,
  created_at     timestamptz not null default now(),
  created_by     text,
  constraint trip_invoices_amounts_sane check (
    subtotal >= 0 and discount >= 0 and total >= 0 and amount_paid >= 0
  ),
  constraint trip_invoices_currency_shape check (length(currency) between 3 and 3)
);
create index if not exists trip_invoices_trip_idx on public.trip_invoices (trip_id, issued_date desc);

create table if not exists public.trip_invoice_items (
  id          uuid primary key default gen_random_uuid(),
  invoice_id  uuid not null references public.trip_invoices (id) on delete cascade,
  position    int not null default 0,
  description text not null,
  quantity    numeric(10,2) not null default 1,
  unit_price  numeric(12,2) not null default 0,
  -- Stored, not generated: a line can carry an agreed price that is not exactly
  -- quantity x unit_price (a package rate for three people, say), and forcing
  -- the arithmetic would make the office fudge the unit price to compensate.
  amount      numeric(12,2) not null default 0,
  constraint trip_invoice_items_sane check (quantity >= 0 and amount >= 0)
);
create index if not exists trip_invoice_items_invoice_idx on public.trip_invoice_items (invoice_id, position);

drop trigger if exists trip_invoices_audit on public.trip_invoices;
create trigger trip_invoices_audit after insert or update or delete on public.trip_invoices
  for each row execute function public.trip_audit_capture();

alter table public.trip_invoices      enable row level security;
alter table public.trip_invoice_items enable row level security;
revoke all on public.trip_invoices      from anon, authenticated;
revoke all on public.trip_invoice_items from anon, authenticated;

-- Next invoice number for this year: NSI-2026-0001.
--
-- Sequential and sayable, and — unlike the tracking token — meant to be
-- guessable: an invoice number is a reference, not a credential. Minted in the
-- database rather than counted in JavaScript so that two consultants pressing
-- "New invoice" at once cannot both read the same maximum.
--
-- Note for callers: PostgREST returns a scalar function's result as the bare
-- JSON value ("NSI-2026-0001"), not as [{ next_invoice_number: … }]. The admin
-- originally read the second shape and silently fell back to a timestamp on
-- every invoice.
create or replace function public.next_invoice_number() returns text
language plpgsql as $fn$
declare
  yr text := to_char(now(), 'YYYY');
  n  int;
begin
  select coalesce(max(substring(invoice_number from '\d+$')::int), 0) + 1 into n
    from public.trip_invoices
   where invoice_number like 'NSI-' || yr || '-%';
  return 'NSI-' || yr || '-' || lpad(n::text, 4, '0');
end $fn$;

-- ---------------------------------------------------------------------------
-- The admin list view
-- ---------------------------------------------------------------------------
--
-- Per trip: the customer's name, how far the trip has got, how much the
-- customer has actually looked at it, and what they still owe. Getting "latest
-- progress row" right in application code is the kind of thing that is subtly
-- wrong for months, so it is done once, here.
--
-- security_invoker: the view runs with the privileges of whoever queries it,
-- not of its owner. Without it a view runs as `postgres`, which bypasses RLS on
-- every table underneath — harmless while anon is revoked from the view, and a
-- full data leak the moment someone grants it back.

create or replace view public.trip_overview
with (security_invoker = true) as
select
  t.id,
  t.trip_code,
  t.title,
  t.destination,
  t.start_date,
  t.end_date,
  t.status,
  t.tracking_token,
  t.published_at,
  t.created_at,
  t.updated_at,
  c.full_name as customer_name,
  c.phone     as customer_phone,
  c.whatsapp  as customer_whatsapp,
  (select p.stage      from public.trip_progress p where p.trip_id = t.id order by p.created_at desc limit 1) as current_stage,
  (select p.created_at from public.trip_progress p where p.trip_id = t.id order by p.created_at desc limit 1) as current_stage_at,
  (select count(*)     from public.trip_views v where v.trip_id = t.id and v.event = 'open')                  as portal_opens,
  (select max(v.created_at) from public.trip_views v where v.trip_id = t.id)                                  as last_seen_at,
  (select count(*)     from public.trip_days d where d.trip_id = t.id)                                        as day_count,
  (select count(*)     from public.trip_days d where d.trip_id = t.id and d.published)                        as published_day_count,
  (select count(*)     from public.trip_invoices i where i.trip_id = t.id and i.published)                    as invoice_count,
  (select coalesce(sum(i.total - i.amount_paid), 0) from public.trip_invoices i
    where i.trip_id = t.id and i.status not in ('void', 'draft'))                                              as balance_due
from public.trips t
left join public.trip_customers c on c.id = t.customer_id;

revoke all on public.trip_overview from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Hardening, from Supabase's security advisor
-- ---------------------------------------------------------------------------

-- Pin search_path on the helper functions. Without it, a function resolves
-- unqualified names through the caller's search_path, so a role able to create
-- objects in an earlier schema could shadow something these depend on. Empty is
-- the strictest setting and safe here: pg_catalog is always searched, and every
-- table reference in these bodies is schema-qualified.
alter function public.trip_audit_actor()    set search_path = '';
alter function public.trips_touch()         set search_path = '';
alter function public.next_invoice_number() set search_path = '';

-- Functions in public are executable by anon over /rest/v1/rpc by default.
-- Calling a trigger function directly fails, so trip_audit_capture was not
-- exploitable — but "not exploitable because of an unrelated rule" is not a
-- security property. Postgres checks EXECUTE when a trigger is created, not each
-- time it fires, so this does not stop the audit trail recording (verified:
-- service-role inserts still produce audit rows after the revoke).
revoke execute on function public.trip_audit_capture()  from public, anon, authenticated;
revoke execute on function public.next_invoice_number() from public, anon, authenticated;
revoke execute on function public.trip_audit_actor()    from public, anon, authenticated;
revoke execute on function public.trips_touch()         from public, anon, authenticated;

-- The service role mints invoice numbers.
grant execute on function public.next_invoice_number() to service_role;

-- Advisor findings deliberately NOT acted on:
--   * "RLS enabled, no policy" on every trip_ table — that is the design. RLS on
--     with zero policies is a default deny for the public key.
--   * public.rls_auto_enable() callable by anon — pre-existing, not part of this
--     portal, and an event-trigger function that cannot be invoked via the API.
