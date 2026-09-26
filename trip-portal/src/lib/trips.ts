/**
 * Trip reads. Server-only — everything here goes through db.ts.
 *
 * Types and the progress ladder live in `types.ts`, which is safe to import
 * from a component. Importing *this* file from a component pulls the
 * service-role client into the browser bundle and the page dies on hydration;
 * see the note at the top of types.ts for how that was found.
 */

import { select, signedUrl } from "./db";
import {
  stagePercent,
  type Block,
  type CustomerTrip,
  type Day,
  type Driver,
  type ProgressEntry,
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
  const dayRows = ((raw["trip_days"] as Record<string, unknown>[]) ?? [])
    .map((d) => d as unknown as Day & { trip_steps?: Record<string, unknown>[] })
    .filter((d) => d.published)
    .sort((a, b) => a.day_number - b.day_number);

  const days: Day[] = [];
  for (const d of dayRows) {
    const steps = ((d.trip_steps ?? []) as unknown[])
      .map((s) => s as Step & { trip_blocks?: Record<string, unknown>[] })
      .sort((a, b) => a.step_number - b.step_number);

    const outSteps: Step[] = [];
    for (const s of steps) {
      const blocks = ((s.trip_blocks ?? []) as unknown[])
        .map((b) => b as Block)
        .sort((a, b) => a.position - b.position);
      outSteps.push({ ...s, blocks: await Promise.all(blocks.map(signBlock)) });
    }

    days.push({
      ...d,
      coverUrl: await signedUrl("trip-media", d.cover_image ?? ""),
      steps: outSteps,
    });
  }

  const progress = await select<ProgressEntry[]>(
    `trip_progress?trip_id=eq.${trip.id}&visible=is.true` +
      `&select=id,stage,note,created_at,driver_id,visible&order=created_at.desc`,
  );

  // Drivers are fetched by the ids the blocks reference, plus any attached to a
  // progress entry — a driver can be named in the timeline without appearing as
  // a block, and a customer told "your driver has arrived" needs to know who by.
  const driverIds = new Set<string>();
  for (const d of days) {
    for (const s of d.steps) {
      for (const b of s.blocks) if (b.payload?.driverId) driverIds.add(b.payload.driverId);
    }
  }
  for (const p of progress) if (p.driver_id) driverIds.add(p.driver_id);

  const drivers: Driver[] = [];
  if (driverIds.size) {
    const list = await select<Driver[]>(
      `trip_drivers?id=in.(${[...driverIds].join(",")})` +
        `&select=id,full_name,photo,phone,whatsapp,vehicle,plate_number,languages`,
    );
    for (const dr of list) {
      drivers.push({ ...dr, photoUrl: await signedUrl("trip-media", dr.photo ?? "") });
    }
  }

  // staff_only never leaves the office, whatever the URL says.
  const docRows = await select<TripDocument[]>(
    `trip_documents?trip_id=eq.${trip.id}&visibility=neq.staff_only` +
      `&select=id,name,file_path,doc_type,visibility,position&order=position.asc`,
  );
  const documents: TripDocument[] = [];
  for (const doc of docRows) {
    documents.push({ ...doc, url: await signedUrl("trip-docs", doc.file_path) });
  }

  const currentStage = progress[0]?.stage ?? null;

  return {
    trip: { ...trip, heroUrl: await signedUrl("trip-media", trip.hero_image ?? "") },
    days,
    drivers,
    documents,
    progress,
    currentStage,
    percent: stagePercent(currentStage),
  };
}

/**
 * Turns the storage paths on a block into signed URLs.
 *
 * Done here rather than in the renderer because the renderer is a React
 * component and signing is an async network call. Every attempt to make those
 * two mix ends in a component that renders before its images resolve.
 */
async function signBlock(block: Block): Promise<Block> {
  const p = block.payload ?? {};
  const payload = { ...p };

  if (p.path) payload.url = await signedUrl("trip-media", p.path);
  if (p.poster) payload.posterUrl = await signedUrl("trip-media", p.poster);
  if (p.paths?.length) {
    payload.urls = await Promise.all(p.paths.map((path) => signedUrl("trip-media", path)));
  }
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
  progress: ProgressEntry[];
  drivers: Driver[];
} | null> {
  const rows = await select<Record<string, unknown>[]>(
    `trips?id=eq.${id}&select=${encodeURIComponent(TRIP_TREE)}&limit=1`,
  );
  const raw = rows?.[0];
  if (!raw) return null;

  const trip = raw as unknown as Trip;
  const days = ((raw["trip_days"] as Record<string, unknown>[]) ?? [])
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

  // The admin sees every document, staff_only included.
  const documents = await select<TripDocument[]>(
    `trip_documents?trip_id=eq.${id}&select=*&order=position.asc`,
  );
  const progress = await select<ProgressEntry[]>(
    `trip_progress?trip_id=eq.${id}&select=*&order=created_at.desc`,
  );
  const drivers = await select<Driver[]>(
    `trip_drivers?active=is.true&select=id,full_name,photo,phone,whatsapp,vehicle,plate_number,languages&order=full_name.asc`,
  );

  return { trip, days, documents, progress, drivers };
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
