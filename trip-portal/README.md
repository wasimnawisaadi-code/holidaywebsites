# Nawi Saadi — Trip Portal

A separate application from the marketing site. Customers follow their trip at
`/t/<token>`; the office runs it from `/admin`.

## Why it is a separate app

It shares the Supabase project and nothing else — no imported code, no shared
build config, its own Vercel project and its own domain. The website is public
and optimised to be found; this holds named individuals' phone numbers, hotel
bookings and visa documents. Coupling them means a change made for one can
expose the other.

## The security model in one paragraph

The customer has no password, so the link **is** the credential. Therefore no
part of this application reads Supabase from the browser: every read runs
server-side with the service role key after the token has been checked in code
the customer cannot bypass. The migration revokes `anon` and `authenticated`
from every `trip_*` table, so even a query sent by hand returns nothing. Both
storage buckets are private and files are served as signed URLs minted per
request, which means a voucher forwarded into a group chat expires instead of
becoming permanently public.

`src/lib/db.ts`, `trips.ts`, `auth.ts` and `views.ts` are server-only and throw
on import if they ever reach the browser. `src/lib/types.ts` is the
client-safe half — components import from there.

## Setup

1. Run `supabase/migrations/0001_trip_portal.sql`, then
   `0002_invoices_and_hardening.sql`, in the Supabase SQL editor. Both are
   additive and namespaced; neither touches the website's tables. (Already
   applied to the `nawisaadiholidays` project on 2026-09-28.)
2. Copy `.env.example` to `.env.local` and fill it in.
3. `npm install && npm run dev` — <http://localhost:5200>
4. Sign in at `/admin` with an address in `TRIP_ADMIN_EMAILS`.

## Deploying

A **new** Vercel project, root directory `trip-portal`, domain
`trip.nawisaadi.com`. Set `PORTAL_BASE_URL` to that domain before printing any
QR code.

## The daily loop

1. `/admin` → **+ New trip** → customer name, destination, dates. This mints the
   `trip_code` (NST-YYMMDD-NNN, sayable on the phone) and the tracking token
   (192 bits, not guessable) and returns the link and QR immediately.
2. **Edit itinerary** → add days → add steps → add blocks. A day stays invisible
   to the customer until its "Show this day" box is ticked.
3. **Publish to customer**, then **Send on WhatsApp**.
4. During the trip, drive the status from the trip row: pick a stage, add a note
   like "Ahmed is waiting at Exit 3", save. The customer sees it on refresh.
5. **Invoices** → **+ New invoice** mints the next `NSI-YYYY-NNNN`. Add line
   items, record what has been paid, tick "Show to customer". Totals, balance and
   status are recomputed from the lines on every save — nobody types a total, so
   the portal can never contradict itself. The dashboard shows who still owes.
6. **Activity & history** shows what the customer has actually opened, and a
   database-level record of every edit and who made it.

## Verification

Three suites, all driving a real browser. Run them one at a time — applying a
migration while a suite runs makes PostgREST reload its schema cache mid-test,
and requests landing in that window fail for reasons unrelated to the code.

- `node scripts/verify-portal.mjs` — no data needed. Routing, the token guard,
  the sign-in redirect, and a scan of the built client bundle for the
  service-role key, server-only modules and PostgREST queries.
- `node scripts/e2e-live.mjs` — **writes to the database.** Signs in, creates a
  DEMO trip, checks the draft gate, moves progress, publishes, and checks what
  the customer sees on a phone-sized screen.
- `node scripts/e2e-editor.mjs` — **writes to the database.** Days, steps,
  blocks, the per-day draft gate, and invoice arithmetic checked to the fils
  between the admin and the customer.

The e2e suites need `.env.local` exported (`set -a; . ./.env.local; set +a`) and
a preview running on port 4201. They name everything they create `DEMO — …`;
clear them out with:

```sql
delete from trips where customer_id in
  (select id from trip_customers where full_name like 'DEMO — %');
delete from trip_customers where full_name like 'DEMO — %';
```

Check exit codes directly. `node … | tail` reports tail's exit code, not the
test's — a failing suite piped through tail exits 0.
