/**
 * Portal analytics. Server-only, and deliberately small.
 *
 * What this records: that a trip link was opened, and which sections were
 * looked at. The operational need is real and specific — when a customer rings
 * to ask where their driver is, the office wants to know whether they have
 * actually opened the pickup instructions. That is worth exactly this much
 * measurement and no more.
 *
 * What it does not record, and must not be extended to record without a better
 * reason than curiosity: location, anything typed, or any identifier that
 * outlives the trip. The portal shows the customer a plain sentence saying the
 * office can see when they open it and which sections they viewed. Keeping that
 * sentence true is a constraint on this file.
 *
 * Nothing here ever throws into a caller. An analytics failure must not stop a
 * customer seeing their itinerary — measurement is the least important thing
 * this application does.
 */

import { insert, select } from "./db";

/** A trip's id from its token, or null. Cached per request by the caller. */
async function tripIdForToken(token: string): Promise<string | null> {
  if (!token || token.length < 32) return null;
  try {
    const rows = await select<{ id: string }[]>(
      `trips?tracking_token=eq.${encodeURIComponent(token)}&select=id&limit=1`,
    );
    return rows?.[0]?.id ?? null;
  } catch {
    return null;
  }
}

export async function recordView(
  tripId: string,
  event: string,
  detail: string | null,
  opts: { device?: string | null; sessionId?: string | null } = {},
): Promise<void> {
  try {
    await insert("trip_views", {
      trip_id: tripId,
      // Trimmed to the column's CHECK constraints rather than relying on them.
      // A value that violates a constraint is rejected as a 400 and the event is
      // lost; truncating here means a long block label still produces a usable
      // record instead of no record.
      event: event.slice(0, 40),
      detail: detail ? detail.slice(0, 200) : null,
      device: opts.device ? opts.device.slice(0, 20) : null,
      session_id: opts.sessionId ? opts.sessionId.slice(0, 64) : null,
    });
  } catch {
    /* see the file header: analytics never breaks the portal */
  }
}

/**
 * Same, addressed by token.
 *
 * Used by the engagement endpoint the browser calls. Resolving the token
 * server-side is what stops someone posting events against a trip id they
 * guessed — the ids are UUIDs and not secret, but the token is the only thing
 * the caller is supposed to hold, so it is the only thing accepted.
 */
export async function recordViewByToken(
  token: string,
  event: string,
  detail: string | null,
): Promise<void> {
  const tripId = await tripIdForToken(token);
  if (!tripId) return;
  await recordView(tripId, event, detail);
}

/* -------------------------------------------------------------------------
 * Admin reads
 * ---------------------------------------------------------------------- */

export type ViewRow = {
  id: number;
  created_at: string;
  event: string;
  detail: string | null;
  device: string | null;
  session_id: string | null;
};

/** The activity feed for one trip, newest first. */
export function viewsForTrip(tripId: string, limit = 200): Promise<ViewRow[]> {
  return select<ViewRow[]>(
    `trip_views?trip_id=eq.${tripId}&select=id,created_at,event,detail,device,session_id&order=created_at.desc&limit=${limit}`,
  );
}

/**
 * Anything that survives JSON.
 *
 * `Record<string, unknown>` is the natural type for a jsonb column and it does
 * not compile here: TanStack Start validates that a server function's return
 * value is serialisable, and `unknown` might not be. Naming the JSON shape
 * explicitly satisfies that check and is more honest — the column genuinely
 * cannot hold anything else.
 */
export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export type AuditRow = {
  id: number;
  created_at: string;
  table_name: string;
  row_id: string;
  action: string;
  changes: Record<string, Json>;
  actor: string | null;
};

/**
 * The change history for one trip.
 *
 * Written by database trigger, not by this application, so a future admin
 * screen cannot forget to record an edit. The case it exists for: a pickup
 * point is changed from Exit 2 to Exit 3, the customer waits at the wrong exit,
 * and the office needs to know who changed it and whether that happened before
 * or after the customer last opened the page.
 */
export function auditForTrip(tripId: string, limit = 100): Promise<AuditRow[]> {
  return select<AuditRow[]>(
    `trip_audit?trip_id=eq.${tripId}&select=*&order=created_at.desc&limit=${limit}`,
  );
}
