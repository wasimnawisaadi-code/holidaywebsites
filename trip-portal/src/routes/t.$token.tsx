import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState, type CSSProperties } from "react";

import { BlockList, DriverCard, DocumentLink } from "@/components/Blocks";
import { Directions } from "@/components/Directions";
import { Icon, type IconName } from "@/components/Icon";
import { InvoiceCard } from "@/components/InvoiceCard";
import { JourneyTracker } from "@/components/JourneyTracker";
import { MapView, type MapPoint } from "@/components/MapView";
import { destinationPhoto } from "@/lib/destinations";
import { isLatLng } from "@/lib/geo";
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
      ? [{ title: `${loaderData.trip.destination} · ${loaderData.trip.trip_code} · Nawi Saadi` }]
      : [],
  }),
  component: Portal,
});

const OFFICE_WHATSAPP = "971561228069";
const OFFICE_PHONE = "+971561228069";

/* ---------------------------------------------------------------------- */

function Portal() {
  const data = Route.useLoaderData() as CustomerTrip;
  const { trip, days, drivers, documents, progress, invoices, currentStage, percent } = data;
  const token = Route.useParams().token;

  const engage = (event: string, detail: string) => {
    // No await and no catch on the caller's side: this fires on a click that is
    // usually also a navigation (a tel: link, a download), and anything that
    // blocks or throws here delays the thing the customer actually pressed.
    void logEngagement({ data: { token, event, detail } }).catch(() => {});
  };

  /**
   * Which day to open on.
   *
   * A customer mid-trip wants today, not day one. "Today" is Dubai's today, not
   * the server's UTC date: for the four hours after midnight in Dubai the two
   * disagree, and a customer opening the link at 1am on day three would have
   * been shown day two.
   */
  const todayIndex = useMemo(() => {
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai" }).format(new Date());
    const exact = days.findIndex((d) => d.date === today);
    if (exact >= 0) return exact;
    if (today < trip.start_date) return 0;
    if (today > trip.end_date) return Math.max(0, days.length - 1);
    const elapsed = Math.floor((Date.parse(today) - Date.parse(trip.start_date)) / 86_400_000);
    return Math.min(Math.max(elapsed, 0), Math.max(0, days.length - 1));
  }, [days, trip.start_date, trip.end_date]);

  const [activeDay, setActiveDay] = useState(todayIndex);
  const day = days[activeDay];
  const stage = currentStage ? stageMeta(currentStage) : null;
  const latest = progress[0];
  const heroPhoto = trip.heroUrl ?? destinationPhoto(trip.destination);

  // The driver named most recently in the timeline — who the customer is looking
  // for when the status says "your driver has arrived".
  const activeDriver = useMemo(() => {
    const entry = progress.find((p) => p.driver_id);
    return entry ? drivers.find((d) => d.id === entry.driver_id) : undefined;
  }, [progress, drivers]);

  const messages = progress.filter((p) => p.note);
  const pdfHref = (invoiceId: string) => `/t/${token}/invoice/${invoiceId}.pdf`;

  const sections: { id: string; label: string; show: boolean }[] = [
    { id: "itinerary", label: "Itinerary", show: true },
    { id: "payment", label: "Payment", show: invoices.length > 0 },
    { id: "documents", label: "Documents", show: documents.length > 0 },
    { id: "help", label: "Help", show: true },
  ];

  const selectDay = (i: number) => {
    const d = days[i];
    if (!d) return;
    setActiveDay(i);
    engage("day", `Day ${d.day_number}`);
  };

  // The section bar follows the reader: whichever section holds the middle of
  // the screen is the one lit up, so the bar doubles as "you are here".
  const [inView, setInView] = useState("itinerary");
  useEffect(() => {
    const targets = sections
      .filter((s) => s.show)
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => Boolean(el));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setInView(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // Sections only change when the trip does.
  }, [invoices.length, documents.length]);

  // Every step of the open day that has a pin, in order: the day on a map.
  const route: MapPoint[] = (day?.steps ?? []).flatMap((st) =>
    isLatLng(st.latitude, st.longitude)
      ? [
          {
            lat: st.latitude!,
            lng: st.longitude!,
            number: st.step_number,
            label: st.location_name ?? st.title,
          },
        ]
      : [],
  );

  return (
    <div className="min-h-screen bg-white pb-24">
      <div
        aria-hidden="true"
        className="ns-read fixed inset-x-0 top-0 z-50 h-[3px] bg-gradient-to-r from-gold to-gold-light"
      />

      {/* ================================================================
          Hero: the destination, the traveller, the dates.
          The one dark area in the portal, and it is a photograph.
          ============================================================== */}
      <header className="relative isolate min-h-[27rem] overflow-hidden text-white sm:min-h-[31rem]">
        <div aria-hidden="true" className="ns-parallax absolute inset-0 -z-20">
          <img
            src={heroPhoto}
            alt=""
            fetchPriority="high"
            className="ns-kenburns size-full object-cover"
          />
        </div>
        {/* Legibility, not mood: dark enough behind the logo at the top and the
            title at the bottom, and clear through the middle so the place shows. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-deep/70 via-navy-deep/10 to-navy-deep/90"
        />

        <div className="mx-auto flex min-h-[27rem] max-w-2xl flex-col px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-20 sm:min-h-[31rem]">
          <div className="flex items-center justify-between">
            <img
              src="/brand/logo-white.webp"
              alt="Nawi Saadi Travel & Tourism"
              className="h-14 w-auto drop-shadow sm:h-16"
            />
            <span className="rounded-full bg-white/15 px-3 py-1 font-mono text-[11px] tracking-wide backdrop-blur">
              {trip.trip_code}
            </span>
          </div>

          <div className="ns-hero-out mt-auto">
            <p
              className="ns-rise flex items-center gap-2 text-[11px] font-semibold tracking-[0.24em] text-gold-light uppercase"
              style={delay(100)}
            >
              <span className="h-px w-8 bg-gold-light" />
              Your journey
            </p>
            <h1
              className="ns-rise mt-3 font-display text-[2.1rem] leading-[1.1] text-balance sm:text-5xl"
              style={delay(220)}
            >
              {trip.title ?? trip.destination}
            </h1>
            {trip.title ? (
              <p
                className="ns-rise mt-2 flex items-center gap-1.5 text-sm text-white/85"
                style={delay(320)}
              >
                <Icon name="globe" className="size-4 text-gold-light" /> {trip.destination}
              </p>
            ) : null}

            <div className="ns-rise mt-5 flex flex-wrap gap-2" style={delay(420)}>
              <HeroChip icon="calendar" text={formatRange(trip.start_date, trip.end_date)} />
              <HeroChip icon="users" text={paxLabel(trip.pax_adults, trip.pax_children)} />
            </div>
            {trip.customer?.full_name ? (
              <p className="ns-rise mt-4 text-sm text-white/80" style={delay(520)}>
                Prepared for{" "}
                <span className="font-semibold text-white">{trip.customer.full_name}</span>
              </p>
            ) : null}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 sm:px-5">
        {/* ================================================================
            Live status and the whole journey
            ============================================================== */}
        <section
          aria-label="Trip progress"
          className="ns-rise relative -mt-14 rounded-3xl border border-hair bg-white p-5 shadow-[0_24px_60px_-28px_rgba(0,35,64,0.45)] sm:p-6"
          style={delay(380)}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.2em] text-gold-deep uppercase">
                Live status
              </p>
              {/* items-start with the dot nudged to the first line's middle: a
                  long status wraps to two lines, and centring the dot put it
                  between them, detached from the words it marks as live. */}
              <p className="mt-2 flex items-start gap-2.5 font-display text-2xl leading-tight text-navy">
                <span
                  aria-hidden="true"
                  className="ns-pulse mt-[0.6rem] inline-block size-2.5 shrink-0 rounded-full bg-live"
                />
                <span>{stage?.customerLabel ?? "Your trip is confirmed"}</span>
              </p>
              {latest?.note ? (
                <p className="mt-2.5 rounded-xl bg-sand px-3.5 py-2.5 text-sm leading-relaxed text-ink">
                  {latest.note}
                </p>
              ) : null}
              {latest ? (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                  <Icon name="clock" className="size-3.5" /> Updated {timeAgo(latest.created_at)}
                </p>
              ) : null}
            </div>
            <div className="shrink-0 text-right">
              <p className="font-display text-3xl text-gold-deep tabular-nums">
                <span className="sr-only">{percent}%</span>
                <span
                  aria-hidden="true"
                  className="ns-count"
                  style={{ "--ns-n": percent } as CSSProperties}
                />
                <span aria-hidden="true">%</span>
              </p>
              <p className="text-[10px] tracking-wider text-muted uppercase">complete</p>
            </div>
          </div>

          <div
            className="mt-4 h-1.5 overflow-hidden rounded-full bg-paper"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Trip progress"
          >
            <div
              className="ns-bar h-full rounded-full bg-gradient-to-r from-gold to-gold-light transition-[width] duration-700"
              style={{ width: `${Math.max(percent, 3)}%` }}
            />
          </div>

          <div className="mt-6">
            <JourneyTracker progress={progress} current={currentStage} />
          </div>

          {activeDriver ? (
            <div className="mt-5">
              <DriverCard driver={activeDriver} onEngage={engage} />
            </div>
          ) : null}
        </section>
      </div>

      {/* ================================================================
          Section bar — sticky, so any part of the trip is one tap away
          ============================================================== */}
      <nav
        aria-label="Sections"
        className="sticky top-0 z-30 mt-8 border-y border-hair bg-white/90 backdrop-blur"
      >
        <div className="no-scrollbar mx-auto flex max-w-2xl gap-1 overflow-x-auto px-4 py-2 sm:px-5">
          {sections
            .filter((s) => s.show)
            .map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                aria-current={inView === s.id ? "location" : undefined}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 ${
                  inView === s.id ? "bg-navy text-white" : "text-navy hover:bg-sand"
                }`}
              >
                {s.label}
              </a>
            ))}
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-4 sm:px-5">
        {/* ================================================================
            Itinerary
            ============================================================== */}
        <section id="itinerary" data-anchor aria-label="Itinerary" className="pt-10">
          <SectionOpener eyebrow="Day by day" title="Your" accent="itinerary" />

          {days.length ? (
            <>
              <div
                role="tablist"
                aria-label="Days"
                className="no-scrollbar -mx-4 mt-6 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:-mx-5 sm:px-5"
              >
                {days.map((d, i) => {
                  const active = i === activeDay;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => selectDay(i)}
                      className={`group w-40 shrink-0 snap-start overflow-hidden rounded-2xl border bg-white text-left transition ${
                        active
                          ? "border-gold shadow-lg ring-2 ring-gold/40"
                          : "border-hair shadow-sm hover:border-gold/60"
                      }`}
                    >
                      <span className="relative block h-24 overflow-hidden bg-paper">
                        <img
                          src={d.coverUrl ?? destinationPhoto(trip.destination, true)}
                          alt=""
                          loading="lazy"
                          className="size-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <span className="absolute inset-0 bg-gradient-to-t from-navy-deep/70 to-transparent" />
                        <span className="absolute bottom-2 left-2.5 text-[10px] font-bold tracking-[0.16em] text-white uppercase">
                          Day {d.day_number}
                        </span>
                        {i === todayIndex ? (
                          <span className="absolute top-2 right-2 rounded-full bg-gold px-2 py-0.5 text-[9px] font-bold tracking-wider text-navy uppercase">
                            Today
                          </span>
                        ) : null}
                      </span>
                      <span className="block px-3 py-2.5">
                        <span className="block truncate text-sm font-semibold text-navy">
                          {d.title}
                        </span>
                        {d.date ? (
                          <span className="block text-[11px] text-muted">{shortDate(d.date)}</span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>

              {day ? (
                <article
                  key={day.id}
                  role="tabpanel"
                  aria-label={`Day ${day.day_number}`}
                  className="ns-fade-in mt-7"
                >
                  {day.coverUrl ? (
                    <img
                      src={day.coverUrl}
                      alt=""
                      className="w-full rounded-3xl object-cover shadow-md"
                      style={{ aspectRatio: "16 / 9" }}
                    />
                  ) : null}

                  <p
                    className={`${day.coverUrl ? "mt-5" : ""} text-[11px] font-semibold tracking-[0.2em] text-gold-deep uppercase`}
                  >
                    Day {day.day_number}
                    {day.date ? ` · ${formatLongDate(day.date)}` : ""}
                  </p>
                  <h3 className="mt-1.5 font-display text-3xl leading-tight text-navy">
                    {day.title}
                  </h3>
                  {day.summary ? (
                    <p className="mt-3 text-[15px] leading-relaxed text-muted">{day.summary}</p>
                  ) : null}

                  {route.length ? (
                    <div className="ns-reveal mt-6">
                      <div className="flex items-center justify-between gap-3">
                        <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-gold-deep uppercase">
                          <Icon name="route" className="size-4" /> Day {day.day_number} on the map
                        </p>
                        <span className="text-xs text-muted">
                          {route.length} {route.length === 1 ? "stop" : "stops"}
                        </span>
                      </div>
                      <MapView
                        className="mt-3 h-64 shadow-sm sm:h-72"
                        label={`Map of day ${day.day_number}`}
                        points={route}
                        route
                      />
                    </div>
                  ) : null}

                  {day.steps.length ? (
                    <ol className="mt-8 flex flex-col">
                      {day.steps.map((step, n) => (
                        <li key={step.id} className="ns-reveal relative pb-10 pl-12 last:pb-2">
                          {n < day.steps.length - 1 ? (
                            <span
                              aria-hidden="true"
                              className="ns-draw absolute top-10 bottom-0 left-[1.1875rem] w-px bg-gradient-to-b from-gold/60 to-hair"
                            />
                          ) : null}
                          <span
                            aria-hidden="true"
                            className="absolute top-0 left-0 grid size-10 place-items-center rounded-full bg-navy font-sans text-base font-bold text-white shadow-md ring-4 ring-white"
                          >
                            {step.step_number}
                          </span>

                          <div className="flex flex-wrap items-center gap-2 pt-1.5">
                            {step.time_label ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-bold text-gold-deep tabular-nums">
                                <Icon name="clock" className="size-3" /> {step.time_label}
                              </span>
                            ) : null}
                            {step.duration ? (
                              <span className="text-[11px] text-muted">{step.duration}</span>
                            ) : null}
                          </div>
                          <h4 className="mt-2 text-lg leading-snug font-semibold text-navy">
                            {step.title}
                          </h4>

                          {step.location_name ? (
                            <p className="mt-1 flex items-start gap-1.5 text-sm text-muted">
                              <Icon name="pin" className="mt-0.5 size-4 shrink-0 text-gold-deep" />
                              <span>{step.location_name}</span>
                            </p>
                          ) : null}
                          {isLatLng(step.latitude, step.longitude) ? (
                            <div className="mt-3 max-w-sm">
                              <Directions
                                lat={step.latitude!}
                                lng={step.longitude!}
                                label={step.location_name ?? step.title}
                                onEngage={engage}
                                compact
                              />
                            </div>
                          ) : null}

                          {step.description ? (
                            <p className="mt-2.5 text-[15px] leading-relaxed whitespace-pre-line text-ink">
                              {step.description}
                            </p>
                          ) : null}

                          {step.blocks.length ? (
                            <div className="mt-4">
                              <BlockList
                                blocks={step.blocks}
                                ctx={{
                                  drivers,
                                  documents,
                                  invoices,
                                  invoicePdfHref: pdfHref,
                                  onEngage: engage,
                                }}
                              />
                            </div>
                          ) : null}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="mt-6 rounded-2xl bg-paper p-5 text-sm leading-relaxed text-muted">
                      Your consultant is still finalising this day. It will appear here as soon as
                      it is ready — on this same link.
                    </p>
                  )}

                  {days.length > 1 ? (
                    <div className="mt-6 grid grid-cols-2 gap-3 border-t border-hair pt-6">
                      {activeDay > 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            selectDay(activeDay - 1);
                            document.getElementById("itinerary")?.scrollIntoView();
                          }}
                          className="flex items-center gap-2 rounded-2xl border border-hair p-3.5 text-left text-sm transition hover:border-gold"
                        >
                          <Icon name="chevronLeft" className="size-4 shrink-0 text-gold-deep" />
                          <span className="min-w-0">
                            <span className="block text-[10px] tracking-wider text-muted uppercase">
                              Day {days[activeDay - 1]?.day_number}
                            </span>
                            <span className="block truncate font-semibold text-navy">
                              {days[activeDay - 1]?.title}
                            </span>
                          </span>
                        </button>
                      ) : (
                        <span />
                      )}
                      {activeDay < days.length - 1 ? (
                        <button
                          type="button"
                          onClick={() => {
                            selectDay(activeDay + 1);
                            document.getElementById("itinerary")?.scrollIntoView();
                          }}
                          className="flex items-center justify-end gap-2 rounded-2xl border border-hair p-3.5 text-right text-sm transition hover:border-gold"
                        >
                          <span className="min-w-0">
                            <span className="block text-[10px] tracking-wider text-muted uppercase">
                              Day {days[activeDay + 1]?.day_number}
                            </span>
                            <span className="block truncate font-semibold text-navy">
                              {days[activeDay + 1]?.title}
                            </span>
                          </span>
                          <Icon name="chevronRight" className="size-4 shrink-0 text-gold-deep" />
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              ) : null}
            </>
          ) : (
            <div className="mt-6 rounded-3xl bg-sand p-6">
              <h3 className="font-display text-xl text-navy">Your itinerary is being prepared</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Your booking is confirmed. Your consultant is writing up the day-by-day plan and it
                will appear here — on this same link, no need for a new one.
              </p>
            </div>
          )}
        </section>

        {/* ================================================================
            Payment
            ============================================================== */}
        {invoices.length ? (
          <section id="payment" data-anchor aria-label="Payment" className="pt-14">
            <SectionOpener eyebrow="Payment" title="Invoices &" accent="balance" />
            <div className="mt-6 flex flex-col gap-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="ns-reveal">
                  <InvoiceCard invoice={invoice} pdfHref={pdfHref(invoice.id)} onEngage={engage} />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* ================================================================
            Documents
            ============================================================== */}
        {documents.length ? (
          <section id="documents" data-anchor aria-label="Documents" className="pt-14">
            <SectionOpener eyebrow="Travel documents" title="Your" accent="documents" />
            <div className="mt-6 flex flex-col gap-2.5">
              {documents.map((doc) => (
                <div key={doc.id} className="ns-reveal">
                  <DocumentLink doc={doc} onEngage={engage} />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* ---- drivers not already shown at the top ---- */}
        {drivers.filter((d) => d.id !== activeDriver?.id).length ? (
          <section aria-label="Drivers" className="pt-14">
            <SectionOpener eyebrow="On the road" title="Your" accent="drivers" />
            <div className="mt-6 flex flex-col gap-3">
              {drivers
                .filter((d) => d.id !== activeDriver?.id)
                .map((d) => (
                  <div key={d.id} className="ns-reveal">
                    <DriverCard driver={d} onEngage={engage} />
                  </div>
                ))}
            </div>
          </section>
        ) : null}

        {/* ---- messages from the office ---- */}
        {messages.length ? (
          <section aria-label="Messages" className="pt-14">
            <SectionOpener eyebrow="From your consultant" title="Latest" accent="messages" />
            <ol className="mt-6 flex flex-col gap-3">
              {messages.map((m) => (
                <li
                  key={m.id}
                  className="ns-reveal rounded-2xl border border-hair bg-white p-4 shadow-sm"
                >
                  <p className="text-[11px] font-semibold tracking-wider text-gold-deep uppercase">
                    {stageMeta(m.stage)?.customerLabel ?? m.stage}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink">{m.note}</p>
                  <p className="mt-2 text-xs text-muted tabular-nums">
                    {formatStamp(m.created_at)}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {/* ================================================================
            Help
            ============================================================== */}
        <section id="help" data-anchor aria-label="Help" className="pt-14">
          <SectionOpener eyebrow="We are with you" title="Need" accent="help?" />
          <div className="ns-reveal mt-6 overflow-hidden rounded-3xl border border-hair bg-sand">
            <div className="p-5">
              <p className="text-sm leading-relaxed text-ink">
                Someone from the office is reachable at any hour of your trip. Mention your trip
                reference{" "}
                <span className="font-mono font-semibold text-navy">{trip.trip_code}</span> and we
                will have everything in front of us.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <a
                  href={`https://wa.me/${OFFICE_WHATSAPP}?text=${encodeURIComponent(
                    `Hello Nawi Saadi, this is about trip ${trip.trip_code}.`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => engage("help_whatsapp", trip.trip_code)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gold py-3.5 text-sm font-semibold text-navy transition hover:bg-gold-light"
                >
                  <Icon name="chat" className="size-4" /> WhatsApp the office
                </a>
                <a
                  href={`tel:${OFFICE_PHONE}`}
                  onClick={() => engage("help_call", trip.trip_code)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-navy py-3.5 text-sm font-semibold text-white transition hover:bg-navy-deep"
                >
                  <Icon name="phone" className="size-4" /> Call +971 56 122 8069
                </a>
              </div>
            </div>
            {trip.emergency_phone ? (
              <a
                href={`tel:${trip.emergency_phone}`}
                onClick={() => engage("emergency_call", trip.emergency_name ?? "emergency")}
                className="flex items-center gap-3 border-t border-alert/20 bg-alert/6 px-5 py-4 text-sm font-semibold text-alert"
              >
                <Icon name="alert" className="size-5" />
                <span className="flex-1">Emergency · {trip.emergency_name ?? "24/7 line"}</span>
                <span className="font-mono text-xs">{trip.emergency_phone}</span>
              </a>
            ) : null}
          </div>
        </section>

        {/* ================================================================
            Footer — who this is from, and what the office can see
            ============================================================== */}
        <footer className="mt-16 border-t border-hair pt-8 pb-6 text-center">
          <img
            src="/brand/logo-ink.webp"
            alt="Nawi Saadi Travel & Tourism"
            className="mx-auto h-12 w-auto"
          />
          <p className="mt-4 text-xs tracking-wide text-muted">
            IATA accredited · DTCM approved · Arranging travel since 2009
          </p>
          <p className="mt-1 text-xs text-muted">Millenium Building, Naif Road, Deira, Dubai</p>
          <p className="mx-auto mt-5 max-w-md text-[11px] leading-relaxed text-muted">
            This is your private trip link — please don&apos;t share it, as it carries your
            documents. So we can help you faster, our office can see when this page is opened and
            which sections you viewed. We don&apos;t track your location and nothing you type here
            is recorded.
          </p>
        </footer>
      </main>

      {/* ================================================================
          Always-there contact bar: the thing a traveller needs most is one
          thumb-press from any point on the page.
          ============================================================== */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hair bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto grid max-w-2xl grid-cols-2 gap-2">
          <a
            href={`https://wa.me/${OFFICE_WHATSAPP}?text=${encodeURIComponent(
              `Hello Nawi Saadi, this is about trip ${trip.trip_code}.`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => engage("bar_whatsapp", trip.trip_code)}
            className="flex items-center justify-center gap-2 rounded-xl bg-gold py-3 text-sm font-semibold text-navy"
          >
            <Icon name="chat" className="size-4" /> WhatsApp
          </a>
          <a
            href={`tel:${OFFICE_PHONE}`}
            onClick={() => engage("bar_call", trip.trip_code)}
            className="flex items-center justify-center gap-2 rounded-xl bg-navy py-3 text-sm font-semibold text-white"
          >
            <Icon name="phone" className="size-4" /> Call us
          </a>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */

/** The approved section opener: gold rule, eyebrow, Playfair title, gold italic tail. */
function SectionOpener({
  eyebrow,
  title,
  accent,
}: {
  eyebrow: string;
  title: string;
  accent: string;
}) {
  return (
    <div className="ns-reveal">
      <p className="flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.22em] text-gold-deep uppercase">
        <span className="h-px w-10 bg-gold" />
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-[1.9rem] leading-tight text-navy">
        {title} <span className="text-gold-deep italic">{accent}</span>
      </h2>
    </div>
  );
}

/** A staggered entrance: each line of the hero arrives a beat after the last. */
function delay(ms: number): CSSProperties {
  return { "--ns-delay": `${ms}ms` } as CSSProperties;
}

function HeroChip({ icon, text }: { icon: IconName; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
      <Icon name={icon} className="size-3.5 text-gold-light" />
      {text}
    </span>
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
  if (sameMonth) return `${a.getUTCDate()}–${b.getUTCDate()} ${mon(b)} ${b.getUTCFullYear()}`;
  return `${a.getUTCDate()} ${mon(a)} – ${b.getUTCDate()} ${mon(b)} ${b.getUTCFullYear()}`;
}

function formatLongDate(date: string): string {
  const d = new Date(date);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()] ?? ""} ${d.getUTCFullYear()}`;
}

function shortDate(date: string): string {
  const d = new Date(date);
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getUTCDay()];
  return `${weekday} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]?.slice(0, 3) ?? ""}`;
}

/** Dubai time regardless of the device clock, so office and customer agree. */
function formatStamp(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
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
  if (!Number.isFinite(seconds) || seconds < 90) return "just now";
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
