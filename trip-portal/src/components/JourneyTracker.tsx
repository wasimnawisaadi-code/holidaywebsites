import { useState } from "react";

import { Icon, type IconName } from "./Icon";
import { PROGRESS_STAGES, type ProgressEntry, type ProgressStage } from "@/lib/types";

/**
 * Every stage of the trip, and where the customer is in it.
 *
 * Two levels, because the customer asks two different questions. At a glance:
 * "which part of my trip am I in?" — answered by four phases across the top.
 * On a closer look: "has my driver actually been assigned, and when?" — answered
 * by the full list of thirteen milestones, each ticked with the time the office
 * recorded it.
 *
 * A stage the office skipped (straight from "booked" to "driver arrived", say)
 * is still shown as passed, without a time: it is behind the customer either
 * way, and leaving it unticked would read as something that has not happened.
 */

const PHASES: { name: string; label: string; icon: IconName }[] = [
  { name: "Before you travel", label: "Booked", icon: "calendar" },
  { name: "Transfer", label: "Transfer", icon: "car" },
  { name: "During the trip", label: "Your trip", icon: "hotel" },
  { name: "Departure", label: "Home", icon: "plane" },
];

type State = "done" | "current" | "upcoming";

export function JourneyTracker({
  progress,
  current,
}: {
  progress: ProgressEntry[];
  current: ProgressStage | null;
}) {
  const [showAll, setShowAll] = useState(false);
  const currentIndex = current ? PROGRESS_STAGES.findIndex((s) => s.id === current) : -1;

  // When each stage was reached: the earliest entry for it, since a stage can be
  // re-posted with a new note and the first time is when it actually happened.
  const reachedAt = new Map<string, string>();
  for (const p of [...progress].reverse()) {
    if (!reachedAt.has(p.stage)) reachedAt.set(p.stage, p.created_at);
  }

  const stageState = (i: number): State =>
    i < currentIndex ? "done" : i === currentIndex ? "current" : "upcoming";

  const phaseState = (phaseName: string): State => {
    const indexes = PROGRESS_STAGES.map((s, i) => (s.group === phaseName ? i : -1)).filter(
      (i) => i >= 0,
    );
    const first = indexes[0] ?? 0;
    const last = indexes[indexes.length - 1] ?? 0;
    if (currentIndex > last) return "done";
    if (currentIndex >= first) return "current";
    return "upcoming";
  };

  const currentPhase = PROGRESS_STAGES[currentIndex]?.group ?? PHASES[0]!.name;
  const visibleStages = PROGRESS_STAGES.map((s, i) => ({ ...s, i })).filter(
    (s) => showAll || s.group === currentPhase,
  );

  return (
    <div>
      {/* ---- the four phases ---- */}
      <ol className="grid grid-cols-4" aria-label="Trip phases">
        {PHASES.map((phase, i) => {
          const state = phaseState(phase.name);
          return (
            <li key={phase.name} className="relative flex flex-col items-center text-center">
              {/* Connector to the next phase, drawn from this node's centre. */}
              {i < PHASES.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={`absolute top-5 left-1/2 h-0.5 w-full ${
                    phaseState(PHASES[i + 1]!.name) !== "upcoming" ? "bg-gold" : "bg-hair"
                  }`}
                />
              ) : null}
              <span
                className={`relative grid size-10 place-items-center rounded-full border-2 transition ${
                  state === "done"
                    ? "border-gold bg-gold text-navy"
                    : state === "current"
                      ? "border-gold bg-white text-gold-deep shadow-[0_0_0_5px_rgba(202,164,45,0.18)]"
                      : "border-hair bg-white text-muted/60"
                }`}
              >
                <Icon
                  name={state === "done" ? "check" : phase.icon}
                  className="size-4.5"
                  strokeWidth={state === "done" ? 2.5 : 1.75}
                />
              </span>
              <span
                className={`mt-2 text-[11px] leading-tight font-semibold ${
                  state === "upcoming" ? "text-muted/70" : "text-navy"
                }`}
              >
                {phase.label}
              </span>
              <span className="sr-only">
                {state === "done" ? "completed" : state === "current" ? "in progress" : "upcoming"}
              </span>
            </li>
          );
        })}
      </ol>

      {/* ---- every milestone ---- */}
      <div className="mt-5 rounded-2xl bg-paper p-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-gold-deep uppercase">
            {showAll ? "Every stage" : currentPhase}
          </p>
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="text-xs font-semibold text-navy underline decoration-gold/60 underline-offset-4"
          >
            {showAll ? "Show current phase" : `Show all ${PROGRESS_STAGES.length} stages`}
          </button>
        </div>

        <ol className="mt-3 flex flex-col">
          {visibleStages.map((s, n) => {
            const state = stageState(s.i);
            const at = reachedAt.get(s.id);
            const lastRow = n === visibleStages.length - 1;
            return (
              <li key={s.id} className="relative flex gap-3 pb-3 last:pb-0">
                {!lastRow ? (
                  <span
                    aria-hidden="true"
                    className={`absolute top-6 bottom-0 left-[0.6875rem] w-px ${
                      state === "done" ? "bg-gold" : "bg-hair"
                    }`}
                  />
                ) : null}
                <span
                  className={`relative mt-0.5 grid size-[1.375rem] shrink-0 place-items-center rounded-full ${
                    state === "done"
                      ? "bg-gold text-navy"
                      : state === "current"
                        ? "bg-white ring-2 ring-gold"
                        : "bg-white ring-1 ring-hair"
                  }`}
                >
                  {state === "done" ? (
                    <Icon name="check" className="size-3" strokeWidth={3} />
                  ) : state === "current" ? (
                    <span className="ns-pulse size-2 rounded-full bg-live" />
                  ) : null}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm leading-snug ${
                      state === "current"
                        ? "font-bold text-navy"
                        : state === "done"
                          ? "font-medium text-ink"
                          : "text-muted/70"
                    }`}
                  >
                    {s.customerLabel}
                  </p>
                  {at && state !== "upcoming" ? (
                    <p className="text-xs text-muted tabular-nums">{stamp(at)}</p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/** Dubai time, whatever the phone's clock says — the office and customer agree. */
function stamp(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "Asia/Dubai",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
