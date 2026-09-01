-- Restores the write validation on the public-facing tables.
--
-- Migration 0003 shipped an INSERT policy on `leads` that checked the shape of
-- the address before letting a row land. The policy currently in the database
-- is not that one: it is named "anyone can insert a lead", it is granted to
-- `public` rather than `anon`, and its WITH CHECK is a bare `true`. Something
-- replaced it after the fact, and the effect was measurable — posting
-- {"email":"notanemail"} with the browser's own public key returned 201.
--
-- `events` has the same shape of problem for a different reason: its policy
-- was always `with check (true)` by design, so a single request could store a
-- megabyte of arbitrary JSON, repeatedly.
--
-- What is NOT wrong, recorded here because it looks wrong from outside: an
-- anon PATCH or DELETE against `leads` returns 204. That is PostgREST saying
-- "no rows matched", not "deleted". There is no UPDATE or DELETE policy for
-- anon, so RLS refuses both. Verified against live data.

-- --------------------------------------------------------------------------
-- leads: an address has to look like one
-- --------------------------------------------------------------------------

drop policy if exists "anyone can insert a lead" on public.leads;
drop policy if exists "anon can submit a lead" on public.leads;

create policy "anon can submit a lead"
  on public.leads
  for insert
  to anon
  with check (
    email is not null
    and length(email) between 5 and 320
    and position('@' in email) > 1
    -- Bound the free-text fields. These are written straight from a form, and
    -- nothing legitimate needs more than this.
    and (name  is null or length(name)  <= 200)
    and (phone is null or length(phone) <= 40)
    and (notes is null or length(notes) <= 5000)
    and (path  is null or length(path)  <= 300)
    -- The pipeline state belongs to the office, not to the submitter.
    and status = 'new'
    -- jsonb payloads are cheap to send and expensive to store.
    and pg_column_size(detail) <= 8192
  );

-- --------------------------------------------------------------------------
-- events: an analytics beacon is small
-- --------------------------------------------------------------------------

drop policy if exists "anon can insert events" on public.events;

create policy "anon can insert events"
  on public.events
  for insert
  to anon
  with check (
    type is not null
    and length(type) <= 40
    and (path       is null or length(path)       <= 300)
    and (referrer   is null or length(referrer)   <= 300)
    and (session_id is null or length(session_id) <= 64)
    and (user_agent is null or length(user_agent) <= 400)
    and (device     is null or length(device)     <= 20)
    and (locale     is null or length(locale)     <= 20)
    -- The WhatsApp payload is the largest legitimate meta, and it is a
    -- prefilled message plus a handful of parsed fields.
    and pg_column_size(meta) <= 8192
  );

-- --------------------------------------------------------------------------
-- Say the quiet part explicitly: anon writes and never reads or changes.
-- These are no-ops against the current grants; they exist so that a future
-- dashboard edit that adds one back is visible as a diff against this file.
-- --------------------------------------------------------------------------

revoke select, update, delete on public.leads  from anon, authenticated;
revoke select, update, delete on public.events from anon, authenticated;
