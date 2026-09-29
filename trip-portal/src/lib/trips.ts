/**
 * Trip reads. Server-only — everything here goes through db.ts.
 *
 * Types live in `types.ts`, which is safe to import
 * from a component. Importing *this* file from a component pulls the
 * service-role client into the browser bundle and the page dies on hydration;
 * see the note at the top of types.ts for how that was found.
 */

import { select, signedUrl } from "./db";
import {
  type Block,
  type CustomerTrip,
  type Day,
  type Driver,
  type Invoice,
  type InvoiceItem,
  type Step,
  type Trip,
  type TripDocument,
  type TripOverview,
} from "./types";

/** PostgREST embed for the whole tree, so one round trip fetches a trip. */
const TRIP_TREE =
  "*,customer:trip_customers(full_name,phone,whatsapp)," +
  "trip_days(*,trip_steps(*,trip_blocks(*)))";

/**
 * Loads everything a customer's portal needs, or null.
 *
 * Returns null for three different situations on purpose — token not found,
 * trip not published, trip cancelled — because the portal must render the same
 * "we can't find this trip" page for all three. Distinguishing them would turn
 * this into an oracle: someone feeding it guessed tokens could learn which ones
 * exist, which is precisely the information the token is protecting.
 */
export async function tripByToken(token: string): Promise<CustomerTrip | null> {
  // Below the schema's minimum length, a token cannot exist. Skipping the query
  // also stops a bot probing /t/1, /t/2 from costing a database round trip each.
  if (!token || token.length < 32) return null;

  /*
   * Four round trips, whatever the size of the trip.
   *
   * The first version awaited everything in sequence — every day's cover, every
   * block's photo, every driver's picture and every document was signed one
   * after another, and each signing is its own network call to Supabase. A
   * five-day trip with a few photos a day came to thirty-odd round trips to the
   * database region, one after another, on the page a customer opens on airport
   * wifi. The work here is the same; only the waiting is batched:
   *
   *   1. the trip tree, which needs the token
   *   2. documents and invoices together, which need the trip id
   *   3. drivers, which need ids found in the blocks
   *   4. every signed URL in the page, all at once
   */

  // ---- 1 ----
  const rows = await select<Record<string, unknown>[]>(
    `trips?tracking_token=eq.${encodeURIComponent(token)}&select=${encodeURIComponent(TRIP_TREE)}&limit=1`,
  );
  const raw = rows?.[0];
  if (!raw) return null;

  const trip = raw as unknown as Trip;
  if (!trip.published_at) return null;
  if (trip.status === "cancelled") return null;

  // Only published days reach the customer. An unpublished day is one the office
  // is still writing, and a half-written day is worse than no day at all — it
  // reads as though the trip has a hole in it.
  const dayRows = shapeDays((raw["trip_days"] as Record<string, unknown>[]) ?? []).filter(
    (d) => d.published,
  );

  // ---- 2 ----
  const [docRows, invoices] = await Promise.all([
    // staff_only never leaves the office, whatever the URL says.
    select<TripDocument[]>(
      `trip_documents?trip_id=eq.${trip.id}&visibility=neq.staff_only` +
        `&select=id,name,file_path,doc_type,visibility,position&order=position.asc`,
    ),
    // Only published, non-void invoices. A draft invoice appearing in someone's
    // portal mid-negotiation is the kind of mistake that costs a booking.
    select<Invoice[]>(
      `trip_invoices?trip_id=eq.${trip.id}&published=is.true&status=neq.void` +
        `&select=*,items:trip_invoice_items(*)&order=issued_date.desc`,
    ),
  ]);
  sortInvoiceItems(invoices);

  // ---- 3 ----
  // Drivers are fetched by the ids the blocks reference — a driver card, or the
  // driver waiting at the end of a photo guide.
  const driverIds = new Set<string>();
  for (const d of dayRows) {
    for (const s of d.steps) {
      for (const b of s.blocks) if (b.payload?.driverId) driverIds.add(b.payload.driverId);
    }
  }

  const driverRows = driverIds.size
    ? await select<Driver[]>(
        `trip_drivers?id=in.(${[...driverIds].join(",")})` +
          `&select=id,full_name,photo,phone,whatsapp,vehicle,plate_number,languages`,
      )
    : [];

  // ---- 4 ----
  // One Promise.all across the whole page. Nothing inside it depends on
  // anything else inside it, so there is no reason for any of it to wait.
  const [days, drivers, documents, heroUrl] = await Promise.all([
    Promise.all(
      dayRows.map(async (d) => ({
        ...d,
        coverUrl: await signedUrl("trip-media", d.cover_image ?? ""),
        steps: await Promise.all(
          d.steps.map(async (s) => ({ ...s, blocks: await Promise.all(s.blocks.map(signBlock)) })),
        ),
      })),
    ),
    Promise.all(
      driverRows.map(async (dr) => ({
        ...dr,
        photoUrl: await signedUrl("trip-media", dr.photo ?? ""),
      })),
    ),
    Promise.all(
      docRows.map(async (doc) => ({ ...doc, url: await signedUrl("trip-docs", doc.file_path) })),
    ),
    signedUrl("trip-media", trip.hero_image ?? ""),
  ]);

  return { trip: { ...trip, heroUrl }, days, drivers, documents, invoices };
}

/** Days → steps → blocks, each level sorted. Shared by the customer and admin reads. */
function shapeDays(rawDays: Record<string, unknown>[]): Day[] {
  return rawDays
    .map((d) => {
      const day = d as unknown as Day & { trip_steps?: Record<string, unknown>[] };
      const steps = ((day.trip_steps ?? []) as unknown[])
        .map((s) => {
          const step = s as unknown as Step & { trip_blocks?: Record<string, unknown>[] };
          const blocks = ((step.trip_blocks ?? []) as unknown[])
            .map((b) => b as Block)
            .sort((a, b) => a.position - b.position);
          return { ...step, blocks };
        })
        .sort((a, b) => a.step_number - b.step_number);
      return { ...day, steps };
    })
    .sort((a, b) => a.day_number - b.day_number);
}

function sortInvoiceItems(invoices: Invoice[]): void {
  for (const inv of invoices) {
    inv.items = (inv.items ?? []).sort((a: InvoiceItem, b: InvoiceItem) => a.position - b.position);
  }
}

/**
 * Turns the storage paths on a block into signed URLs.
 *
 * Done here rather than in the renderer because the renderer is a React
 * component and signing is an async network call. Every attempt to make those
 * two mix ends in a component that renders before its images resolve.
 */
export async function signBlock(block: Block): Promise<Block> {
  const p = block.payload ?? {};
  // A video block carries both a clip and a poster; sign them together.
  const [url, posterUrl, urls, steps] = await Promise.all([
    p.path ? signedUrl("trip-media", p.path) : Promise.resolve(undefined),
    p.poster ? signedUrl("trip-media", p.poster) : Promise.resolve(undefined),
    p.paths?.length
      ? Promise.all(p.paths.map((path) => signedUrl("trip-media", path)))
      : Promise.resolve(undefined),
    // A photo guide: each step's photo, all at once.
    p.steps?.length
      ? Promise.all(
          p.steps.map(async (s) => ({
            ...s,
            url: s.path ? await signedUrl("trip-media", s.path) : null,
          })),
        )
      : Promise.resolve(undefined),
  ]);

  const payload = { ...p };
  if (url !== undefined) payload.url = url;
  if (posterUrl !== undefined) payload.posterUrl = posterUrl;
  if (urls !== undefined) payload.urls = urls;
  if (steps !== undefined) payload.steps = steps;
  return { ...block, payload };
}

/* -------------------------------------------------------------------------
 * Admin reads
 * ---------------------------------------------------------------------- */

/** The admin list. Ordered so the trips travelling soonest are at the top. */
export function listTrips(limit = 200): Promise<TripOverview[]> {
  return select<TripOverview[]>(`trip_overview?select=*&order=start_date.desc&limit=${limit}`);
}

/** One trip with its full tree, published or not — what the editor reads. */
export async function tripForAdmin(id: string): Promise<{
  trip: Trip;
  days: Day[];
  documents: TripDocument[];
  drivers: Driver[];
  invoices: Invoice[];
} | null> {
  // All four reads need only the id the caller already has, so they go out
  // together. Sequentially this was four round trips to the database region on
  // every single save in the editor — about three seconds during which the
  // office watched their change not appear.
  const [rows, documents, drivers, invoices] = await Promise.all([
    select<Record<string, unknown>[]>(
      `trips?id=eq.${id}&select=${encodeURIComponent(TRIP_TREE)}&limit=1`,
    ),
    // The admin sees every document, staff_only included.
    select<TripDocument[]>(`trip_documents?trip_id=eq.${id}&select=*&order=position.asc`),
    select<Driver[]>(
      `trip_drivers?active=is.true&select=id,full_name,photo,phone,whatsapp,vehicle,plate_number,languages&order=full_name.asc`,
    ),
    // The office sees drafts and voided invoices too.
    select<Invoice[]>(
      `trip_invoices?trip_id=eq.${id}&select=*,items:trip_invoice_items(*)&order=issued_date.desc`,
    ),
  ]);
  const raw = rows?.[0];
  if (!raw) return null;

  const trip = raw as unknown as Trip;
  const days = shapeDays((raw["trip_days"] as Record<string, unknown>[]) ?? []);
  sortInvoiceItems(invoices);

  return { trip, days, documents, drivers, invoices };
}

/* -------------------------------------------------------------------------
 * Identifiers
 * ---------------------------------------------------------------------- */

/**
 * A 48-character hex token — 192 bits.
 *
 * Longer than strictly necessary, because it is the only thing protecting a
 * customer's documents and the cost of extra length is a URL nobody types by
 * hand anyway: they scan the QR or tap the WhatsApp link.
 */
export function newToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * The office-facing reference: NST-YYMMDD-NNN.
 *
 * Sequential within a start date, which is what makes it sayable over the
 * phone. Emphatically not the tracking token — a guessable identifier is fine
 * for a reference and fatal for a credential. See the migration's note.
 */
export async function nextTripCode(startDate: string): Promise<string> {
  const d = new Date(startDate);
  const stamp =
    String(d.getUTCFullYear()).slice(2) +
    String(d.getUTCMonth() + 1).padStart(2, "0") +
    String(d.getUTCDate()).padStart(2, "0");
  const prefix = `NST-${stamp}-`;

  const existing = await select<{ trip_code: string }[]>(
    `trips?trip_code=like.${encodeURIComponent(prefix + "*")}&select=trip_code&order=trip_code.desc&limit=1`,
  );
  const last = existing?.[0]?.trip_code;
  const n = last ? Number(last.slice(prefix.length)) + 1 : 1;
  return prefix + String(Number.isFinite(n) ? n : 1).padStart(3, "0");
}

/* -------------------------------------------------------------------------
 * Invoice PDFs
 *
 * Small, targeted reads rather than tripByToken: a PDF needs one invoice and a
 * few trip facts, not every day, block and signed photo URL of the trip.
 * ---------------------------------------------------------------------- */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type InvoiceTripFacts = {
  invoice: Invoice;
  tripId: string;
  tripCode: string;
  destination: string;
  startDate: string;
  endDate: string;
  customerName: string | null;
  customerPhone: string | null;
};

const INVOICE_TRIP =
  "id,trip_code,destination,start_date,end_date,published_at,status,customer:trip_customers(full_name,phone)";

function toFacts(trip: Record<string, unknown>, invoice: Invoice): InvoiceTripFacts {
  const customer = trip["customer"] as { full_name?: string; phone?: string | null } | null;
  return {
    invoice,
    tripId: String(trip["id"]),
    tripCode: String(trip["trip_code"]),
    destination: String(trip["destination"]),
    startDate: String(trip["start_date"]),
    endDate: String(trip["end_date"]),
    customerName: customer?.full_name ?? null,
    customerPhone: customer?.phone ?? null,
  };
}

/**
 * The invoice a customer may download, or null.
 *
 * Every rule the portal page applies is applied again here, because this URL
 * can be requested on its own: the token must match a published, live trip, and
 * the invoice must belong to that trip, be published, and not be cancelled. An
 * invoice id copied from one customer's link does nothing under another's token.
 */
export async function invoiceForToken(
  token: string,
  invoiceId: string,
): Promise<InvoiceTripFacts | null> {
  if (!token || token.length < 32 || !UUID_RE.test(invoiceId)) return null;

  const trips = await select<Record<string, unknown>[]>(
    `trips?tracking_token=eq.${encodeURIComponent(token)}&select=${encodeURIComponent(INVOICE_TRIP)}&limit=1`,
  );
  const trip = trips?.[0];
  if (!trip || !trip["published_at"] || trip["status"] === "cancelled") return null;

  const invoices = await select<Invoice[]>(
    `trip_invoices?id=eq.${invoiceId}&trip_id=eq.${String(trip["id"])}&published=is.true&status=neq.void` +
      `&select=*,items:trip_invoice_items(*)&limit=1`,
  );
  const invoice = invoices?.[0];
  if (!invoice) return null;
  sortInvoiceItems([invoice]);
  return toFacts(trip, invoice);
}

/** Any invoice, for the office — drafts and cancelled ones included. */
export async function invoiceForAdmin(invoiceId: string): Promise<InvoiceTripFacts | null> {
  if (!UUID_RE.test(invoiceId)) return null;
  const invoices = await select<(Invoice & { trip_id: string })[]>(
    `trip_invoices?id=eq.${invoiceId}&select=*,items:trip_invoice_items(*)&limit=1`,
  );
  const invoice = invoices?.[0];
  if (!invoice) return null;
  const trips = await select<Record<string, unknown>[]>(
    `trips?id=eq.${invoice.trip_id}&select=${encodeURIComponent(INVOICE_TRIP)}&limit=1`,
  );
  const trip = trips?.[0];
  if (!trip) return null;
  sortInvoiceItems([invoice]);
  return toFacts(trip, invoice);
}
