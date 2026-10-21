import { BlockList, type BlockCtx } from "./Blocks";
import { Icon } from "./Icon";
import { flightLine, shortDay, stayLine } from "@/lib/itinerary";
import type { Block, Day } from "@/lib/types";

/**
 * The trip's flights and hotels as a short list at the top of the itinerary.
 *
 * Shown as full cards, five flights and four hotels made a 4,000px wall that
 * pushed the day-by-day plan off the bottom of a phone. Here each booking is
 * one row (when, what, where) and opens to its full card on a tap, so the
 * customer sees every flight and stay at a glance and the plan follows.
 */
export function BookingsList({
  bookings,
  ctx,
}: {
  bookings: { day: Day; block: Block }[];
  ctx: BlockCtx;
}) {
  if (!bookings.length) return null;
  return (
    <section
      id="bookings"
      data-anchor
      aria-label="Flight and hotel details"
      className="mt-6 scroll-mt-20 overflow-hidden rounded-3xl border border-gold/40 bg-white shadow-sm"
    >
      <p className="border-b border-hair bg-sand/60 px-5 py-3 text-[11px] font-semibold tracking-[0.2em] text-gold-deep uppercase">
        Your flights &amp; hotels
      </p>
      <ul className="divide-y divide-hair">
        {bookings.map(({ day, block }) => {
          const p = block.payload;
          const flight = block.kind === "flight";
          const when = [`Day ${day.day_number}`, day.date ? shortDay(day.date) : ""]
            .filter(Boolean)
            .join(" · ");
          const title = flight
            ? [p.airline, p.flightNumber].filter(Boolean).join(" ") || "Flight"
            : p.name || "Hotel";
          const detail = flight
            ? flightLine({ ...p, airline: undefined, flightNumber: undefined })
            : stayLine(p);
          return (
            <li key={block.id}>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 transition hover:bg-paper [&::-webkit-details-marker]:hidden">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-navy text-white">
                    <Icon name={flight ? "plane" : "hotel"} className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-semibold tracking-wide text-gold-deep uppercase">
                      {when} · {flight ? "Flight" : "Hotel"}
                    </span>
                    <span className="block truncate text-sm font-semibold text-navy">{title}</span>
                    {detail ? (
                      <span className="block truncate text-xs text-muted">{detail}</span>
                    ) : null}
                  </span>
                  <Icon
                    name="chevronRight"
                    className="size-4 shrink-0 text-gold-deep transition group-open:rotate-90"
                  />
                </summary>
                <div className="px-4 pb-4">
                  <BlockList blocks={[block]} ctx={ctx} />
                </div>
              </details>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
