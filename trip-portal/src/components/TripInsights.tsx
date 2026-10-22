import { Icon, type IconName } from "./Icon";
import { activityTime, dayEssentials, shortDay, stepSummary } from "@/lib/itinerary";
import type { Day } from "@/lib/types";

type Next = {
  dayIndex: number;
  stepId: string;
  when: string;
  title: string;
  line: string;
  icon: IconName;
};

/** "08:15" or "8:15 pm" as minutes after midnight, or null when there is no clock time. */
function minutes(time: string | null): number | null {
  const m = /(\d{1,2})[:.](\d{2})\s*(am|pm)?/i.exec(time ?? "");
  if (!m) return null;
  let h = Number(m[1]) % 24;
  const pm = m[3]?.toLowerCase() === "pm";
  if (m[3]) h = (h % 12) + (pm ? 12 : 0);
  return h * 60 + Number(m[2]);
}

/**
 * The next thing on the trip: the first item, in the itinerary's order, that
 * has not happened yet in Dubai time. Null before anything is dated, or after
 * the last item.
 */
function nextUp(days: Day[]): Next | null {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dubai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const today = `${get("year")}-${get("month")}-${get("day")}`;
  const now = Number(get("hour")) * 60 + Number(get("minute"));

  for (const [dayIndex, day] of days.entries()) {
    if (!day.date || day.date < today) continue;
    // The day's own order, as the office arranged it. Times only decide what
    // has already happened today; an item without a time is never skipped.
    const items = day.steps.map((step) => ({ step, at: minutes(activityTime(step)) }));
    for (const { step, at } of items) {
      if (day.date === today && at !== null && at < now) continue;
      const s = stepSummary(step);
      const time = activityTime(step);
      return {
        dayIndex,
        stepId: step.id,
        when: [day.date === today ? "Today" : shortDay(day.date), time].filter(Boolean).join(" · "),
        title: step.title,
        line: s.line,
        icon: s.icon,
      };
    }
  }
  return null;
}

/**
 * What the trip holds, and what happens next, for the top of the customer's
 * page: the two questions a traveller opens the link to answer.
 */
export function TripInsights({
  days,
  onOpen,
}: {
  days: Day[];
  /** Open a day and scroll to one of its items. */
  onOpen: (dayIndex: number, stepId: string) => void;
}) {
  const all = days.map(dayEssentials);
  const flights = all.reduce((n, e) => n + e.flights.length, 0);
  const transfers = all.reduce((n, e) => n + e.transfers.length, 0);
  const guides = all.reduce((n, e) => n + e.guides.length, 0);
  const activities = all.reduce((n, e) => n + e.activities.length, 0);
  const hotels = new Set(
    all.flatMap((e) => e.hotels.map((h) => (h.block.payload.name ?? h.step.title).toLowerCase())),
  ).size;
  const nights = all
    .flatMap((e) => e.hotels)
    .reduce((n, h) => n + (Number(h.block.payload.nights) || 0), 0);
  const next = nextUp(days);

  const facts: [IconName, string][] = [
    flights ? ["plane", `${flights} flight${flights === 1 ? "" : "s"}`] : null,
    hotels
      ? [
          "hotel",
          `${hotels} hotel${hotels === 1 ? "" : "s"}${nights ? ` · ${nights} night${nights === 1 ? "" : "s"}` : ""}`,
        ]
      : null,
    transfers ? ["car", `${transfers} transfer${transfers === 1 ? "" : "s"}`] : null,
    guides ? ["users", `${guides} guided tour${guides === 1 ? "" : "s"}`] : null,
    activities ? ["pin", `${activities} activit${activities === 1 ? "y" : "ies"}`] : null,
  ].filter((f): f is [IconName, string] => f !== null);

  if (!next && !facts.length) return null;
  return (
    <div className="mt-5 border-t border-hair pt-4">
      {next ? (
        <button
          type="button"
          onClick={() => onOpen(next.dayIndex, next.stepId)}
          className="flex w-full items-center gap-3 rounded-2xl bg-navy p-3.5 text-left text-white transition hover:bg-navy-deep"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold text-navy">
            <Icon name={next.icon} className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-semibold tracking-[0.18em] text-gold-light uppercase">
              Coming up next · {next.when}
            </span>
            <span className="block truncate text-sm font-semibold">{next.title}</span>
            {next.line ? (
              <span className="block truncate text-xs text-white/75">{next.line}</span>
            ) : null}
          </span>
          <Icon name="chevronRight" className="size-4 shrink-0 text-gold-light" />
        </button>
      ) : null}
      {facts.length ? (
        <div className="mt-3">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-muted uppercase">
            Your trip includes
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {facts.map(([icon, text]) => (
              <span
                key={text}
                className="inline-flex items-center gap-1.5 rounded-full bg-sand px-3 py-1.5 text-xs font-semibold text-navy"
              >
                <Icon name={icon} className="size-3.5 text-gold-deep" /> {text}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
