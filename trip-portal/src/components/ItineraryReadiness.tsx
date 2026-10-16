import type { Day } from "@/lib/types";
import { Icon } from "./Icon";
import { activitySteps, activityTime } from "@/lib/itinerary";

export function ItineraryReadiness({ days }: { days: Day[] }) {
  const blocks = days.flatMap((d) => d.steps.flatMap((s) => s.blocks));
  const flights = blocks.filter((b) => b.kind === "flight");
  const hotels = blocks.filter((b) => b.kind === "hotel");
  const photos = blocks.reduce(
    (n, b) => n + (b.payload.paths?.length ?? 0) + (b.payload.path ? 1 : 0),
    0,
  );
  const reminders = days.flatMap((day) => {
    const notes: string[] = [];
    if (!activitySteps(day).length) notes.push("Add flight, hotel, transfer or activity details");
    if (!day.date) notes.push("Set the day's date");
    for (const step of activitySteps(day))
      if (!activityTime(step)) notes.push(`Add a time for ${step.title}`);
    for (const step of day.steps)
      for (const b of step.blocks) {
        const p = b.payload;
        if (
          b.kind === "flight" &&
          (!p.flightNumber || !p.fromAirport || !p.toAirport || !(p.departTime || p.departure))
        )
          notes.push(`Complete flight details in ${step.title}`);
        if (b.kind === "hotel" && (!p.name || !p.checkIn || !p.checkOut))
          notes.push(`Complete hotel name and dates in ${step.title}`);
        if (b.kind === "driver" && (!p.pickupTime || !p.pickupLocation || !p.dropoffLocation))
          notes.push(`Complete pickup time and route in ${step.title}`);
      }
    return notes.map((note) => ({ day, note }));
  });
  return (
    <section
      className="rounded-2xl border border-hair bg-white p-5"
      aria-label="Itinerary readiness"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] text-gold-deep uppercase">
            Itinerary studio
          </p>
          <h2 className="mt-1 font-display text-2xl text-navy">
            Build every detail of the journey
          </h2>
        </div>
        <span className="rounded-full bg-sand px-3 py-2 text-xs font-semibold text-navy">
          {reminders.length} detail reminders
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ["Days", days.length],
          ["Flights", flights.length],
          ["Hotels", hotels.length],
          ["Photos", photos],
        ].map(([label, count]) => (
          <div key={label} className="rounded-xl bg-paper px-4 py-3">
            <p className="text-xl font-semibold text-navy">{count}</p>
            <p className="text-xs text-muted">{label}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted">
        Open a day and choose Flight, Hotel, Transfer or Activity. Add photos in that day's gallery.
        Use the advanced editor for booking-document OCR, hotel lookup and extra content, then
        preview the customer link before sharing.
      </p>
      {reminders.length ? (
        <details className="mt-4 rounded-xl border border-gold/30 bg-sand p-3">
          <summary className="cursor-pointer text-xs font-semibold text-gold-deep">
            Review missing flight, hotel and day details
          </summary>
          <ul className="mt-3 space-y-2">
            {reminders.map(({ day, note }, i) => (
              <li key={day.id + i}>
                <a
                  href={`#editor-day-${day.id}`}
                  className="flex items-start gap-2 text-xs text-navy"
                >
                  <Icon name="arrowRight" className="mt-0.5 size-3 shrink-0" />
                  Day {day.day_number} · {note}
                </a>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}
