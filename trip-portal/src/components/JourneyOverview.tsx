import { useState } from "react";
import { BlockList, type BlockCtx } from "./Blocks";
import { Icon } from "./Icon";
import type { Day } from "@/lib/types";

export function JourneyOverview({
  days,
  ctx,
  onSelect,
}: {
  days: Day[];
  ctx: BlockCtx;
  onSelect: (index: number) => void;
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
  return (
    <section
      className="mt-6 overflow-hidden rounded-3xl border border-hair bg-sand/50"
      aria-label="Trip at a glance"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-gold-deep uppercase">
            The whole journey
          </p>
          <h3 className="mt-1 font-display text-2xl text-navy">Your trip at a glance</h3>
          <p className="mt-2 text-xs text-muted">
            {days.length} days · {days.reduce((n, d) => n + d.steps.length, 0)} experiences ·{" "}
            {flights} flights · {stays} stays
          </p>
        </div>
        <div
          className="flex flex-wrap gap-1 rounded-2xl border border-hair bg-white p-1"
          aria-label="Overview filters"
        >
          {(
            [
              ["journey", "route", "Journey"],
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
                      {step.time_label || "Time to confirm"}
                    </p>
                    <div>
                      <p className="font-semibold text-navy">{step.title}</p>
                      {step.description ? (
                        <p className="mt-1 text-sm text-muted">{step.description}</p>
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
        <div className="grid gap-3 px-5 pb-5 sm:grid-cols-2 sm:px-6 sm:pb-6 lg:grid-cols-3">
          {days.map((day, index) => (
            <button
              key={day.id}
              type="button"
              onClick={() => onSelect(index)}
              className="group flex items-start gap-3 rounded-2xl border border-hair bg-white p-4 text-left transition hover:border-gold hover:shadow-sm"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sand text-sm font-bold text-gold-deep">
                {String(day.day_number).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] tracking-wide text-muted uppercase">
                  Day {day.day_number}
                  {day.date
                    ? ` · ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${day.date}T12:00:00Z`))}`
                    : ""}
                </span>
                <span className="mt-1 block text-sm font-semibold text-navy">{day.title}</span>
                <span className="mt-2 block text-xs leading-relaxed text-muted">
                  {day.steps.length
                    ? day.steps
                        .map((s) => s.title)
                        .slice(0, 3)
                        .join(" · ")
                    : day.summary
                      ? "View your day’s highlights"
                      : "Details coming soon"}
                  {day.steps.length > 3 ? ` · +${day.steps.length - 3} more` : ""}
                </span>
              </span>
              <Icon name="arrowRight" className="mt-3 size-3.5 shrink-0 text-gold-deep" />
            </button>
          ))}
        </div>
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
