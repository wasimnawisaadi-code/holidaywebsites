import { useState, type ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import { destinationPhoto } from "@/lib/destinations";
import { dubaiToday, tripTiming, type TripOverview } from "@/lib/types";

type Filter = "active" | "travelling" | "upcoming" | "draft" | "payment" | "all";
const FILTERS: [Filter, string, IconName][] = [
  ["active", "All active trips", "globe"],
  ["travelling", "Travelling now", "plane"],
  ["upcoming", "Upcoming departures", "calendar"],
  ["draft", "Unpublished trips", "file"],
  ["payment", "Payment follow-up", "receipt"],
  ["all", "Trip archive", "list"],
];

export function OperationsWorkspace({
  trips,
  email,
  refreshing,
  creating,
  onCreate,
  onSignOut,
  onRefresh,
  renderTrip,
  children,
}: {
  trips: TripOverview[];
  email: string;
  refreshing: boolean;
  creating: boolean;
  onCreate: () => void;
  onSignOut: () => void;
  onRefresh: () => void;
  renderTrip: (trip: TripOverview) => ReactNode;
  children?: ReactNode;
}) {
  const [filter, setFilter] = useState<Filter>("active");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("departure");
  const [windowDays, setWindowDays] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const today = dubaiToday();
  const phase = (t: TripOverview) => tripTiming(t.start_date, t.end_date, today).phase;
  const live = trips.filter((t) => t.status !== "cancelled");
  const matches = (t: TripOverview, f: Filter) =>
    f === "all" ||
    (t.status !== "cancelled" &&
      (f === "active"
        ? phase(t) !== "finished"
        : f === "draft"
          ? !t.published_at
          : f === "payment"
            ? Number(t.balance_due) > 0
            : phase(t) === f));
  const shown = trips
    .filter(
      (t) =>
        matches(t, filter) &&
        (windowDays === "all" ||
          (t.start_date >= today &&
            (Date.parse(t.start_date) - Date.parse(today)) / 86400000 <= Number(windowDays))) &&
        [t.customer_name, t.trip_code, t.destination, t.title, t.customer_phone].some((v) =>
          v?.toLowerCase().includes(query.trim().toLowerCase()),
        ),
    )
    .sort((a, b) =>
      sort === "name"
        ? (a.customer_name ?? "").localeCompare(b.customer_name ?? "")
        : sort === "recent"
          ? b.created_at.localeCompare(a.created_at)
          : a.start_date.localeCompare(b.start_date),
    );
  const departures = live
    .filter((t) => phase(t) === "upcoming")
    .sort((a, b) => a.start_date.localeCompare(b.start_date))
    .slice(0, 4);
  const attention = live
    .filter(
      (t) => !t.published_at || t.published_day_count < t.day_count || Number(t.balance_due) > 0,
    )
    .slice(0, 4);
  const select = (f: Filter) => {
    setFilter(f);
    setQuery("");
    setWindowDays("all");
  };
  const exportTrips = () => {
    const cell = (v: unknown) =>
      '"' +
      String(v ?? "")
        .replace(/^[=+@\-\t\r]/, "'$&")
        .replaceAll('"', '""') +
      '"';
    const rows = [
      [
        "Reference",
        "Traveller",
        "Destination",
        "Departure",
        "Return",
        "Published days",
        "Total days",
        "Published",
      ],
      ...shown.map((t) => [
        t.trip_code,
        t.customer_name,
        t.destination,
        t.start_date,
        t.end_date,
        t.published_day_count,
        t.day_count,
        t.published_at ? "Yes" : "No",
      ]),
    ];
    const url = URL.createObjectURL(
      new Blob(["\ufeff" + rows.map((r) => r.map(cell).join(",")).join("\r\n")], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `trip-operations-${today}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <div className="ops-workspace min-h-screen bg-paper text-ink">
      <aside className="ops-sidebar fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-hair bg-white xl:flex">
        <a href="/admin" className="flex items-center gap-3 px-7 py-7">
          <img src="/brand/logo-ink.webp" alt="Nawi Saadi" className="h-12 w-auto" />
          <span className="border-l border-hair pl-3 text-[10px] font-bold tracking-[0.18em] text-navy uppercase">
            Travel
            <br />
            Workspace
          </span>
        </a>
        <p className="px-7 pt-5 pb-3 text-[10px] font-bold tracking-[0.2em] text-muted">
          OPERATIONS
        </p>
        <nav aria-label="Workspace" className="space-y-1 px-4">
          {FILTERS.map(([key, label, icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => select(key)}
              aria-pressed={filter === key}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-semibold transition ${filter === key ? "bg-navy text-white shadow-md" : "text-muted hover:bg-paper"}`}
            >
              <Icon name={icon} className="size-4" />
              <span className="flex-1">{label}</span>
              <span className={filter === key ? "text-white/70" : "text-muted"}>
                {trips.filter((t) => matches(t, key)).length}
              </span>
            </button>
          ))}
          <a
            href="/admin/drivers"
            className="mt-5 flex items-center gap-3 border-t border-hair px-3 py-4 text-xs font-semibold text-muted"
          >
            <Icon name="car" className="size-4" />
            Driver directory
            <Icon name="arrowRight" className="ml-auto size-3" />
          </a>
        </nav>
        <div className="mx-5 mt-auto mb-6 rounded-2xl bg-sand p-4">
          <Icon name="shield" className="size-5 text-gold-deep" />
          <p className="mt-3 text-sm font-semibold text-navy">
            A thoughtful journey.
            <br />
            Every single time.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Itineraries, documents and people. Together in one place.
          </p>
        </div>
      </aside>
      <div className="xl:pl-60">
        <header className="flex min-h-20 flex-wrap items-center justify-between gap-3 border-b border-hair bg-white px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <img src="/brand/logo-ink.webp" alt="Nawi Saadi" className="h-9 xl:hidden" />
            <span className="text-xs text-muted">
              Workspace <span className="px-2 text-hair">/</span>{" "}
              <strong className="text-navy">Trip operations</strong>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/admin/drivers" className="text-xs font-semibold text-navy xl:hidden">
              Drivers
            </a>
            <span className="hidden text-xs text-muted sm:block">{email}</span>
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className="rounded-lg border border-hair px-3 py-2 text-xs font-semibold text-navy"
            >
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
            <button type="button" onClick={onSignOut} className="text-xs font-semibold text-muted">
              Sign out
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8" aria-busy={refreshing}>
          <section className="ops-hero relative isolate overflow-hidden rounded-[28px] bg-navy px-6 py-8 text-white sm:px-9 sm:py-10">
            <img
              src={destinationPhoto("Dubai")}
              alt=""
              className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-deep via-navy-deep/85 to-navy-deep/20" />
            <p className="text-[10px] font-bold tracking-[0.25em] text-gold-light uppercase">
              Nawi Saadi · Travel operations
            </p>
            <h1 className="mt-4 max-w-lg font-display text-3xl leading-tight sm:text-5xl">
              A world of journeys.
              <br />
              <span className="text-gold-light italic">A personal touch.</span>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75">
              Your travellers, their next adventure, and every detail that makes it unforgettable.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onCreate}
                className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-navy shadow-lg transition hover:bg-sand"
              >
                {creating ? "Close new trip" : "+ New trip"}
              </button>
              <span className="text-xs text-white/75">
                {new Intl.DateTimeFormat("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  timeZone: "Asia/Dubai",
                }).format(new Date())}{" "}
                · Dubai
              </span>
            </div>
          </section>
          <div className="my-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {(
              [
                ["travelling", "Travelling now", "plane", "Journeys in progress"],
                ["upcoming", "Upcoming departures", "calendar", "Adventures on the horizon"],
                ["draft", "Awaiting publication", "file", "Ready for your finishing touches"],
                ["payment", "Payment follow-up", "receipt", "Trips with an outstanding balance"],
              ] as const
            ).map(([key, label, icon, caption]) => (
              <button
                key={key}
                type="button"
                onClick={() => select(key)}
                aria-pressed={filter === key}
                className={`ops-stat rounded-2xl border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${filter === key ? "border-gold ring-2 ring-gold/15" : "border-hair"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-muted">{label}</span>
                  <Icon name={icon} className="size-4 shrink-0 text-gold-deep" />
                </div>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-navy">
                  {trips
                    .filter((t) => matches(t, key))
                    .length.toString()
                    .padStart(2, "0")}
                </p>
                <p className="mt-2 hidden text-[11px] text-muted sm:block">{caption}</p>
              </button>
            ))}
          </div>
          {children}
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_260px]">
            <section className="min-w-0" aria-label="Trip collection">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.18em] text-gold-deep uppercase">
                    Made for memorable travel
                  </p>
                  <h2 className="mt-1 font-display text-2xl text-navy">
                    Your trip collection{" "}
                    <span className="ml-1 align-middle font-sans text-sm text-muted">
                      ({shown.length})
                    </span>
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={exportTrips}
                  disabled={!shown.length}
                  className="rounded-xl border border-hair bg-white px-3 py-2 text-xs font-semibold text-navy disabled:opacity-40"
                >
                  Export CSV
                </button>
                <div className="flex rounded-xl border border-hair bg-white p-1">
                  {(["grid", "list"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      aria-pressed={view === v}
                      onClick={() => setView(v)}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize ${view === v ? "bg-navy text-white" : "text-muted"}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4 rounded-2xl border border-hair bg-white p-3">
                <div className="flex flex-wrap gap-2">
                  <label className="min-w-40 flex-1">
                    <span className="sr-only">Search trips</span>
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search traveller, destination or booking…"
                      className="w-full rounded-xl bg-paper px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold"
                    />
                  </label>
                  <label>
                    <span className="sr-only">Departure window</span>
                    <select
                      value={windowDays}
                      onChange={(e) => setWindowDays(e.target.value)}
                      className="h-full rounded-xl border border-hair bg-white px-3 py-3 text-xs text-navy"
                    >
                      <option value="all">Any departure</option>
                      <option value="7">Next 7 days</option>
                      <option value="30">Next 30 days</option>
                    </select>
                  </label>
                  <label>
                    <span className="sr-only">Sort trips</span>
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="h-full rounded-xl border border-hair bg-white px-3 py-3 text-xs text-navy"
                    >
                      <option value="departure">Departure date</option>
                      <option value="recent">Recently created</option>
                      <option value="name">Traveller name</option>
                    </select>
                  </label>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {FILTERS.map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => select(key)}
                      aria-pressed={filter === key}
                      className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${filter === key ? "bg-navy text-white" : "bg-paper text-muted hover:bg-sand"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div
                className={
                  view === "grid"
                    ? "ops-trip-grid grid items-start gap-4 md:grid-cols-2"
                    : "ops-trip-list grid gap-4"
                }
              >
                {shown.map(renderTrip)}
              </div>
              {!shown.length ? (
                <div className="rounded-2xl border border-dashed border-hair bg-white p-10 text-center">
                  <Icon name="globe" className="mx-auto size-8 text-gold-deep" />
                  <h3 className="mt-3 text-lg font-semibold text-navy">No trips in this view</h3>
                  <p className="mt-2 text-sm text-muted">
                    Try another search or filter, or create a new trip.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      select("all");
                    }}
                    className="mt-4 text-sm font-semibold text-gold-deep"
                  >
                    Show all trips →
                  </button>
                </div>
              ) : null}
            </section>
            <aside
              className="grid gap-5 md:grid-cols-2 xl:grid-cols-1"
              aria-label="Operations planner"
            >
              <section className="rounded-2xl border border-hair bg-white p-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl text-navy">Next departures</h2>
                  <Icon name="plane" className="size-4 text-gold-deep" />
                </div>
                <p className="mt-1 text-xs text-muted">The next journeys on your calendar</p>
                <div className="mt-4 divide-y divide-hair">
                  {departures.map((t) => (
                    <a key={t.id} href={`/admin/trips/${t.id}`} className="flex gap-3 py-4">
                      <span className="flex h-12 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-sand text-gold-deep">
                        <strong className="text-lg leading-none">{t.start_date.slice(8)}</strong>
                        <span className="mt-1 text-[9px] font-bold uppercase">
                          {new Intl.DateTimeFormat("en-GB", {
                            month: "short",
                            timeZone: "UTC",
                          }).format(new Date(t.start_date + "T12:00:00Z"))}
                        </span>
                      </span>
                      <span className="min-w-0">
                        <strong className="block truncate text-xs text-navy">
                          {t.customer_name || "Traveller"}
                        </strong>
                        <span className="mt-1 block text-xs text-muted">{t.destination}</span>
                        <span className="mt-1 block text-[10px] text-gold-deep">
                          Open itinerary →
                        </span>
                      </span>
                    </a>
                  ))}
                  {!departures.length ? (
                    <p className="py-4 text-sm text-muted">No upcoming departures yet.</p>
                  ) : null}
                </div>
              </section>
              <section className="rounded-2xl border border-gold/30 bg-[#fcfaf4] p-5">
                <div className="flex items-center gap-2">
                  <Icon name="alert" className="size-4 text-gold-deep" />
                  <h2 className="font-display text-xl text-navy">Needs attention</h2>
                </div>
                <div className="mt-3 space-y-3">
                  {attention.map((t) => (
                    <a
                      key={t.id}
                      href={`/admin/trips/${t.id}`}
                      className="block rounded-xl border border-gold/15 bg-white p-3"
                    >
                      <strong className="block truncate text-xs text-navy">
                        {t.customer_name || t.trip_code}
                      </strong>
                      <span className="mt-1 block text-[11px] leading-relaxed text-muted">
                        {[
                          !t.published_at ? "Trip not published" : null,
                          t.published_day_count < t.day_count
                            ? `${t.day_count - t.published_day_count} unpublished days`
                            : null,
                          Number(t.balance_due) > 0 ? "Payment outstanding" : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </a>
                  ))}
                  {!attention.length ? (
                    <p className="text-sm leading-relaxed text-muted">
                      All clear. Your trips have no outstanding publication or payment items.
                    </p>
                  ) : null}
                </div>
              </section>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
