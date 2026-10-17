import { createServerFn } from "@tanstack/react-start";
import { requireSession } from "./session";
import { UUID } from "./uploads";
import type { Block, Step } from "./types";

export const saveDayGallery = createServerFn({ method: "POST" })
  .validator((input: { tripId: string; dayId: string; paths: string[] }) => input)
  .handler(async ({ data }) => {
    await requireSession();
    if (
      !data ||
      !UUID.test(data.tripId) ||
      !UUID.test(data.dayId) ||
      !Array.isArray(data.paths) ||
      data.paths.length > 20 ||
      data.paths.some(
        (p) =>
          typeof p !== "string" ||
          p.length > 1000 ||
          !p.startsWith(`${data.tripId}/`) ||
          p.includes("..") ||
          p.includes("\\"),
      )
    )
      throw new Error("Invalid day photos");
    const { select, insert, update } = await import("./db");
    const days = await select<{ id: string }[]>(
      `trip_days?id=eq.${data.dayId}&trip_id=eq.${data.tripId}&select=id`,
    );
    if (!days.length) throw new Error("Day not found in this trip");
    type GalleryStep = Pick<
      Step,
      | "id"
      | "step_number"
      | "title"
      | "description"
      | "time_label"
      | "duration"
      | "location_name"
      | "latitude"
      | "longitude"
    > & { trip_blocks: Block[] };
    const steps = await select<GalleryStep[]>(
      `trip_steps?trip_day_id=eq.${data.dayId}&select=*,trip_blocks(*)&order=step_number.asc`,
    );
    const existingStep = steps.find((s) =>
      s.trip_blocks.some((b) => b.kind === "gallery" && b.payload.dayGallery),
    );
    const existingBlock = existingStep?.trip_blocks.find(
      (b) => b.kind === "gallery" && b.payload.dayGallery,
    );
    const payload = {
      paths: [...new Set(data.paths)],
      dayGallery: true,
      caption: "Highlights of your day",
    };
    // Keep older gallery IDs and their step placement. The stable IDs below are
    // only for new galleries and retries; no existing content is moved/deleted.
    if (existingStep && existingBlock) {
      await update("trip_blocks", `id=eq.${existingBlock.id}&trip_step_id=eq.${existingStep.id}`, {
        payload,
      });
      return { ok: true };
    }

    const { createHash } = await import("node:crypto");
    const stableId = (part: string) => {
      const bytes = createHash("sha256")
        .update(`day-gallery:${data.tripId}:${data.dayId}:${part}`)
        .digest();
      bytes[6] = (bytes[6]! & 0x0f) | 0x40;
      bytes[8] = (bytes[8]! & 0x3f) | 0x80;
      const hex = bytes.subarray(0, 16).toString("hex");
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    };
    const blockId = stableId("block");
    type SavedBlock = Pick<Block, "id" | "kind" | "payload"> & { trip_step_id: string };
    const readCreatedBlock = async () => {
      const blocks = await select<SavedBlock[]>(
        `trip_blocks?id=eq.${blockId}&select=id,trip_step_id,kind,payload`,
      );
      if (!blocks[0]) return null;
      const block = blocks[0];
      const owner = await select<{ id: string }[]>(
        `trip_steps?id=eq.${block.trip_step_id}&trip_day_id=eq.${data.dayId}&select=id`,
      );
      if (!owner.length || block.kind !== "gallery" || block.payload.dayGallery !== true)
        throw new Error("Invalid day gallery");
      return block;
    };
    const concurrentBlock = await readCreatedBlock();
    if (concurrentBlock) {
      await update(
        "trip_blocks",
        `id=eq.${blockId}&trip_step_id=eq.${concurrentBlock.trip_step_id}`,
        { payload },
      );
      return { ok: true };
    }
    if (!data.paths.length) return { ok: true };

    let stepId = steps.find(
      (s) =>
        s.title === "Day photos" &&
        !s.trip_blocks.length &&
        !s.description &&
        !s.time_label &&
        !s.duration &&
        !s.location_name &&
        s.latitude == null &&
        s.longitude == null,
    )?.id;
    if (!stepId) {
      stepId = stableId("step");
      const readCreatedStep = async () => {
        const rows = await select<{ id: string; trip_day_id: string }[]>(
          `trip_steps?id=eq.${stepId}&select=id,trip_day_id`,
        );
        if (rows[0] && rows[0].trip_day_id !== data.dayId) throw new Error("Invalid gallery day");
        return rows[0];
      };
      if (!(await readCreatedStep())) {
        for (let attempt = 0; attempt < 3; attempt++) {
          const last = await select<{ step_number: number }[]>(
            `trip_steps?trip_day_id=eq.${data.dayId}&select=step_number&order=step_number.desc&limit=1`,
          );
          try {
            await insert("trip_steps", {
              id: stepId,
              trip_day_id: data.dayId,
              step_number: (last[0]?.step_number ?? 0) + 1,
              title: "Day photos",
            });
            break;
          } catch (error) {
            // Also handles a successful insert whose response was lost. A
            // different activity can take the same step number: re-read it.
            if (await readCreatedStep()) break;
            if (!(error instanceof Error) || !error.message.includes("23505") || attempt === 2)
              throw error;
          }
        }
      }
    }
    try {
      await insert("trip_blocks", {
        id: blockId,
        trip_step_id: stepId,
        kind: "gallery",
        position: 0,
        payload,
      });
    } catch (error) {
      // Both callers may have reused the same empty legacy step, or one may
      // have received no response. The primary key allows only one gallery.
      const saved = await readCreatedBlock();
      if (!saved) throw error;
      await update("trip_blocks", `id=eq.${blockId}&trip_step_id=eq.${saved.trip_step_id}`, {
        payload,
      });
    }
    return { ok: true };
  });
