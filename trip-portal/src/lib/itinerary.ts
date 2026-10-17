import type { IconName } from "@/components/Icon";
import { BLOCK_LABELS, type Block, type Day, type Step } from "./types";

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

/** The role that marks a contact block as the day's tour guide. */
export const TOUR_GUIDE_ROLE = "Tour guide";

export const isTourGuide = (block: Block): boolean =>
  block.kind === "contact" && block.payload.role === TOUR_GUIDE_ROLE;

/** Content kinds that inform rather than plan: the "More options" row in the editor. */
const INFO_KINDS = new Set<Block["kind"]>([
  "heading",
  "text",
  "notice",
  "emergency",
  "checklist",
  "link",
  "document",
  "invoice",
  "contact",
  "ticket",
  "video",
  "map",
  "guide",
  "image",
]);

/** One booking on a day, with the stop it belongs to, so a summary can link to it. */
export type DayItem = { block: Block; step: Step };

/**
 * What a day holds, sorted the way a traveller asks about it: how am I getting
 * there, who picks me up, where am I sleeping, who is guiding me, what else is
 * planned, and the photos.
 *
 * Every summary of a day (the office's checklist, the customer's "today" card,
 * the WhatsApp message) reads from here, so they cannot disagree.
 */
export type DayEssentials = {
  flights: DayItem[];
  transfers: DayItem[];
  hotels: DayItem[];
  guides: DayItem[];
  /** Stops that are not just a booking: sightseeing, meals, free time. */
  activities: Step[];
  /** Notices, checklists, tickets, documents, links: information, not plans. */
  extras: Step[];
  photos: number;
};

export function dayEssentials(day: Day): DayEssentials {
  const out: DayEssentials = {
    flights: [],
    transfers: [],
    hotels: [],
    guides: [],
    activities: [],
    extras: [],
    photos: 0,
  };
  for (const step of day.steps) {
    let booking = false;
    for (const block of step.blocks) {
      if (block.kind === "gallery" || block.kind === "image") {
        out.photos += block.payload.paths?.length ?? (block.payload.path ? 1 : 0);
        continue;
      }
      if (block.kind === "hotel") {
        out.photos += block.payload.paths?.length ?? 0;
        out.hotels.push({ block, step });
        booking = true;
      } else if (block.kind === "flight") {
        out.flights.push({ block, step });
        booking = true;
      } else if (block.kind === "driver") {
        out.transfers.push({ block, step });
        booking = true;
      } else if (isTourGuide(block)) {
        out.guides.push({ block, step });
        booking = true;
      }
    }
    if (booking || isDayGalleryStep(step)) continue;
    // A stop whose content is only information (a notice, a checklist…) is not
    // something to do; it is listed apart so "3 activities" means three plans.
    const info = step.blocks.some((b) => INFO_KINDS.has(b.kind) && !isTourGuide(b));
    (info ? out.extras : out.activities).push(step);
  }
  return out;
}

/** "FZ 331 · KBL 08:15 → DXB 11:05": a flight on one line. */
export function flightLine(p: Block["payload"]): string {
  const from = [p.fromAirport, p.departTime ?? p.departure].filter(Boolean).join(" ");
  const to = [p.toAirport, p.arriveTime ?? p.arrival].filter(Boolean).join(" ");
  const route = from || to ? `${from || "?"} → ${to || "?"}` : "";
  return [[p.airline, p.flightNumber].filter(Boolean).join(" "), route].filter(Boolean).join(" · ");
}

/** "Pickup 15:30 · Airport → Hotel": a transfer on one line. */
export function transferLine(p: Block["payload"], fallbackTime?: string | null): string {
  const time = p.pickupTime || fallbackTime;
  const route = [p.pickupLocation, p.dropoffLocation].filter(Boolean).join(" → ");
  return [time ? `Pickup ${time}` : "", route].filter(Boolean).join(" · ");
}

/** "15 Oct", from YYYY-MM-DD; anything else is returned as typed. */
export function shortDay(value?: string): string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return value ?? "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

/** "Check-in 15 Oct · Check-out 17 Oct · 2 nights". */
export function stayLine(p: Block["payload"]): string {
  return [
    p.checkIn ? `Check-in ${shortDay(p.checkIn)}` : "",
    p.checkOut ? `Check-out ${shortDay(p.checkOut)}` : "",
    p.nights ? `${p.nights} night${p.nights === "1" ? "" : "s"}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

/**
 * One line for an item in the office's day plan: an icon for what it is and
 * the detail that matters, e.g. "flydubai FZ 331 · KBL 08:15 → DXB 11:05".
 */
export function stepSummary(step: Step): { icon: IconName; line: string; photos: number } {
  let photos = 0;
  for (const b of step.blocks) {
    if (b.kind === "gallery" || b.kind === "hotel") photos += b.payload.paths?.length ?? 0;
    else if (b.kind === "image" && b.payload.path) photos += 1;
  }
  const find = (kind: Block["kind"]) => step.blocks.find((b) => b.kind === kind)?.payload;
  const flight = find("flight");
  if (flight) return { icon: "plane", line: flightLine(flight), photos };
  const transfer = find("driver");
  if (transfer) return { icon: "car", line: transferLine(transfer), photos };
  const hotel = find("hotel");
  if (hotel) {
    const stay = stayLine(hotel);
    return { icon: "hotel", line: [hotel.name, stay].filter(Boolean).join(" · "), photos };
  }
  const guide = step.blocks.find(isTourGuide)?.payload;
  if (guide) {
    return {
      icon: "users",
      line: ["Guide", guide.name, guide.languages, guide.phone].filter(Boolean).join(" · "),
      photos,
    };
  }
  // Information items from "More options": say what they hold.
  const info = step.blocks.find((b) => INFO_KINDS.has(b.kind));
  if (info) {
    const p = info.payload;
    const firstLine = (p.text ?? "")
      .split(/\r?\n/)
      .find((l) => l.trim())
      ?.trim();
    const count = p.items?.length ?? 0;
    const line =
      info.kind === "checklist"
        ? `Checklist · ${count} item${count === 1 ? "" : "s"}`
        : [p.heading, p.name, p.label, p.reference, p.locationName, firstLine]
            .filter(Boolean)
            .slice(0, 2)
            .join(" · ") || BLOCK_LABELS[info.kind].label;
    return { icon: BLOCK_LABELS[info.kind].icon, line, photos };
  }
  const first = (step.description ?? "").split(/\r?\n/).find((l) => l.trim());
  return {
    icon: "pin",
    line: [step.duration, step.location_name, first?.trim()].filter(Boolean).join(" · "),
    photos,
  };
}

/** "08:15", "8.15" or "8:15 pm" as minutes after midnight; null when there is no clock time. */
export function clockMinutes(time: string | null | undefined): number | null {
  const m = /(\d{1,2})[:.](\d{2})\s*(am|pm)?/i.exec(time ?? "");
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  if (m[3]) h = (h % 12) + (m[3].toLowerCase() === "pm" ? 12 : 0);
  return h * 60 + min;
}
