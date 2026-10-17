import { createServerFn } from "@tanstack/react-start";
import { requireSession } from "./session";
import { UUID } from "./uploads";
import { nightsBetween } from "./booking-fill";
import { isLatLng } from "./geo";
import { TOUR_GUIDE_ROLE } from "./itinerary";
import type { BlockKind, BlockPayload } from "./types";

export type QuickActivityKind = "activity" | "flight" | "hotel" | "transfer" | "tourguide";
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
      !["activity", "flight", "hotel", "transfer", "tourguide"].includes(data.kind) ||
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
            "seat",
            "baggage",
            "reference",
          ]
        : data.kind === "hotel"
          ? [
              "name",
              "address",
              "checkIn",
              "checkOut",
              "nights",
              "roomType",
              "guests",
              "reference",
              "phone",
              // Filled by the hotel finder from Google, not typed.
              "hotelSummary",
              "hotelAddress",
              "hotelRating",
              "hotelReviewCount",
              "hotelWebsite",
              "hotelMapsUrl",
              "hotelSourceName",
              "hotelFetchedAt",
              "credit",
            ]
          : data.kind === "transfer"
            ? ["driverId", "pickupTime", "pickupLocation", "dropoffLocation", "transferNotes"]
            : data.kind === "tourguide"
              ? ["name", "phone", "whatsapp", "languages", "text"]
              : [];
    for (const key of allowed) {
      const value = text(
        data.fields[key] ?? "",
        key === "transferNotes" || key === "text" ? 2000 : 500,
      );
      if (value) Object.assign(payload, { [key]: value });
    }
    if (data.kind === "hotel") {
      payload.name ||= title;
      // Links are rendered as buttons on the customer's page: web addresses only.
      for (const key of ["hotelWebsite", "hotelMapsUrl"] as const) {
        if (payload[key] && !/^https?:\/\//i.test(payload[key]!)) delete payload[key];
      }
      if (!payload.nights) {
        const nights = nightsBetween(payload.checkIn, payload.checkOut);
        if (nights) payload.nights = String(nights);
      }
      // A hotel's photos belong on its own card, beside the credit Google
      // requires, rather than in a separate gallery underneath.
      if (data.paths.length) payload.paths = [...new Set(data.paths)];
    }
    if (data.kind === "tourguide") {
      // A guide is a contact the customer can call, marked so every summary
      // of the day lists them as the tour guide.
      payload.role = TOUR_GUIDE_ROLE;
      if (!payload.name) throw new Error("Add the guide's name");
      payload.whatsapp ||= payload.phone;
    }
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
      await saveBlock(
        "booking",
        data.kind === "transfer" ? "driver" : data.kind === "tourguide" ? "contact" : data.kind,
        payload,
        0,
      );
    // Hotel photos are already on the hotel card above.
    const galleryPaths = data.kind === "hotel" ? [] : data.paths;
    const oldPhotos = galleryPaths.length
      ? []
      : await select<{ id: string }[]>(
          `trip_blocks?id=eq.${stableId("photos")}&trip_step_id=eq.${stepId}&select=id`,
        );
    if (galleryPaths.length || oldPhotos.length)
      await saveBlock(
        "photos",
        "gallery",
        { paths: [...new Set(galleryPaths)], caption: title },
        1,
      );
    return { ok: true, stepId };
  });
