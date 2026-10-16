import { createServerFn } from "@tanstack/react-start";
import { requireSession } from "./session";
import { UUID } from "./uploads";
import type { Block, Step } from "./types";

export const saveDayGallery = createServerFn({ method: "POST" })
  .validator((input: { tripId: string; dayId: string; paths: string[] }) => input)
  .handler(async ({ data }) => {
    await requireSession();
    if (
      !UUID.test(data.tripId) ||
      !UUID.test(data.dayId) ||
      !Array.isArray(data.paths) ||
      data.paths.length > 20 ||
      data.paths.some(
        (p) => typeof p !== "string" || !p.startsWith(`${data.tripId}/`) || p.includes(".."),
      )
    )
      throw new Error("Invalid day photos");
    const { select, insert, update } = await import("./db");
    const days = await select<{ id: string }[]>(
      `trip_days?id=eq.${data.dayId}&trip_id=eq.${data.tripId}&select=id`,
    );
    if (!days.length) throw new Error("Day not found in this trip");
    const steps = await select<(Step & { trip_blocks: Block[] })[]>(
      `trip_steps?trip_day_id=eq.${data.dayId}&select=*,trip_blocks(*)&order=step_number.asc`,
    );
    let step = steps.find((s) =>
      s.trip_blocks.some((b) => b.kind === "gallery" && b.payload.dayGallery),
    );
    const block = step?.trip_blocks.find((b) => b.kind === "gallery" && b.payload.dayGallery);
    if (!step) step = steps.find((s) => s.title === "Day photos" && !s.trip_blocks.length);
    if (!step && !data.paths.length) return { ok: true };
    if (!step) {
      const created = await insert<{ id: string }[]>("trip_steps", {
        trip_day_id: data.dayId,
        step_number: Math.max(0, ...steps.map((s) => s.step_number)) + 1,
        title: "Day photos",
      });
      step = { id: created[0]!.id } as Step & { trip_blocks: Block[] };
    }
    const payload = {
      paths: [...new Set(data.paths)],
      dayGallery: true,
      caption: "Highlights of your day",
    };
    if (block) await update("trip_blocks", `id=eq.${block.id}`, { payload });
    else
      await insert("trip_blocks", { trip_step_id: step.id, kind: "gallery", position: 0, payload });
    return { ok: true };
  });
