import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import { BlockList, DriverCard, DocumentLink } from "@/components/Blocks";
import { InvoiceCard } from "@/components/InvoiceCard";
import { stageMeta, type CustomerTrip } from "@/lib/types";

/**
 * The customer portal. One route, one link, no login.
 *
 * Everything is fetched inside a server function, so the service-role read never
 * has a path into the browser bundle. The token arrives as a route param and is
 * checked in `tripByToken`; a token that does not resolve throws notFound(),
 * which renders the root's "we can't find this trip" page. A wrong token and an
 * unpublished trip are indistinguishable from outside, deliberately.
 */

const loadTrip = createServerFn({ method: "GET" })
  .validator((token: string) => token)
  .handler(async ({ data: token }) => {
    // Imported inside the handler, not at module scope. A top-level import of a
    // server-only module in a route file is the most common way a service-role
    // key ends up in a client chunk — the bundler follows the import even when
    // only the handler uses it.
    const { tripByToken } = await import("@/lib/trips");
    const { recordView } = await import("@/lib/views");

    const trip = await tripByToken(token);
    if (!trip) return null;

    // Counted server-side so it cannot be inflated by a refresh loop in the
    // browser, and so it still records for a customer with JavaScript disabled.
    await recordView(trip.trip.id, "open", null);
    return trip;
  });

/** Engagement events. Fire-and-forget; a failure must never surface. */
const logEngagement = createServerFn({ method: "POST" })
  .validator((input: { token: string; event: string; detail?: string }) => input)
  .handler(async ({ data }) => {
    const { recordViewByToken } = await import("@/lib/views");
    await recordViewByToken(data.token, data.event, data.detail ?? null);
    return { ok: true };
  });

export const Route = createFileRoute("/t/$token")({
  loader: async ({ params }) => {
    const trip = await loadTrip({ data: params.token });
    if (!trip) throw notFound();
    return trip;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          {
            title: `${loaderData.trip.destination} · ${loaderData.trip.trip_code} · Nawi Saadi`,
          },
        ]
      : [],
  }),
  component: Portal,
});

/* ---------------------------------------------------------------------- */

function Portal() {
  const data = Route.useLoaderData() as CustomerTrip;
  const { trip, days, drivers, documents, progress, invoices, currentStage, percent } = data;
  const token = Route.useParams().token;

  const engage = (event: string, detail: string) => {
    // No await and no catch on the caller's side: this fires on a click that is
    // usually also a navigation (a tel: link, a document download), and anything
    // that blocks or throws here delays the thing the customer actually pressed.
    void logEngagement({ data: { token, event, detail } }).catch(() => {});
  };

  /**
   * Which day to open on.
   *
   * A customer mid-trip opening this link wants today, not day one — they have
   * read day one already. Computed against the trip's own dates rather than
   * `new Date()` alone so that a trip which has not started opens on day one and
   * a finished trip opens on its last day, instead of showing nothing.
   */
  const todayIndex = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const exact = days.findIndex((d) => d.date === today);
    if (exact >= 0) return exact;
    if (today < trip.start_date) return 0;
    if (today > trip.end_date) return Math.max(0, days.length - 1);
    // Mid-trip but no day carries today's date — fall back to counting from the
    // start, which is right whenever the office left the per-day dates blank.
    const elapsed = Math.floor((Date.parse(today) - Date.parse(trip.start_date)) / 86_400_000);
    return Math.min(Math.max(elapsed, 0), Math.max(0, days.length - 1));
  }, [days, trip.start_date, trip.end_date]);

  const [activeDay, setActiveDay] = useState(todayIndex);
  const day = days[activeDay];
  const stage = currentStage ? stageMeta(currentStage) : null;
  const latest = progress[0];

  // Every driver mentioned in the live timeline, most recent first. This is what
  // the customer wants when the status says "driver arrived".
  const activeDriver = useMemo(() => {
    const entry = progress.find((p) => p.driver_id);
    return entry ? drivers.find((d) => d.id === entry.driver_id) : undefined;
  }, [progress, drivers]);

  return (
    <div className="min-h-screen pb-16">
      {/* ---- header ---- */}
      <header className="bg-navy px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-6 text-white">
        <div className="mx-auto max-w-lg">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-gold uppercase">
            Nawi Saadi Travel &amp; Tourism
          </p>
          <h1 className="mt-3 font-display text-[26px] leading-tight">
            {trip.title ?? trip.destination}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-white/75">
            <span className="font-mono tracking-wide">{trip.trip_code}</span>
            <span aria-hidden="true">·</span>
            <span>{formatRange(trip.start_date, trip.end_date)}</span>
            <span aria-hidden="true">·</span>
            <span>{paxLabel(trip.pax_adults, trip.pax_children)}</span>
          </div>

          {trip.customer?.full_name ? (
            <p className="mt-2 text-sm text-white/90">Prepared for {trip.customer.full_name}</p>
          ) : null}
        </div>
      </header>

      <div className="mx-auto max-w-lg px-5">
        {/* ---- live progress: the thing the customer refreshes for ---- */}
        <section
          aria-label="Trip progress"
          className="-mt-4 rounded-2xl border border-hair bg-white p-4 shadow-[0_12px_32px_-22px_rgba(0,35,64,0.45)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
                Current status
              </p>
              <p className="mt-1.5 flex items-center gap-2 text-base font-bold text-navy">
                {stage ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="ns-pulse inline-block size-2 shrink-0 rounded-full bg-live"
                    />
                    <span>{stage.customerLabel}</span>
                  </>
                ) : (
                  <span>Your trip is confirmed</span>
                )}
              </p>
              {latest?.note ? (
                <p className="mt-1.5 text-sm leading-relaxed text-ink">{latest.note}</p>
              ) : null}
              {latest ? (
                <p className="mt-1 text-xs text-muted">Updated {timeAgo(latest.created_at)}</p>
              ) : null}
            </div>
            <span className="shrink-0 font-mono text-sm font-bold tabular-nums text-gold-deep">
              {percent}%
            </span>
          </div>

          {/* A bar, not a thirteen-step stepper. Thirteen stages will not fit on
              a phone without becoming illegible, and the customer's question is
              "how far along am I", not "name every stage". */}
          <div
            className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-paper"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Trip progress"
          >
            <div
              className="h-full rounded-full bg-gold transition-[width] duration-700"
              style={{ width: `${Math.max(percent, 3)}%` }}
            />
          </div>

          {activeDriver ? (
            <div className="mt-4">
              <DriverCard driver={activeDriver} onEngage={engage} />
            </div>
          ) : null}
        </section>

        {/* ---- day picker ---- */}
        {days.length ? (
          <nav aria-label="Days" className="mt-7">
            <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
              {days.map((d, i) => {
                const isActive = i === activeDay;
                const isToday = i === todayIndex;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setActiveDay(i);
                      engage("day", `Day ${d.day_number}`);
                    }}
                    aria-current={isActive ? "true" : undefined}
                    className={`shrink-0 rounded-xl border px-3.5 py-2 text-left transition-colors ${
                      isActive
                        ? "border-navy bg-navy text-white"
                        : "border-hair bg-white text-navy hover:border-gold"
                    }`}
                  >
                    <span className="block text-[10px] font-semibold tracking-[0.12em] uppercase opacity-70">
                      Day {d.day_number}
                      {isToday ? " · Today" : ""}
                    </span>
                    <span className="mt-0.5 block max-w-[9rem] truncate text-xs font-semibold">
                      {d.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
        ) : null}

        {/* ---- the selected day ---- */}
        {day ? (
          <section aria-label={`Day ${day.day_number}`} className="mt-5">
            {day.coverUrl ? (
              <img
                src={day.coverUrl}
                alt=""
                className="w-full rounded-2xl border border-hair bg-white object-cover"
                style={{ aspectRatio: "16 / 9" }}
              />
            ) : null}

            <h2 className="mt-4 font-display text-xl leading-snug text-navy">{day.title}</h2>
            {day.date ? (
              <p className="mt-1 text-xs font-semibold tracking-wide text-gold-deep uppercase">
                {formatLongDate(day.date)}
              </p>
            ) : null}
            {day.summary ? (
              <p className="mt-2.5 text-[15px] leading-relaxed text-ink">{day.summary}</p>
            ) : null}

            <ol className="mt-6 flex flex-col gap-5">
              {day.steps.map((step) => (
                <li key={step.id} className="relative pl-9">
                  {/* The rail and numbered dot. A real sequence, so numbering
                      encodes something true — the order things happen in. */}
                  <span
                    aria-hidden="true"
                    className="absolute top-8 bottom-[-1.25rem] left-[0.875rem] w-px bg-hair last:hidden"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute top-0.5 left-0 grid size-7 place-items-center rounded-full bg-navy font-mono text-[11px] font-bold text-white"
                  >
                    {step.step_number}
                  </span>

                  <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                    <h3 className="text-[15px] font-bold text-navy">{step.title}</h3>
                    {step.time_label ? (
                      <span className="rounded-md bg-gold/15 px-2 py-0.5 font-mono text-[11px] font-semibold text-gold-deep">
                        {step.time_label}
                      </span>
                    ) : null}
                    {step.duration ? (
                      <span className="text-[11px] text-muted">{step.duration}</span>
                    ) : null}
                  </div>

                  {step.location_name ? (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                      <span aria-hidden="true">📍</span>
                      <span>{step.location_name}</span>
                    </p>
                  ) : null}

                  {step.description ? (
                    <p className="mt-2 text-[15px] leading-relaxed whitespace-pre-line text-ink">
                      {step.description}
                    </p>
                  ) : null}

                  {step.blocks.length ? (
                    <div className="mt-3">
                      <BlockList
                        blocks={step.blocks}
                        ctx={{ drivers, documents, invoices, onEngage: engage }}
                      />
                    </div>
                  ) : null}
                </li>
              ))}
            </ol>

            {!day.steps.length ? (
              <p className="mt-4 rounded-xl border border-hair bg-white p-4 text-sm text-muted">
                Your consultant is still finalising this day. It will appear here as soon as it is
                ready.
              </p>
            ) : null}
          </section>
        ) : (
          <section className="mt-7 rounded-2xl border border-hair bg-white p-5">
            <h2 className="font-display text-lg text-navy">Your itinerary is being prepared</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Your booking is confirmed. Your consultant is writing up the day-by-day plan and it
              will appear here — this same link, no need for a new one.
            </p>
          </section>
        )}

        {/* ---- invoices ---- */}
        {invoices.length ? (
          <section aria-label="Invoices" className="mt-9">
            <SectionHeading>Payment</SectionHeading>
            <div className="mt-3 flex flex-col gap-3">
              {invoices.map((invoice) => (
                <InvoiceCard key={invoice.id} invoice={invoice} onEngage={engage} />
              ))}
            </div>
          </section>
        ) : null}

        {/* ---- documents ---- */}
        {documents.length ? (
          <section aria-label="Documents" className="mt-9">
            <SectionHeading>Your documents</SectionHeading>
            <div className="mt-3 flex flex-col gap-2">
              {documents.map((doc) => (
                <DocumentLink key={doc.id} doc={doc} onEngage={engage} />
              ))}
            </div>
          </section>
        ) : null}

        {/* ---- drivers not already shown at the top ---- */}
        {drivers.filter((d) => d.id !== activeDriver?.id).length ? (
          <section aria-label="Drivers" className="mt-9">
            <SectionHeading>Your drivers</SectionHeading>
            <div className="mt-3 flex flex-col gap-3">
              {drivers
                .filter((d) => d.id !== activeDriver?.id)
                .map((d) => (
                  <DriverCard key={d.id} driver={d} onEngage={engage} />
                ))}
            </div>
          </section>
        ) : null}

        {/* ---- progress history ---- */}
        {progress.length > 1 ? (
          <section aria-label="Updates" className="mt-9">
            <SectionHeading>Updates</SectionHeading>
            <ol className="mt-3 flex flex-col gap-3">
              {progress.map((p) => {
                const m = stageMeta(p.stage);
                return (
                  <li key={p.id} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-navy">
                        {m?.customerLabel ?? p.stage}
                      </p>
                      {p.note ? <p className="text-sm leading-relaxed text-ink">{p.note}</p> : null}
                      <p className="text-xs text-muted">{formatStamp(p.created_at)}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        ) : null}

        {/* ---- help ---- */}
        <section aria-label="Help" className="mt-9 rounded-2xl border border-hair bg-white p-4">
          <SectionHeading>Need help?</SectionHeading>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Someone from the office is reachable at any hour of your trip.
          </p>
          <div className="mt-3.5 flex flex-col gap-2">
            <a
              href={`https://wa.me/971561228069?text=${encodeURIComponent(
                `Hello Nawi Saadi, this is about trip ${trip.trip_code}.`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => engage("help_whatsapp", trip.trip_code)}
              className="rounded-xl bg-gold py-3 text-center text-sm font-bold text-navy"
            >
              WhatsApp the office
            </a>
            <a
              href="tel:+971561228069"
              onClick={() => engage("help_call", trip.trip_code)}
              className="rounded-xl bg-navy py-3 text-center text-sm font-bold text-white"
            >
              Call +971 56 122 8069
            </a>
            {trip.emergency_phone ? (
              <a
                href={`tel:${trip.emergency_phone}`}
                onClick={() => engage("emergency_call", trip.emergency_name ?? "emergency")}
                className="rounded-xl border border-alert/40 bg-alert/8 py-3 text-center text-sm font-bold text-alert"
              >
                Emergency · {trip.emergency_name ?? "24/7 line"}
              </a>
            ) : null}
          </div>
        </section>

        {/*
          The disclosure.
          Shown rather than buried, because the office can see when this page is
          opened and which sections were read. A system that watches people
          without telling them is a different thing wearing the same name, and
          one plain sentence is the whole cost of not being that.
        */}
        <footer className="mt-9 border-t border-hair pt-5 text-center">
          <p className="text-[11px] leading-relaxed text-muted">
            This is your private trip link — please don&apos;t share it, as it carries your
            documents. So we can help you faster, our office can see when this page is opened and
            which sections you viewed. We don&apos;t track your location and nothing you type here
            is recorded.
          </p>
          <p className="mt-3 text-[11px] text-muted">
            Nawi Saadi Travel &amp; Tourism · Naif Road, Deira, Dubai · IATA accredited
          </p>
        </footer>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-semibold tracking-[0.16em] text-gold-deep uppercase">
      {children}
    </h2>
  );
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** "28 Sep – 3 Oct 2026", collapsing the month when both dates share one. */
function formatRange(start: string, end: string): string {
  const a = new Date(start);
  const b = new Date(end);
  const sameMonth =
    a.getUTCMonth() === b.getUTCMonth() && a.getUTCFullYear() === b.getUTCFullYear();
  const mon = (d: Date) => MONTHS[d.getUTCMonth()]?.slice(0, 3) ?? "";
  if (sameMonth) {
    return `${a.getUTCDate()}–${b.getUTCDate()} ${mon(b)} ${b.getUTCFullYear()}`;
  }
  return `${a.getUTCDate()} ${mon(a)} – ${b.getUTCDate()} ${mon(b)} ${b.getUTCFullYear()}`;
}

function formatLongDate(date: string): string {
  const d = new Date(date);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()] ?? ""} ${d.getUTCFullYear()}`;
}

function formatStamp(iso: string): string {
  const d = new Date(iso);
  // Rendered in Dubai time regardless of the traveller's device clock. A
  // customer in Dubai reading "driver arrived 10:12" wants Dubai's 10:12, and a
  // family member following from Kabul should see the same number the office
  // sees, not one shifted by an hour.
  return d.toLocaleString("en-GB", {
    timeZone: "Asia/Dubai",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - Date.parse(iso)) / 1000);
  if (!Number.isFinite(seconds) || seconds < 0) return "just now";
  if (seconds < 90) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? "day" : "days"} ago`;
  return formatStamp(iso);
}

function paxLabel(adults: number, children: number): string {
  const parts = [`${adults} adult${adults === 1 ? "" : "s"}`];
  if (children > 0) parts.push(`${children} child${children === 1 ? "" : "ren"}`);
  return parts.join(", ");
}
