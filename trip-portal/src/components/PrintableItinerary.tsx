import type { CustomerTrip } from "@/lib/types";
import { BlockList } from "./Blocks";

/** Complete published plan: independent of the day selected on screen. */
export function PrintableItinerary({ data }: { data: CustomerTrip }) {
  return (
    <div className="trip-print">
      <header>
        <img src="/brand/logo-ink.webp" alt="Nawi Saadi Holidays" style={{ height: 48 }} />
        <h1>{data.trip.title || data.trip.destination}</h1>
        <p>
          {data.trip.trip_code} · {data.trip.start_date} – {data.trip.end_date}
        </p>
        <p>
          Itinerary summary · Keep this document private. Check your online itinerary for later
          updates.
        </p>
      </header>
      {data.days.map((day) => (
        <section key={day.id} className="trip-print-day">
          <h2>
            Day {day.day_number} · {day.title}
          </h2>
          {day.date ? <p>{day.date}</p> : null}
          {day.summary ? <p>{day.summary}</p> : null}
          {day.steps.map((step) => (
            <section key={step.id} className="trip-print-step">
              <h3>
                {step.time_label ? `${step.time_label} · ` : ""}
                {step.title}
              </h3>
              {step.duration ? <p>Duration: {step.duration}</p> : null}
              {step.location_name ? <p>{step.location_name}</p> : null}
              {step.description ? (
                <p style={{ whiteSpace: "pre-line" }}>{step.description}</p>
              ) : null}
              <BlockList
                blocks={step.blocks}
                ctx={{ drivers: data.drivers, documents: data.documents, invoices: data.invoices }}
              />
            </section>
          ))}
        </section>
      ))}
      <footer>Nawi Saadi Holidays · +971 56 122 8069</footer>
    </div>
  );
}
