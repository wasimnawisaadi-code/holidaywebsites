import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";

import {
  PROGRESS_STAGES,
  stageMeta,
  stagePercent,
  type ProgressStage,
  type TripOverview,
} from "@/lib/types";

/**
 * The operations dashboard.
 *
 * This is the screen the office lives in, and it answers exactly two questions
 * without anyone having to click into a trip:
 *
 *   1. Which customers are travelling, and how far has each one got?
 *   2. Has the customer actually opened the link we sent them?
 *
 * The second question is the one that earns its place. An office that can see
 * "sent three days ago, never opened" knows to ring before the customer is
 * standing in an arrivals hall wondering who is collecting them.
 */

/* -------------------------------------------------------------------------
 * Server functions
 *
 * Every one of these re-checks the session. Not once in a loader and then
 * trusted — each individual mutation. A server function is a public HTTP
 * endpoint; a create or publish handler that only checks "was the page
 * rendered for an admin" is callable directly by anyone who reads the network
 * tab.
 * ---------------------------------------------------------------------- */

const readSession = createServerFn({ method: "GET" }).handler(async () => {
  const { getCookie } = await import("@tanstack/react-start/server");
  const { sessionFromToken, SESSION_COOKIE } = await import("@/lib/auth");
  const session = await sessionFromToken(getCookie(SESSION_COOKIE));
  return session ? { email: session.email, via: session.via } : null;
});

/** Throws if there is no session. Every mutation below starts with this. */
async function requireSession(): Promise<{ email: string }> {
  const { getCookie } = await import("@tanstack/react-start/server");
  const { sessionFromToken, SESSION_COOKIE } = await import("@/lib/auth");
  const session = await sessionFromToken(getCookie(SESSION_COOKIE));
  if (!session) throw new Error("Not signed in.");
  return { email: session.email };
}

const doSignIn = createServerFn({ method: "POST" })
  .validator((input: { email: string; password: string }) => input)
  .handler(async ({ data }) => {
    const { setCookie, getRequestIP } = await import("@tanstack/react-start/server");
    const auth = await import("@/lib/auth");

    // Keyed on IP plus address, so one attacker cannot lock out a colleague by
    // spraying their email, and a shared office IP does not lock out everyone.
    const key = `${getRequestIP({ xForwardedFor: true }) ?? "unknown"}:${data.email.toLowerCase()}`;
    const wait = auth.throttleRetryAfterMs(key);
    if (wait > 0) {
      return {
        ok: false as const,
        reason: `Too many attempts. Try again in ${Math.ceil(wait / 60000)} minutes.`,
      };
    }

    const result = await auth.signIn(data.email, data.password);
    if (!result.ok) {
      auth.recordFailedSignIn(key);
      return { ok: false as const, reason: result.reason };
    }

    auth.clearFailedSignIns(key);
    setCookie(auth.SESSION_COOKIE, result.token, {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      // 'lax', not 'strict': the office opens this from a WhatsApp message and a
      // strict cookie is not sent on that first cross-site navigation, which
      // reads as "signed out" every time.
      sameSite: "lax",
      path: "/",
      maxAge: auth.SESSION_TTL_SECONDS,
    });
    return { ok: true as const, email: result.email };
  });

const doSignOut = createServerFn({ method: "POST" }).handler(async () => {
  const { deleteCookie } = await import("@tanstack/react-start/server");
  const { SESSION_COOKIE } = await import("@/lib/auth");
  deleteCookie(SESSION_COOKIE, { path: "/" });
  return { ok: true };
});

const fetchTrips = createServerFn({ method: "GET" }).handler(async () => {
  const { getCookie } = await import("@tanstack/react-start/server");
  const { sessionFromToken, SESSION_COOKIE } = await import("@/lib/auth");
  if (!(await sessionFromToken(getCookie(SESSION_COOKIE)))) return null;

  const { listTrips } = await import("@/lib/trips");
  const { portalBaseUrl } = await import("@/lib/urls");
  return { trips: await listTrips(), base: portalBaseUrl() };
});

const createTrip = createServerFn({ method: "POST" })
  .validator(
    (input: {
      customerName: string;
      phone: string;
      whatsapp: string;
      destination: string;
      title: string;
      startDate: string;
      endDate: string;
      adults: number;
      children: number;
    }) => input,
  )
  .handler(async ({ data }) => {
    const { email } = await requireSession();
    const { insert } = await import("@/lib/db");
    const { newToken, nextTripCode } = await import("@/lib/trips");

    // Validated here and not only in the browser. The form's `required`
    // attributes are a convenience for the person typing; this is the rule.
    const name = data.customerName.trim();
    const destination = data.destination.trim();
    if (!name) return { ok: false as const, reason: "Customer name is required." };
    if (!destination) return { ok: false as const, reason: "Destination is required." };
    if (!data.startDate || !data.endDate) {
      return { ok: false as const, reason: "Both dates are required." };
    }
    if (data.endDate < data.startDate) {
      return { ok: false as const, reason: "The end date cannot be before the start date." };
    }

    const customers = await insert<{ id: string }[]>("trip_customers", {
      full_name: name,
      phone: data.phone.trim() || null,
      whatsapp: data.whatsapp.trim() || data.phone.trim() || null,
    });
    const customerId = customers?.[0]?.id ?? null;

    const trips = await insert<{ id: string; trip_code: string; tracking_token: string }[]>(
      "trips",
      {
        trip_code: await nextTripCode(data.startDate),
        customer_id: customerId,
        title: data.title.trim() || null,
        destination,
        start_date: data.startDate,
        end_date: data.endDate,
        status: "confirmed",
        tracking_token: newToken(),
        pax_adults: Math.max(1, Math.min(40, Math.trunc(data.adults) || 1)),
        pax_children: Math.max(0, Math.min(40, Math.trunc(data.children) || 0)),
        emergency_name: "Nawi Saadi 24/7 desk",
        emergency_phone: "+971561228069",
        created_by: email,
      },
    );

    const trip = trips?.[0];
    if (!trip) return { ok: false as const, reason: "The trip could not be created." };

    // The first progress entry, so the customer's portal has something to show
    // the moment the link is sent rather than an empty status card.
    await insert("trip_progress", {
      trip_id: trip.id,
      stage: "booked",
      note: "Your booking is confirmed. Your itinerary is being prepared.",
      created_by: email,
    });

    return { ok: true as const, id: trip.id, code: trip.trip_code, token: trip.tracking_token };
  });

/**
 * Advances a trip's progress.
 *
 * Appends rather than updates — the history is the point. "Driver arrived
 * 14:12, customer picked up 14:31" is what settles a dispute about a late
 * transfer three weeks later, and overwriting a single status column destroys
 * exactly the evidence worth keeping.
 */
const setProgress = createServerFn({ method: "POST" })
  .validator((input: { tripId: string; stage: string; note: string; visible: boolean }) => input)
  .handler(async ({ data }) => {
    const { email } = await requireSession();
    const { insert, update } = await import("@/lib/db");

    await insert("trip_progress", {
      trip_id: data.tripId,
      stage: data.stage,
      note: data.note.trim().slice(0, 500) || null,
      visible: data.visible,
      created_by: email,
    });

    // Keep the trip's own status in step, so the admin list can be filtered
    // without reading the progress table for every row.
    const status =
      data.stage === "trip_complete"
        ? "completed"
        : data.stage === "booked" || data.stage === "documents_ready"
          ? "confirmed"
          : "in_progress";
    await update("trips", `id=eq.${data.tripId}`, { status });

    return { ok: true as const };
  });

const setPublished = createServerFn({ method: "POST" })
  .validator((input: { tripId: string; publish: boolean }) => input)
  .handler(async ({ data }) => {
    await requireSession();
    const { update } = await import("@/lib/db");
    await update("trips", `id=eq.${data.tripId}`, {
      published_at: data.publish ? new Date().toISOString() : null,
    });
    return { ok: true as const };
  });

/** A QR image for a trip link, as a data URL. */
const makeQr = createServerFn({ method: "POST" })
  .validator((url: string) => url)
  .handler(async ({ data: url }) => {
    await requireSession();
    const QRCode = (await import("qrcode")).default;
    // High error correction: these get printed on a welcome letter, folded into
    // a wallet and photographed in bad light. 'H' tolerates ~30% damage.
    const png = await QRCode.toDataURL(url, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 512,
      color: { dark: "#00365Fff", light: "#FFFFFFff" },
    });
    return { png };
  });

/* -------------------------------------------------------------------------
 * Route
 * ---------------------------------------------------------------------- */

export const Route = createFileRoute("/admin")({
  loader: async () => {
    const session = await readSession();
    if (!session) return { session: null, trips: [], base: "" };
    const data = await fetchTrips();
    return { session, trips: data?.trips ?? [], base: data?.base ?? "" };
  },
  head: () => ({ meta: [{ title: "Trip operations · Nawi Saadi" }] }),
  component: Admin,
});

function Admin() {
  const { session } = Route.useLoaderData();
  return session ? <Dashboard /> : <SignIn />;
}

/* ---------------------------------------------------------------------- */

function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <main className="grid min-h-screen place-items-center bg-navy px-5">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          const result = await doSignIn({ data: { email, password } });
          setBusy(false);
          if (result.ok) router.invalidate();
          else setError(result.reason);
        }}
        className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-2xl"
      >
        <p className="text-[10px] font-semibold tracking-[0.2em] text-gold-deep uppercase">
          Nawi Saadi Travel
        </p>
        <h1 className="mt-2.5 font-display text-2xl text-navy">Trip operations</h1>
        <p className="mt-1.5 text-sm text-muted">Staff access only.</p>

        <label className="mt-6 block text-xs font-semibold text-navy" htmlFor="admin-email">
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-hair px-3.5 py-2.5 text-sm outline-none focus:border-gold"
        />

        <label className="mt-4 block text-xs font-semibold text-navy" htmlFor="admin-password">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-hair px-3.5 py-2.5 text-sm outline-none focus:border-gold"
        />

        {error ? (
          <p role="alert" className="mt-3.5 rounded-lg bg-alert/8 p-2.5 text-xs text-alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-xl bg-navy py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {busy ? "Checking…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}

/* ---------------------------------------------------------------------- */

function Dashboard() {
  const { session, trips, base } = Route.useLoaderData();
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<"active" | "all">("active");

  // "Active" is the default view because a fifty-trip list sorted by date buries
  // the three people travelling today, which is the only thing the morning shift
  // needs.
  const shown = trips.filter((t) =>
    filter === "all" ? true : t.status !== "completed" && t.status !== "cancelled",
  );

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-navy px-5 py-4 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.2em] text-gold uppercase">
              Nawi Saadi Travel
            </p>
            <h1 className="font-display text-xl leading-tight">Trip operations</h1>
          </div>
          <div className="ml-auto flex items-center gap-3 text-xs">
            <span className="hidden text-white/70 sm:inline">{session?.email}</span>
            <button
              type="button"
              onClick={async () => {
                await doSignOut({});
                router.invalidate();
              }}
              className="rounded-lg border border-white/25 px-3 py-1.5 font-semibold"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-7">
        {/* ---- summary ---- */}
        <div className="grid gap-3 sm:grid-cols-4">
          <Stat
            label="Active trips"
            value={trips.filter((t) => t.status === "in_progress").length}
          />
          <Stat
            label="Travelling soon"
            value={trips.filter((t) => t.status === "confirmed").length}
          />
          <Stat
            label="Unpublished"
            value={trips.filter((t) => !t.published_at).length}
            tone={trips.some((t) => !t.published_at) ? "warn" : "plain"}
          />
          <Stat
            label="Never opened"
            value={trips.filter((t) => t.published_at && !t.last_seen_at).length}
            tone={trips.some((t) => t.published_at && !t.last_seen_at) ? "warn" : "plain"}
          />
        </div>

        {/* ---- actions ---- */}
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setCreating((v) => !v)}
            className="rounded-xl bg-navy px-5 py-2.5 text-sm font-bold text-white"
          >
            {creating ? "Cancel" : "+ New trip"}
          </button>
          <div className="ml-auto flex gap-1 rounded-xl border border-hair bg-white p-1">
            {(["active", "all"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold capitalize ${
                  filter === f ? "bg-navy text-white" : "text-navy"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {creating ? (
          <NewTripForm
            onDone={() => {
              setCreating(false);
              router.invalidate();
            }}
          />
        ) : null}

        {/* ---- the list ---- */}
        <div className="mt-6 flex flex-col gap-3">
          {shown.map((trip) => (
            <TripRow key={trip.id} trip={trip} base={base} onChange={() => router.invalidate()} />
          ))}
          {!shown.length ? (
            <p className="rounded-2xl border border-hair bg-white p-6 text-center text-sm text-muted">
              No trips here yet. Press <strong>+ New trip</strong> to create the first one and get a
              tracking link.
            </p>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "plain",
}: {
  label: string;
  value: number;
  tone?: "plain" | "warn";
}) {
  return (
    <div
      className={`rounded-xl border bg-white p-4 ${
        tone === "warn" && value > 0 ? "border-gold" : "border-hair"
      }`}
    >
      <p className="text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">{label}</p>
      <p
        className={`mt-1 font-mono text-2xl font-bold tabular-nums ${
          tone === "warn" && value > 0 ? "text-gold-deep" : "text-navy"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------------- */

function NewTripForm({ onDone }: { onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<{ code: string; token: string } | null>(null);

  if (created) {
    return (
      <div className="mt-5 rounded-2xl border border-live/35 bg-live/8 p-5">
        <p className="text-sm font-bold text-live">Trip {created.code} created</p>
        <p className="mt-1 text-sm text-ink">
          The link is live below. Add the day-by-day plan, then publish it.
        </p>
        <button
          type="button"
          onClick={onDone}
          className="mt-3.5 rounded-xl bg-navy px-5 py-2.5 text-sm font-bold text-white"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setBusy(true);
        setError("");
        const result = await createTrip({
          data: {
            customerName: String(f.get("customerName") ?? ""),
            phone: String(f.get("phone") ?? ""),
            whatsapp: String(f.get("whatsapp") ?? ""),
            destination: String(f.get("destination") ?? ""),
            title: String(f.get("title") ?? ""),
            startDate: String(f.get("startDate") ?? ""),
            endDate: String(f.get("endDate") ?? ""),
            adults: Number(f.get("adults") ?? 1),
            children: Number(f.get("children") ?? 0),
          },
        });
        setBusy(false);
        if (result.ok) setCreated({ code: result.code, token: result.token });
        else setError(result.reason);
      }}
      className="mt-5 rounded-2xl border border-hair bg-white p-5"
    >
      <h2 className="font-display text-lg text-navy">New trip</h2>
      <p className="mt-1 text-xs text-muted">
        This creates the customer&apos;s private link and QR code straight away. The itinerary can
        be added afterwards.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Customer name" name="customerName" required />
        <Field label="Phone" name="phone" type="tel" placeholder="+971 50 000 0000" />
        <Field label="WhatsApp (if different)" name="whatsapp" type="tel" />
        <Field label="Destination" name="destination" required placeholder="Dubai + Abu Dhabi" />
        <div className="sm:col-span-2">
          <Field label="Trip title (optional)" name="title" placeholder="Five nights in the UAE" />
        </div>
        <Field label="Start date" name="startDate" type="date" required />
        <Field label="End date" name="endDate" type="date" required />
        <Field label="Adults" name="adults" type="number" defaultValue="2" min="1" max="40" />
        <Field label="Children" name="children" type="number" defaultValue="0" min="0" max="40" />
      </div>

      {error ? (
        <p role="alert" className="mt-4 rounded-lg bg-alert/8 p-2.5 text-xs text-alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="mt-5 rounded-xl bg-navy px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
      >
        {busy ? "Creating…" : "Create trip & generate link"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  defaultValue,
  min,
  max,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  min?: string;
  max?: string;
}) {
  const id = `f-${name}`;
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-navy">
        {label}
        {required ? <span className="text-alert"> *</span> : null}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        min={min}
        max={max}
        className="mt-1.5 w-full rounded-xl border border-hair px-3.5 py-2.5 text-sm outline-none focus:border-gold"
      />
    </div>
  );
}

/* ---------------------------------------------------------------------- */

function TripRow({
  trip,
  base,
  onChange,
}: {
  trip: TripOverview;
  base: string;
  onChange: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const url = `${base}/t/${trip.tracking_token}`;
  const percent = stagePercent(trip.current_stage);
  const stage = trip.current_stage ? stageMeta(trip.current_stage) : null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access is refused outside a secure context and in some
      // in-app browsers. Selecting the text is the fallback that always works,
      // so the input below is readonly rather than hidden.
      setCopied(false);
    }
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-hair bg-white">
      <div className="flex flex-wrap items-start gap-4 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold text-gold-deep">{trip.trip_code}</span>
            <StatusPill trip={trip} />
          </div>
          <h3 className="mt-1.5 truncate font-display text-lg text-navy">
            {trip.customer_name ?? "Unnamed customer"}
          </h3>
          <p className="truncate text-sm text-muted">
            {trip.destination} · {trip.start_date} → {trip.end_date}
          </p>

          <div className="mt-3 flex items-center gap-3">
            <div className="h-1.5 w-full max-w-48 overflow-hidden rounded-full bg-paper">
              <div
                className="h-full rounded-full bg-gold"
                style={{ width: `${Math.max(percent, 3)}%` }}
              />
            </div>
            <span className="shrink-0 text-xs text-muted">
              {stage?.label ?? "Not started"} · {percent}%
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5 text-right text-xs">
          <span className={trip.last_seen_at ? "text-live" : "text-alert"}>
            {trip.last_seen_at
              ? `Opened ${trip.portal_opens}× · last ${shortStamp(trip.last_seen_at)}`
              : trip.published_at
                ? "Never opened"
                : "Not published"}
          </span>
          <span className="text-muted">
            {trip.published_day_count}/{trip.day_count} days published
          </span>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="mt-1 rounded-lg border border-hair px-3 py-1.5 font-semibold text-navy"
          >
            {open ? "Close" : "Link & progress"}
          </button>
        </div>
      </div>

      {open ? (
        <div className="grid gap-5 border-t border-hair bg-paper p-4 lg:grid-cols-2">
          {/* ---- the link ---- */}
          <section>
            <h4 className="text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">
              Customer link
            </h4>
            <input
              readOnly
              value={url}
              onFocus={(e) => e.currentTarget.select()}
              className="mt-2 w-full rounded-lg border border-hair bg-white px-3 py-2 font-mono text-[11px] text-ink"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copy}
                className="rounded-lg bg-navy px-3.5 py-2 text-xs font-bold text-white"
              >
                {copied ? "Copied" : "Copy link"}
              </button>
              <a
                href={`https://wa.me/${(trip.customer_whatsapp ?? trip.customer_phone ?? "").replace(/[^\d]/g, "")}?text=${encodeURIComponent(
                  `Hello ${trip.customer_name ?? ""}, here is your trip with Nawi Saadi (${trip.trip_code}). You can follow your itinerary, driver and documents here: ${url}`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-gold px-3.5 py-2 text-xs font-bold text-navy"
              >
                Send on WhatsApp
              </a>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-hair bg-white px-3.5 py-2 text-xs font-bold text-navy"
              >
                Preview
              </a>
              <button
                type="button"
                onClick={async () => {
                  const result = await makeQr({ data: url });
                  setQr(result.png);
                }}
                className="rounded-lg border border-hair bg-white px-3.5 py-2 text-xs font-bold text-navy"
              >
                QR code
              </button>
            </div>

            {qr ? (
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-hair bg-white p-3">
                <img src={qr} alt={`QR code for trip ${trip.trip_code}`} className="size-28" />
                <a
                  href={qr}
                  download={`${trip.trip_code}-qr.png`}
                  className="rounded-lg bg-navy px-3.5 py-2 text-xs font-bold text-white"
                >
                  Download PNG
                </a>
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  await setPublished({ data: { tripId: trip.id, publish: !trip.published_at } });
                  setBusy(false);
                  onChange();
                }}
                className={`rounded-lg px-3.5 py-2 text-xs font-bold ${
                  trip.published_at ? "border border-hair bg-white text-navy" : "bg-live text-white"
                }`}
              >
                {trip.published_at ? "Unpublish" : "Publish to customer"}
              </button>
              <Link
                to="/admin/trips/$id"
                params={{ id: trip.id }}
                className="rounded-lg border border-hair bg-white px-3.5 py-2 text-xs font-bold text-navy"
              >
                Edit itinerary
              </Link>
            </div>
            {!trip.published_at ? (
              <p className="mt-2 text-[11px] leading-relaxed text-muted">
                Until this is published the link shows &ldquo;we can&apos;t find this trip&rdquo;,
                so it is safe to send the QR ahead of finishing the itinerary.
              </p>
            ) : null}
          </section>

          {/* ---- progress ---- */}
          <section>
            <h4 className="text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">
              Update progress
            </h4>
            <ProgressForm tripId={trip.id} current={trip.current_stage} onDone={onChange} />
          </section>
        </div>
      ) : null}
    </article>
  );
}

function StatusPill({ trip }: { trip: TripOverview }) {
  const tone = !trip.published_at
    ? "bg-gold/18 text-gold-deep"
    : trip.status === "in_progress"
      ? "bg-live/12 text-live"
      : trip.status === "completed"
        ? "bg-navy/8 text-muted"
        : "bg-navy/8 text-navy";
  const label = !trip.published_at ? "Draft" : trip.status.replace(/_/g, " ");
  return (
    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${tone}`}>
      {label}
    </span>
  );
}

/**
 * The progress control.
 *
 * Grouped by phase rather than presented as one thirteen-item dropdown, because
 * the office picks these under time pressure with a customer on the phone, and
 * scanning thirteen flat options for "driver arrived" is slower than reaching
 * into a group called Transfer.
 */
function ProgressForm({
  tripId,
  current,
  onDone,
}: {
  tripId: string;
  current: ProgressStage | null;
  onDone: () => void;
}) {
  const [stage, setStage] = useState<string>(current ?? "booked");
  const [note, setNote] = useState("");
  const [visible, setVisible] = useState(true);
  const [busy, setBusy] = useState(false);

  const groups = [...new Set(PROGRESS_STAGES.map((s) => s.group))];

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        await setProgress({ data: { tripId, stage, note, visible } });
        setBusy(false);
        setNote("");
        onDone();
      }}
      className="mt-2"
    >
      <select
        value={stage}
        onChange={(e) => setStage(e.target.value)}
        aria-label="Progress stage"
        className="w-full rounded-lg border border-hair bg-white px-3 py-2.5 text-sm text-navy outline-none focus:border-gold"
      >
        {groups.map((g) => (
          <optgroup key={g} label={g}>
            {PROGRESS_STAGES.filter((s) => s.group === g).map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={500}
        placeholder="Note for the customer — e.g. 'Ahmed is waiting at Exit 3'"
        className="mt-2 w-full rounded-lg border border-hair bg-white px-3 py-2.5 text-sm outline-none focus:border-gold"
      />

      <label className="mt-2.5 flex items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={visible}
          onChange={(e) => setVisible(e.target.checked)}
          className="size-4 accent-[#00365F]"
        />
        <span>Show this update to the customer</span>
      </label>

      <button
        type="submit"
        disabled={busy}
        className="mt-3 w-full rounded-lg bg-navy py-2.5 text-xs font-bold text-white disabled:opacity-60"
      >
        {busy ? "Saving…" : "Save update"}
      </button>
      <p className="mt-2 text-[11px] leading-relaxed text-muted">
        The customer sees this the next time they open or refresh their link. Every update is kept
        with a timestamp — nothing is overwritten.
      </p>
    </form>
  );
}

function shortStamp(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "Asia/Dubai",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
