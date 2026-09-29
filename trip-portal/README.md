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

`src/lib/db.ts`, `trips.ts`, `auth.ts` and `audit.ts` are server-only and throw
on import if they ever reach the browser. `src/lib/types.ts` is the
client-safe half — components import from there.

## Setup

1. Run `supabase/migrations/0001_trip_portal.sql`, then
   `0002_invoices_and_hardening.sql` and `0003_guide_block.sql`, in the
   Supabase SQL editor. All are additive and namespaced; none touches the
   website's tables. (Already applied to the `nawisaadiholidays` project on
   2026-09-28.)
2. Copy `.env.example` to `.env.local` and fill it in.
3. `npm install && npm run dev` — <http://localhost:5200>
4. Sign in at `/admin` with an address in `TRIP_ADMIN_EMAILS`.

## Deploying

Live as the Vercel project `nawi-saadi-trip-portal` (root directory
`trip-portal`, framework Other) at <https://nawi-saadi-trip-portal.vercel.app>.
It is connected to this repo, so every push to `main` deploys it — and also
rebuilds the website, which is a separate project. Change `PORTAL_BASE_URL`
before printing QR codes if a custom domain is added.

## The daily loop

1. `/admin` → **+ New trip** → customer name, destination, dates. This mints the
   `trip_code` (NST-YYMMDD-NNN, sayable on the phone) and the tracking token
   (192 bits, not guessable) and returns the link and QR immediately.
2. **Edit itinerary** → add days → add steps → add blocks. A day stays invisible
   to the customer until its "Show this day" box is ticked.
   - **Pin a step** by searching a name, pasting a Google Maps link (short
     `maps.app.goo.gl` links work), or tapping the map — then drag the pin to
     the exact exit or kiosk. The customer sees the day's stops on one map,
     joined in order, and Google Maps / Apple Maps / Waze buttons on each.
     Search is OpenStreetMap's free geocoder: no key, no bill, one search a
     second.
   - **Photo guide** block: choose all the photos of the walk at once (they go
     in camera order), write one line under each, reorder with the arrows, and
     pin the meeting point. The customer swipes through it step by step and
     ends on the meeting point with its map, directions and the driver.
     New days are shown to the customer as soon as they are saved; untick
     "Show this day" to keep one hidden while writing it. If any day is hidden, the
     Itinerary tab says so, with a button to show them all.
3. **Publish to customer**, then **Share link** → **Send on WhatsApp**.
4. Nothing to update during the trip. Where each trip stands — starts in 12
   days, day 2 of 5, finished — is worked out from its dates, on the dashboard
   and on the customer's page. The portal shows what the office sends; it does
   not track the customer (no open counts, no progress percentage).
5. **Invoices** → **+ New invoice** mints the next `NSI-YYYY-NNNN`. Add line
   items, record what has been paid, tick "Show to customer". Totals, balance and
   status are recomputed from the lines on every save — nobody types a total, so
   the portal can never contradict itself. The dashboard shows who still owes.
   Each invoice downloads as a branded PDF — the customer from their link, the
   office from the editor (drafts carry a DRAFT watermark).
6. **Trip details** edits everything set at creation, sets the cover photo, and
   cancels (link stops working, record kept) or deletes the trip (every row and
   every file in storage). Each day can carry its own photo. A trip can also be
   deleted straight from its dashboard row (the bin icon), by typing its
   reference to confirm.
7. **Drivers** (`/admin/drivers`) — add once with photo, vehicle and plate, pick
   on any trip; edit, deactivate or delete.
8. **Edit history** is the database's own record of every edit and who made
   it.

## Verification

Five suites, all driving a real browser. Run them one at a time — applying a
migration while a suite runs makes PostgREST reload its schema cache mid-test,
and requests landing in that window fail for reasons unrelated to the code.

- `node scripts/verify-portal.mjs` — no data needed. Routing, the token guard,
  the sign-in redirect, and a scan of the built client bundle for the
  service-role key, server-only modules and PostgREST queries.
- `node scripts/e2e-live.mjs` — **writes to the database.** Signs in, creates a
  DEMO trip, checks the draft gate, publishes, and checks what the customer
  sees on a phone-sized screen — including that nothing about them is recorded.
- `node scripts/e2e-editor.mjs` — **writes to the database.** Days, steps,
  blocks, the per-day draft gate, invoice arithmetic checked to the fils
  between the admin and the customer, and uploads going straight to storage.
- `node scripts/e2e-crud.mjs` — **writes to the database.** Editing a trip,
  cover and day photos, invoice PDFs for customer and office (and a wrong link
  refused), the drivers page, and deleting a trip
  with proof its files leave storage. Saves screenshots to `scripts/__shot-*`.
- `node scripts/e2e-location.mjs` — **writes to the database.** Pins placed by
  search and by pasted link, a photo guide uploaded, reordered and swiped
  through on a phone, the route map and directions, a deleted guide taking its
  photos with it, and a trip deleted from the dashboard row.

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
