import { useState } from "react";
import { BlockList, type BlockCtx } from "./Blocks";
import { Icon } from "./Icon";
import type { Day } from "@/lib/types";
import { activityTime } from "@/lib/itinerary";

export function JourneyOverview({
  days,
  ctx,
  onSelect,
  activeDay = 0,
}: {
  days: Day[];
  ctx: BlockCtx;
  onSelect: (index: number) => void;
  activeDay?: number;
}) {
  const [view, setView] = useState<"journey" | "flight" | "hotel" | "driver" | "schedule">(
    "journey",
  );
  const bookings = days.flatMap((day, index) =>
    day.steps.flatMap((step) =>
      step.blocks
        .filter(
          (block) => block.kind === "hotel" || block.kind === "flight" || block.kind === "driver",
        )
        .map((block) => ({ block, day, index })),
    ),
  );
  const flights = bookings.filter((b) => b.block.kind === "flight").length;
  const stays = bookings.filter((b) => b.block.kind === "hotel").length;
  const transfers = bookings.filter((b) => b.block.kind === "driver").length;
  return (
    <section
      className="mt-6 overflow-hidden rounded-3xl border border-hair bg-sand/50 shadow-sm"
      aria-label="Trip at a glance"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-gold-deep uppercase">
            Every day. Every detail.
          </p>
          <h3 className="mt-1 font-display text-3xl text-navy">Your travel roadmap</h3>
          <p className="mt-2 text-xs text-muted">
            {days.length} {days.length === 1 ? "day" : "days"}
            {flights ? ` · ${flights} ${flights === 1 ? "flight" : "flights"}` : ""}
            {stays ? ` · ${stays} ${stays === 1 ? "stay" : "stays"}` : ""}
            {transfers ? ` · ${transfers} ${transfers === 1 ? "transfer" : "transfers"}` : ""}
          </p>
        </div>
        <div
          className="flex flex-wrap gap-1 rounded-2xl border border-hair bg-white p-1"
          aria-label="Overview filters"
        >
          {(
            [
              ["journey", "route", "Roadmap"],
              ["flight", "plane", "Flights"],
              ["hotel", "hotel", "Stays"],
              ["driver", "car", "Transfers"],
              ["schedule", "clock", "Schedule"],
            ] as const
          ).map(([key, icon, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={view === key}
              onClick={() => setView(key)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${view === key ? "bg-navy text-white" : "text-muted hover:bg-paper"}`}
            >
              <Icon name={icon} className="size-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>
      {view === "schedule" ? (
        <div className="space-y-5 px-5 pb-6 sm:px-6">
          <p className="text-xs text-muted">
            Times are provided by your consultant. Check each booking for its local time zone.
          </p>
          {days.map((day, index) => (
            <div key={day.id} className="overflow-hidden rounded-2xl border border-hair bg-white">
              <button
                type="button"
                onClick={() => onSelect(index)}
                className="flex w-full items-center justify-between gap-3 bg-navy px-5 py-4 text-left text-white"
              >
                <span>
                  <span className="text-xs text-white/60">
                    Day {day.day_number} · {day.date || "Date to be confirmed"}
                  </span>
                  <strong className="mt-1 block">{day.title}</strong>
                </span>
                <Icon name="arrowRight" className="size-4 shrink-0" />
              </button>
              {day.steps.length ? (
                day.steps.map((step) => (
                  <div
                    key={step.id}
                    className="grid gap-2 border-b border-hair p-4 last:border-0 sm:grid-cols-[110px_1fr]"
                  >
                    <p className="text-sm font-semibold text-gold-deep">
                      {activityTime(step) || "Time to confirm"}
                    </p>
                    <div>
                      <p className="font-semibold text-navy">{step.title}</p>
                      {step.description ? (
                        <p className="mt-1 text-sm whitespace-pre-line text-muted">
                          {step.description}
                        </p>
                      ) : null}
                      <p className="mt-2 text-xs text-muted">
                        {[step.duration, step.location_name].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-sm leading-relaxed whitespace-pre-line text-muted">
                  {day.summary || "Your daily schedule is being prepared."}
                  {day.summary ? (
                    <p className="mt-3 text-xs">
                      Detailed timings will appear here when confirmed.
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : view === "journey" ? (
        <ol className="px-4 pb-6 sm:px-6">
          {days.map((day, index) => (
            <li key={day.id} className="relative pb-4 pl-10 last:pb-0 sm:pl-14">
              {index < days.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute top-8 bottom-0 left-4 w-px bg-gold/50 sm:left-5"
                />
              ) : null}
              <span
                aria-hidden="true"
                className={`absolute top-4 left-0 grid size-8 place-items-center rounded-full text-xs font-bold ring-4 ring-sand sm:size-10 ${index === activeDay ? "bg-navy text-white" : "border border-gold/50 bg-white text-gold-deep"}`}
              >
                {String(day.day_number).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={() => onSelect(index)}
                aria-current={index === activeDay ? "step" : undefined}
                className={`group grid w-full overflow-hidden rounded-2xl border bg-white text-left transition hover:border-gold hover:shadow-md ${day.coverUrl ? "sm:grid-cols-[1fr_150px]" : ""} ${index === activeDay ? "border-gold shadow-sm" : "border-hair"}`}
              >
                <span className="min-w-0 p-4 sm:p-5">
                  <span className="block text-[10px] tracking-wide text-muted uppercase">
                    Day {day.day_number}
                    {day.date
                      ? ` · ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${day.date}T12:00:00Z`))}`
                      : ""}
                  </span>
                  <span className="mt-1 block font-display text-xl text-navy">{day.title}</span>
                  {day.steps.length ? (
                    <span className="mt-3 block space-y-2">
                      {day.steps.slice(0, 3).map((step) => {
                        const kind = step.blocks.find((b) =>
                          ["flight", "hotel", "driver"].includes(b.kind),
                        )?.kind;
                        return (
                          <span key={step.id} className="flex items-start gap-2 text-xs text-muted">
                            <Icon
                              name={
                                kind === "flight"
                                  ? "plane"
                                  : kind === "hotel"
                                    ? "hotel"
                                    : kind === "driver"
                                      ? "car"
                                      : "pin"
                              }
                              className="mt-0.5 size-3.5 shrink-0 text-gold-deep"
                            />
                            <span>
                              {activityTime(step) ? (
                                <strong className="mr-1.5 text-navy">{activityTime(step)}</strong>
                              ) : null}
                              {step.title}
                            </span>
                          </span>
                        );
                      })}
                      {day.steps.length > 3 ? (
                        <span className="block text-xs text-muted">
                          + {day.steps.length - 3} more activities
                        </span>
                      ) : null}
                    </span>
                  ) : (
                    <span className="mt-2 block line-clamp-3 text-xs leading-relaxed whitespace-pre-line text-muted">
                      {day.summary || "Details coming soon"}
                    </span>
                  )}
                  <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-gold-deep">
                    Explore this day <Icon name="arrowRight" className="size-3.5" />
                  </span>
                </span>
                {day.coverUrl ? (
                  <img
                    src={day.coverUrl}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="order-first h-28 w-full object-cover sm:order-none sm:h-full sm:min-h-40"
                  />
                ) : null}
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <div className="grid items-start gap-4 px-5 pb-5 sm:px-6 sm:pb-6 lg:grid-cols-2">
          {bookings
            .filter((b) => b.block.kind === view)
            .map(({ block, day, index }) => (
              <div key={block.id}>
                <button
                  type="button"
                  onClick={() => onSelect(index)}
                  className="mb-2 text-xs font-semibold text-gold-deep"
                >
                  Day {day.day_number} · {day.title} →
                </button>
                <BlockList blocks={[block]} ctx={ctx} />
              </div>
            ))}
          {!bookings.some((b) => b.block.kind === view) ? (
            <p className="rounded-xl bg-white p-4 text-sm text-muted">
              Your {view === "flight" ? "flight" : view === "driver" ? "transfer" : "hotel"} details
              will appear here when added by your consultant.
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
