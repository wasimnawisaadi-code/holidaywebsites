import type { Day, Step } from "./types";

/** A gallery is day content, never a timed activity or a stop on the route. */
export const isDayGalleryStep = (step: Step): boolean =>
  step.blocks.length > 0 && step.blocks.every((b) => b.kind === "gallery" && b.payload.dayGallery);

export const activitySteps = (day: Day): Step[] => day.steps.filter((s) => !isDayGalleryStep(s));

export const dayGalleryBlocks = (day: Day) =>
  day.steps.flatMap((s) => s.blocks).filter((b) => b.kind === "gallery" && b.payload.dayGallery);

export function galleryCover(day: Day): string | null {
  return (
    dayGalleryBlocks(day)
      .flatMap((b) => b.payload.urls ?? [])
      .find((url) => Boolean(url)) ?? null
  );
}

export function activityTime(step: Step): string | null {
  const booking = step.blocks.find(
    (b) => b.kind === "flight" || b.kind === "driver" || b.kind === "hotel",
  );
  return step.time_label || booking?.payload.departTime || booking?.payload.pickupTime || null;
}
