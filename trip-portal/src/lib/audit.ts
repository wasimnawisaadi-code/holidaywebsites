/**
 * The change history for a trip. Server-only.
 *
 * The portal used to record when a customer opened their link and which
 * sections they looked at. The owner decided against it — the office sends
 * the customer information; it does not watch them read it — so that is gone,
 * and what remains here is the record of the office's own edits.
 */

import { select } from "./db";

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
