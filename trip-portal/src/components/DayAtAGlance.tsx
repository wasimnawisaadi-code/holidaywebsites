import { Icon, type IconName } from "./Icon";
import {
  activityTime,
  dayEssentials,
  flightLine,
  stayLine,
  transferLine,
  type DayItem,
} from "@/lib/itinerary";
import type { Day, Driver } from "@/lib/types";

type Row = {
  key: string;
  icon: IconName;
  label: string;
  title: string;
  detail: string;
  href: string;
};

/** The rows a day's summary shows, in the order the day happens. */
function rows(day: Day, drivers: Driver[]): Row[] {
  const e = dayEssentials(day);
  const link = (item: DayItem) => `#stop-${item.step.id}`;
  return [
    ...e.flights.map((item) => ({
      key: item.block.id,
      icon: "plane" as const,
      label: "Flight",
      title: flightLine(item.block.payload) || item.step.title,
      detail: [
        item.block.payload.terminal ? `Terminal ${item.block.payload.terminal}` : "",
        item.block.payload.reference ? `Ref ${item.block.payload.reference}` : "",
      ]
        .filter(Boolean)
        .join(" · "),
      href: link(item),
    })),
    ...e.transfers.map((item) => {
      const driver = drivers.find((d) => d.id === item.block.payload.driverId);
      return {
        key: item.block.id,
        icon: "car" as const,
        label: "Transfer",
        title: transferLine(item.block.payload, activityTime(item.step)) || item.step.title,
        detail: driver
          ? [driver.full_name, driver.vehicle, driver.plate_number].filter(Boolean).join(" · ")
          : "Driver details to follow",
        href: link(item),
      };
    }),
    ...e.hotels.map((item) => ({
      key: item.block.id,
      icon: "hotel" as const,
      label: "Hotel",
      title: item.block.payload.name || item.step.title,
      detail: stayLine(item.block.payload),
      href: link(item),
    })),
    ...e.guides.map((item) => ({
      key: item.block.id,
      icon: "users" as const,
      label: "Tour guide",
      title: item.block.payload.name || "Your guide",
      detail: [item.block.payload.languages, item.block.payload.phone].filter(Boolean).join(" · "),
      href: link(item),
    })),
  ];
}

/**
 * "Your day at a glance": flight, pickup, hotel and guide for one day, before
 * the long plan. The questions a traveller asks at the airport are answered
 * in the first screen, and each row jumps to the full card below.
 */
export function DayAtAGlance({ day, drivers }: { day: Day; drivers: Driver[] }) {
  const list = rows(day, drivers);
  const e = dayEssentials(day);
  if (!list.length) return null;
  return (
    <section
      aria-label={`Day ${day.day_number} at a glance`}
      className="mt-6 overflow-hidden rounded-2xl border border-gold/40 bg-white shadow-sm"
    >
      <p className="flex items-center justify-between gap-2 border-b border-hair bg-sand/60 px-4 py-2.5 text-[11px] font-semibold tracking-[0.18em] text-gold-deep uppercase">
        <span>Your day at a glance</span>
        {e.activities.length ? (
          <span className="tracking-normal normal-case text-muted">
            + {e.activities.length} {e.activities.length === 1 ? "activity" : "activities"}
          </span>
        ) : null}
      </p>
      <ul className="divide-y divide-hair">
        {list.map((row) => (
          <li key={row.key}>
            <a
              href={row.href}
              className="flex items-center gap-3 px-4 py-3 transition hover:bg-paper"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-navy text-white">
                <Icon name={row.icon} className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-semibold tracking-wide text-gold-deep uppercase">
                  {row.label}
                </span>
                <span className="block text-sm font-semibold break-words text-navy">
                  {row.title}
                </span>
                {row.detail ? (
                  <span className="block text-xs break-words text-muted">{row.detail}</span>
                ) : null}
              </span>
              <Icon name="chevronRight" className="size-4 shrink-0 text-gold-deep" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The same facts as small chips, for a day's card in the roadmap. */
export function DayChips({ day }: { day: Day }) {
  const e = dayEssentials(day);
  const chips: [IconName, string][] = [
    ...e.flights.map((f): [IconName, string] => [
      "plane",
      [f.block.payload.flightNumber, f.block.payload.departTime].filter(Boolean).join(" ") ||
        "Flight",
    ]),
    ...e.transfers.map((t): [IconName, string] => [
      "car",
      t.block.payload.pickupTime || "Transfer",
    ]),
    ...e.hotels.map((h): [IconName, string] => ["hotel", h.block.payload.name || "Hotel"]),
    ...e.guides.map((g): [IconName, string] => ["users", g.block.payload.name || "Guide"]),
  ];
  if (!chips.length) return null;
  return (
    <span className="mt-3 flex flex-wrap gap-1.5">
      {chips.map(([icon, text], i) => (
        <span
          key={`${icon}-${i}`}
          className="inline-flex max-w-full items-center gap-1 rounded-full bg-sand px-2.5 py-1 text-[11px] font-semibold text-navy"
        >
          <Icon name={icon} className="size-3 shrink-0 text-gold-deep" />
          <span className="truncate">{text}</span>
        </span>
      ))}
    </span>
  );
}
