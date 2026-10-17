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
5. Optional, for reading bookings and finding hotel photos: set
   `GEMINI_API_KEY` (reads uploaded flight tickets and hotel vouchers) and
   `GOOGLE_MAPS_API_KEY` (Places API (New), finds a hotel's photo by name; falls
   back to `GEMINI_API_KEY`). Both are read on the server only. Without them the
   editor still works; the reader and photo button just say they are not set up.

   In the itinerary editor, a **Flight** or **Hotel** block has an "upload a
   photo or PDF" box that fills the empty fields from the document. Check the
   "What the reader saw" transcript before saving. **Find hotel photo** fetches
   up to six photos from Google and stores copies in the private bucket with their
   photographer credit; upload your own if the match is wrong.

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

## Enhanced itinerary and document reader

The customer itinerary includes a journey overview, flight/stay filters, direct day
navigation, and a schedule linking to each stop. Flight cards separate departure
and arrival; hotel galleries open the existing keyboard/touch photo viewer.
The Today badge is only shown for a day whose date is today in Dubai.

The photo editor supports multiple uploads, previews, individual removal,
reordering and cover selection. Collections accept up to 20 photos, each up to
12 MB. Removing a photo detaches it from the block; it does not delete the
underlying storage object. Existing photographer credits are preserved.

Each day now has a **Build day** panel: choose Activity, Flight, Hotel stay or
Transfer, then enter its time, location, booking details and instructions in
one form. Optional activity photos stay with that stop. The **Day photo gallery**
below it accepts a separate collection for the whole day; save the gallery after
uploading or rearranging it. Its first photo becomes the customer's day thumbnail.
The advanced editor remains available for OCR and other content blocks.

Failed files can be retried individually without losing successful uploads.
Collapsing a day or switching editor tabs preserves unfinished work; leaving the
trip warns about unsaved gallery/composer changes. A failed activity save can be
retried using the same request ID, so it completes the same stop. Saves use several
REST writes, so an interrupted save can temporarily contain only some details.

The customer roadmap connects each day with its timed activities and includes
Flights, Stays, Transfers and Schedule views. Gallery-only steps do not count as
activities or appear in printed summaries. Unpublished days are excluded from the
entire customer response, including nested database relationships.

`node scripts/verify-photo-upload.mjs` checks bulk selection, failed-file retry,
ordering, cover choice, file limits and draft/save refresh behavior using mock
storage in an isolated browser fixture. It does not write to customer trips or
verify production storage permissions.

Booking OCR now presents editable suggestions before applying them to empty
fields. It never overwrites existing manual entries. Multi-leg tickets currently
extract the first flight only; add remaining flights as separate blocks.

Google Cloud Vision supports service-account credentials through either
`GOOGLE_APPLICATION_CREDENTIALS` (local absolute file path) or
`GOOGLE_SERVICE_ACCOUNT_JSON` (hosted secret environment variable). Credentials
are loaded only inside the server handler; do not add a JSON key to Git or use a
VITE-prefixed variable. Enable Cloud Vision API and billing for that project.
Replace previously exposed credentials before production use.

With Vision only, staff receive the transcript to copy into the form. Adding
`GEMINI_API_KEY` turns the transcript into editable booking suggestions. Without
a service account, Gemini continues to read the original document directly.
Vision's synchronous PDF reader covers at most the first five pages; the editor
shows this limitation. Documents are limited to 12 MB and remain private.

Google Places hotel search still requires `GOOGLE_MAPS_API_KEY` (or a Gemini API
key with Places API enabled). Service-account OCR credentials do not configure
Places. Manual hotel photo uploads work independently.

Provider reference: [Google Cloud Vision small-batch OCR](https://docs.cloud.google.com/vision/docs/file-small-batch).

## Hotel discovery and customer print view

In a hotel block, enter its name and city/address. Automatic discovery waits
1.5 seconds after typing and runs once per query while the collection is empty.
Staff can disable automatic discovery or trigger it manually. Google Places
returns up to six photos, a listing description, guest rating/review count,
address, phone and website when available. Multiple matching hotels require
a more specific address; review the match and photos before saving. Existing
booking fields are preserved. Hotel highlights show Google Maps attribution
and retrieval date; they are not live ratings or a hotel star classification.

Automatic lookup requires a configured Google Places API key and an enabled,
billed Places API project. The editor checks server capabilities and explicitly
shows when OCR or hotel lookup is not connected. These controls do not set up
external accounts or credentials. Richer Places fields can use different billing
tiers; see the official [field documentation](https://developers.google.com/maps/documentation/places/web-service/data-fields).

The customer page uses a wider desktop layout and offers Print / Save PDF.
Printing includes every published day and booking, independently of the selected
on-screen day. It is a text-focused itinerary summary; videos, maps and photo
galleries stay in the online version. Shared customer links remain private.
