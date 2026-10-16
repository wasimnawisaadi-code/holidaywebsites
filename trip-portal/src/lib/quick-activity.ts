import { createServerFn } from "@tanstack/react-start";
import { requireSession } from "./session";
import { UUID } from "./uploads";
import { isLatLng } from "./geo";
import type { BlockKind, BlockPayload } from "./types";

export type QuickActivityKind = "activity" | "flight" | "hotel" | "transfer";
export type QuickActivityDraft = {
  requestId: string;
  tripId: string;
  dayId: string;
  kind: QuickActivityKind;
  title: string;
  time: string;
  duration: string;
  location: string;
  latitude?: number | undefined;
  longitude?: number | undefined;
  description: string;
  fields: Record<string, string>;
  paths: string[];
};

/** One form saves a scheduled stop and its booking details. A stable request ID
 * makes a retry finish the same stop if a response is lost between writes. */
export const saveQuickActivity = createServerFn({ method: "POST" })
  .validator((input: QuickActivityDraft) => input)
  .handler(async ({ data }) => {
    await requireSession();
    const text = (value: unknown, max = 500): string => {
      if (typeof value !== "string" || value.length > max) throw new Error("Invalid activity");
      return value.trim();
    };
    if (
      !data ||
      !UUID.test(data.tripId) ||
      !UUID.test(data.dayId) ||
      !UUID.test(data.requestId) ||
      !["activity", "flight", "hotel", "transfer"].includes(data.kind) ||
      !data.fields ||
      typeof data.fields !== "object" ||
      Array.isArray(data.fields) ||
      !Array.isArray(data.paths) ||
      data.paths.length > 20 ||
      data.paths.some(
        (path) =>
          typeof path !== "string" ||
          path.length > 1000 ||
          !path.startsWith(`${data.tripId}/`) ||
          path.includes("..") ||
          path.includes("\\"),
      )
    )
      throw new Error("Invalid activity");
    const title = text(data.title, 200);
    if (!title) throw new Error("Add a title");
    const time = text(data.time, 100);
    const duration = text(data.duration, 100);
    const location = text(data.location);
    const description = text(data.description, 6000);
    const payload: BlockPayload = {};
    const allowed =
      data.kind === "flight"
        ? [
            "airline",
            "flightNumber",
            "date",
            "fromAirport",
            "toAirport",
            "departTime",
            "arriveTime",
            "terminal",
            "baggage",
            "reference",
          ]
        : data.kind === "hotel"
          ? ["name", "address", "checkIn", "checkOut", "roomType", "guests", "reference", "phone"]
          : data.kind === "transfer"
            ? ["driverId", "pickupTime", "pickupLocation", "dropoffLocation", "transferNotes"]
            : [];
    for (const key of allowed) {
      const value = text(data.fields[key] ?? "", key === "transferNotes" ? 2000 : 500);
      if (value) Object.assign(payload, { [key]: value });
    }
    if (data.kind === "hotel") payload.name ||= title;
    if (data.kind === "transfer") {
      payload.pickupTime ||= time;
      payload.pickupLocation ||= location;
    }

    const { select, insert, update } = await import("./db");
    const days = await select<{ id: string }[]>(
      `trip_days?id=eq.${data.dayId}&trip_id=eq.${data.tripId}&select=id`,
    );
    if (!days.length) throw new Error("Day not found in this trip");
    if (payload.driverId) {
      if (!UUID.test(payload.driverId)) throw new Error("Invalid driver");
      const drivers = await select<{ id: string }[]>(
        `trip_drivers?id=eq.${payload.driverId}&select=id`,
      );
      if (!drivers.length) throw new Error("Driver not found");
    }

    // Derive server-owned IDs for the step and blocks, independent of their
    // contents, so edits after an error can be retried without duplicate stops.
    const { createHash } = await import("node:crypto");
    const stableId = (part: string) => {
      const bytes = createHash("sha256")
        .update(`quick-activity:${data.tripId}:${data.dayId}:${data.requestId}:${part}`)
        .digest();
      bytes[6] = (bytes[6]! & 0x0f) | 0x40;
      bytes[8] = (bytes[8]! & 0x3f) | 0x80;
      const hex = bytes.subarray(0, 16).toString("hex");
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    };
    const stepId = stableId("step");
    const stepRow = {
      trip_day_id: data.dayId,
      title,
      time_label: time || null,
      duration: duration || null,
      location_name: location || null,
      description: description || null,
      latitude: isLatLng(data.latitude, data.longitude) ? data.latitude : null,
      longitude: isLatLng(data.latitude, data.longitude) ? data.longitude : null,
    };
    type SavedStep = { id: string; trip_day_id: string };
    const readStep = () => select<SavedStep[]>(`trip_steps?id=eq.${stepId}&select=id,trip_day_id`);
    let existing = (await readStep())[0];
    if (!existing) {
      // Another staff member may append a stop at the same moment. Re-read the
      // last position on a unique-order collision, at most three attempts.
      for (let attempt = 0; attempt < 3; attempt++) {
        const last = await select<{ step_number: number }[]>(
          `trip_steps?trip_day_id=eq.${data.dayId}&select=step_number&order=step_number.desc&limit=1`,
        );
        try {
          await insert("trip_steps", {
            id: stepId,
            step_number: (last[0]?.step_number ?? 0) + 1,
            ...stepRow,
          });
          existing = { id: stepId, trip_day_id: data.dayId };
          break;
        } catch (error) {
          existing = (await readStep())[0];
          if (existing) break;
          if (!(error instanceof Error) || !error.message.includes("23505") || attempt === 2)
            throw error;
        }
      }
    }
    if (!existing || existing.trip_day_id !== data.dayId) throw new Error("Activity not found");
    await update("trip_steps", `id=eq.${stepId}&trip_day_id=eq.${data.dayId}`, stepRow);

    const saveBlock = async (
      part: string,
      kind: BlockKind,
      value: BlockPayload,
      position: number,
    ) => {
      const id = stableId(part);
      const row = { trip_step_id: stepId, kind, payload: value, position };
      const existingBlocks = await select<{ trip_step_id: string }[]>(
        `trip_blocks?id=eq.${id}&select=trip_step_id`,
      );
      if (existingBlocks.length) {
        if (existingBlocks[0]!.trip_step_id !== stepId) throw new Error("Invalid activity content");
        await update("trip_blocks", `id=eq.${id}&trip_step_id=eq.${stepId}`, row);
      } else {
        try {
          await insert("trip_blocks", { id, ...row });
        } catch (error) {
          const saved = await select<{ trip_step_id: string }[]>(
            `trip_blocks?id=eq.${id}&select=trip_step_id`,
          );
          if (saved[0]?.trip_step_id !== stepId) throw error;
          await update("trip_blocks", `id=eq.${id}&trip_step_id=eq.${stepId}`, row);
        }
      }
    };
    if (data.kind !== "activity")
      await saveBlock("booking", data.kind === "transfer" ? "driver" : data.kind, payload, 0);
    const oldPhotos = data.paths.length
      ? []
      : await select<{ id: string }[]>(
          `trip_blocks?id=eq.${stableId("photos")}&trip_step_id=eq.${stepId}&select=id`,
        );
    if (data.paths.length || oldPhotos.length)
      await saveBlock("photos", "gallery", { paths: [...new Set(data.paths)], caption: title }, 1);
    return { ok: true, stepId };
  });
