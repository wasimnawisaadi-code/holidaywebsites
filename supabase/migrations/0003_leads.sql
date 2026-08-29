-- Leads: newsletter subscribers and enquiry submissions.
--
-- Run after 0002_storage.sql.
--
-- This table holds personal data — an email address a customer typed in. It is
-- treated differently from the analytics events:
--
--   * anon may INSERT and nothing else, same as events, so the public key
--     cannot enumerate your subscriber list;
--   * there is a unique constraint on email so a double submit updates rather
--     than creating a second row;
--   * `source` records which form it came from, because a subscriber from the
--     footer and a lead from a package page are different intents and deserve
--     different follow-up.

create table if not exists public.leads (
  id           bigserial primary key,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  email        text not null,
  name         text,
  phone        text,

  -- Which form, and from which page.
  source       text not null default 'subscribe',   -- subscribe | enquiry | planner
  path         text,
  referrer     text,

  -- What the person was looking at when they subscribed: destination, dates,
  -- travellers, or the package slug. Free-form so a new form does not need a
  -- migration.
  detail       jsonb not null default '{}'::jsonb,

  -- Ties a lead back to their session in `events`, so the admin can see what
  -- they browsed before submitting.
  session_id   text,

  -- Simple pipeline state, editable from the admin panel.
  status       text not null default 'new',         -- new | contacted | quoted | booked | closed
  notes        text
);

-- One row per address. A repeat submit refreshes the detail rather than
-- creating a duplicate to chase twice.
create unique index if not exists leads_email_key on public.leads (lower(email));
create index if not exists leads_created_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status, created_at desc);
create index if not exists leads_source_idx on public.leads (source);

alter table public.leads enable row level security;

-- Anonymous visitors may submit, and nothing else. No select policy exists, so
-- the subscriber list cannot be read with the public key.
drop policy if exists "anon can submit a lead" on public.leads;
create policy "anon can submit a lead"
  on public.leads
  for insert
  to anon
  with check (
    -- Minimal shape check at the database, so a malformed or empty submission
    -- never lands even if the client validation is bypassed.
    email is not null
    and length(email) between 5 and 320
    and position('@' in email) > 1
  );

-- Keep updated_at honest when the admin edits a status or note.
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
