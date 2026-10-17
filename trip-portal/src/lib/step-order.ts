import { clockMinutes } from "./itinerary";

/**
 * Where a new item goes in its day: before the first item with a later time,
 * or at the end when it has no time or nothing is later.
 *
 * Office staff add things as they come in, not in the order they happen, so
 * the 07:00 packing list added after the 08:00 notice must still come first
 * in the plan the customer reads. Items without a time keep their place; only
 * timed items are compared.
 *
 * Positions are unique per day, so making room means moving the later items
 * down one, highest first, so no two ever share a number on the way. Server
 * use only; the caller has checked the session.
 */
export async function makeRoomFor(dayId: string, timeLabel: string): Promise<number> {
  const { select, update } = await import("./db");
  const steps = await select<{ id: string; step_number: number; time_label: string | null }[]>(
    `trip_steps?trip_day_id=eq.${dayId}&select=id,step_number,time_label&order=step_number.asc`,
  );
  const end = (steps.at(-1)?.step_number ?? 0) + 1;
  const at = clockMinutes(timeLabel);
  if (at === null) return end;
  const later = steps.find((s) => {
    const t = clockMinutes(s.time_label);
    return t !== null && t > at;
  });
  if (!later) return end;
  for (const s of [...steps].reverse()) {
    if (s.step_number < later.step_number) break;
    await update("trip_steps", `id=eq.${s.id}`, { step_number: s.step_number + 1 });
  }
  return later.step_number;
}
