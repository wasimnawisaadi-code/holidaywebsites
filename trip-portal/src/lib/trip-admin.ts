import { createServerFn } from "@tanstack/react-start";

import { requireSession } from "./session";
import { UUID } from "./uploads";

/**
 * Staff actions used from more than one admin screen. Deleting a trip is on
 * both the dashboard row and the editor's details tab, and one implementation
 * means the two can never disagree about what "deleted" removes.
 */

/**
 * Deletes a trip for good: every day, step, block, progress entry, document,
 * invoice and page view, and every file in storage.
 *
 * Files first, then rows. The other order leaves photos and vouchers in the
 * bucket with no row pointing at them — unreachable, but not gone, and "deleted"
 * should mean deleted when it is a customer's passport-adjacent paperwork. The
 * audit trail is deliberately kept: it has no foreign key to the trip, so the
 * record of who deleted it, and when, survives the deletion.
 */
export const deleteTrip = createServerFn({ method: "POST" })
  .validator((tripId: string) => tripId)
  .handler(async ({ data: tripId }) => {
    const { email } = await requireSession();
    if (!UUID.test(tripId)) return { ok: false as const };
    const { select, remove, listObjects, deleteObjects } = await import("./db");

    const rows = await select<{ customer_id: string | null; trip_code: string }[]>(
      `trips?id=eq.${tripId}&select=customer_id,trip_code&limit=1`,
    );
    const trip = rows[0];
    if (!trip) return { ok: false as const };

    for (const bucket of ["trip-media", "trip-docs"] as const) {
      const paths = await listObjects(bucket, `${tripId}/`);
      await deleteObjects(bucket, paths);
    }
    await remove("trips", `id=eq.${tripId}`);

    // The customer row goes too, unless another trip still belongs to them.
    if (trip.customer_id) {
      const others = await select<{ id: string }[]>(
        `trips?customer_id=eq.${trip.customer_id}&select=id&limit=1`,
      );
      if (!others.length) await remove("trip_customers", `id=eq.${trip.customer_id}`);
    }
    console.info(`trip ${trip.trip_code} deleted by ${email}`);
    return { ok: true as const };
  });
