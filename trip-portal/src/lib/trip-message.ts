import {
  activityTime,
  dayEssentials,
  flightLine,
  shortDay,
  stayLine,
  transferLine,
} from "./itinerary";
import type { Day, Driver, Trip } from "./types";

/**
 * The trip as one WhatsApp message: header, then each day with its flight,
 * transfer, hotel, guide and plan, then the link.
 *
 * WhatsApp formatting only (*bold*, plain lines, emoji as markers), because
 * that is where the customer reads it. Only days shown to the customer are
 * included: a hidden day is one the office is still writing.
 */
export type MessageOptions = {
  /** Booking references, PNRs and confirmation numbers. On by default. */
  references: boolean;
  /** Each day's activities and overview, not only the bookings. On by default. */
  plan: boolean;
};

const OFFICE_WHATSAPP = "+971 56 122 8069";

function longDay(date: string | null): string {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return "";
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

function range(start: string, end: string): string {
  const a = shortDay(start);
  const b = shortDay(end);
  const year = end.slice(0, 4);
  return a && b ? `${a} – ${b} ${year}` : `${start} – ${end}`;
}

function travellers(adults: number, children: number): string {
  const parts = [
    adults ? `${adults} adult${adults === 1 ? "" : "s"}` : "",
    children ? `${children} child${children === 1 ? "" : "ren"}` : "",
  ].filter(Boolean);
  return parts.join(", ");
}

/** A day overview's lines, trimmed of blanks, at most `max` of them. */
function overviewLines(summary: string | null, max: number): string[] {
  return (summary ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, max);
}

export function tripMessage(
  trip: Trip,
  days: Day[],
  drivers: Driver[],
  link: string,
  options: MessageOptions = { references: true, plan: true },
): string {
  const ref = (value?: string) => (options.references && value ? ` · Ref ${value}` : "");
  const out: string[] = [];
  const name = trip.customer?.full_name?.split(" ")[0];

  out.push(`*Nawi Saadi Holidays · Your trip details*`);
  if (name) out.push(`Dear ${name}, here is your itinerary.`);
  out.push("");
  out.push(`*${trip.title || trip.destination}*`);
  out.push(`📍 ${trip.destination}`);
  out.push(`📅 ${range(trip.start_date, trip.end_date)}`);
  const pax = travellers(trip.pax_adults, trip.pax_children);
  if (pax) out.push(`👥 ${pax}`);
  out.push(`🔖 Trip code ${trip.trip_code}`);

  for (const day of days.filter((d) => d.published)) {
    const e = dayEssentials(day);
    out.push("");
    out.push(`*Day ${day.day_number}${longDay(day.date) ? ` · ${longDay(day.date)}` : ""}*`);
    out.push(`_${day.title}_`);

    for (const f of e.flights) {
      const p = f.block.payload;
      const extra = [p.terminal ? `Terminal ${p.terminal}` : "", p.date ? shortDay(p.date) : ""]
        .filter(Boolean)
        .join(" · ");
      out.push(
        `✈️ ${flightLine(p) || f.step.title}${extra ? ` · ${extra}` : ""}${ref(p.reference)}`,
      );
    }
    for (const t of e.transfers) {
      const p = t.block.payload;
      const driver = drivers.find((d) => d.id === p.driverId);
      const who = driver
        ? ` · Driver ${[driver.full_name, driver.phone].filter(Boolean).join(" ")}`
        : "";
      out.push(`🚗 ${transferLine(p, activityTime(t.step)) || t.step.title}${who}`);
    }
    for (const h of e.hotels) {
      const p = h.block.payload;
      const stay = stayLine(p);
      out.push(`🏨 ${p.name || h.step.title}${stay ? ` · ${stay}` : ""}${ref(p.reference)}`);
      if (p.address) out.push(`    ${p.address}`);
    }
    for (const g of e.guides) {
      const p = g.block.payload;
      const contact = [p.phone, p.languages ? `speaks ${p.languages}` : ""]
        .filter(Boolean)
        .join(" · ");
      out.push(`🧭 Tour guide ${p.name ?? ""}${contact ? ` · ${contact}` : ""}`.trim());
    }

    if (options.plan) {
      for (const step of e.activities) {
        const time = activityTime(step);
        out.push(`• ${time ? `${time} ` : ""}${step.title}`);
      }
      for (const step of e.extras) {
        const time = activityTime(step);
        const urgent = step.blocks.some((b) => b.kind === "notice" || b.kind === "emergency");
        out.push(`${urgent ? "⚠️" : "ℹ️"} ${time ? `${time} ` : ""}${step.title}`);
      }
      // A day written as an overview only: send its first lines.
      if (!e.activities.length && !e.extras.length && !e.flights.length && !e.hotels.length) {
        for (const line of overviewLines(day.summary, 6))
          out.push(`• ${line.replace(/^[•\-–]\s*/, "")}`);
      }
    }
  }

  out.push("");
  out.push(`🔗 Full itinerary with maps, photos and documents:`);
  out.push(link);
  out.push("");
  out.push(`Questions at any time? WhatsApp us on ${OFFICE_WHATSAPP}.`);
  return out.join("\n");
}

/** A wa.me link to the customer's number with the message, or to the share sheet without one. */
export function whatsappHref(number: string | null | undefined, text: string): string {
  const digits = (number ?? "").replace(/[^\d]/g, "").replace(/^00/, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
