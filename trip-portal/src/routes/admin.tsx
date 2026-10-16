import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useId, useState } from "react";

import { OperationsWorkspace } from "@/components/OperationsWorkspace";
import { Icon } from "@/components/Icon";
import { destinationPhoto } from "@/lib/destinations";
import { deleteTrip } from "@/lib/trip-admin";
import { money, tripTiming, type TripOverview } from "@/lib/types";

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

    return { ok: true as const, id: trip.id, code: trip.trip_code, token: trip.tracking_token };
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
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.1fr_1fr]">
      {/* The photograph half. On a phone it becomes a banner above the form, so
          the page is never a dark block — the brand is light-first. */}
      <div className="relative isolate h-56 overflow-hidden lg:h-auto">
        <img
          src="/destinations/hero-dubai.webp"
          alt=""
          className="absolute inset-0 -z-20 size-full object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-deep/80 via-navy-deep/20 to-navy-deep/40"
        />
        <div className="flex h-full flex-col justify-between p-6 text-white lg:p-10">
          <img
            src="/brand/logo-white.webp"
            alt="Nawi Saadi Travel & Tourism"
            className="h-10 w-auto self-start lg:h-12"
          />
          <div className="hidden lg:block">
            <p className="flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.24em] text-gold-light uppercase">
              <span className="h-px w-10 bg-gold-light" /> Trip operations
            </p>
            <p className="mt-3 max-w-md font-display text-4xl leading-tight">
              Every customer&apos;s journey,{" "}
              <span className="text-gold-light italic">in one place.</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
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
          className="w-full max-w-sm"
        >
          <img src="/brand/logo-ink.webp" alt="" className="h-12 w-auto" />
          <h1 className="mt-8 font-display text-3xl text-navy">Welcome back</h1>
          <p className="mt-1.5 text-sm text-muted">Staff sign-in for Nawi Saadi trip operations.</p>

          <label className="mt-8 block text-xs font-semibold text-navy" htmlFor="admin-email">
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-hair px-4 py-3 text-sm outline-none focus:border-gold focus:ring-4 focus:ring-gold/15"
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
            className="mt-1.5 w-full rounded-xl border border-hair px-4 py-3 text-sm outline-none focus:border-gold focus:ring-4 focus:ring-gold/15"
          />

          {error ? (
            <p role="alert" className="mt-4 rounded-xl bg-alert/8 p-3 text-sm text-alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full rounded-xl bg-navy py-3.5 text-sm font-semibold text-white transition hover:bg-navy-deep disabled:opacity-60"
          >
            {busy ? "Checking…" : "Sign in"}
          </button>
          <p className="mt-6 text-center text-xs text-muted">
            IATA accredited · DTCM approved · Since 2009
          </p>
        </form>
      </div>
    </main>
  );
}

/* ---------------------------------------------------------------------- */

function Dashboard() {
  const { session, trips, base } = Route.useLoaderData();
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const refresh = async () => {
    setRefreshing(true);
    try {
      await router.invalidate();
    } finally {
      setRefreshing(false);
    }
  };
  return (
    <OperationsWorkspace
      trips={trips}
      email={session?.via === "password" ? "Staff" : (session?.email ?? "Staff")}
      refreshing={refreshing}
      creating={creating}
      onCreate={() => setCreating((v) => !v)}
      onRefresh={() => void refresh()}
      onSignOut={() => {
        void doSignOut({}).then(() => router.invalidate());
      }}
      renderTrip={(trip) => <TripRow key={trip.id} trip={trip} base={base} onChange={refresh} />}
    >
      {creating ? (
        <NewTripForm
          onDone={() => {
            setCreating(false);
            void refresh();
          }}
        />
      ) : null}
    </OperationsWorkspace>
  );
}

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

  // Deleting asks for the trip reference to be typed, not an "are you sure":
  // a confirm box is clicked through by reflex, and this cannot be undone.
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const confirmId = useId();
  const matches = typed.trim().toUpperCase() === trip.trip_code.toUpperCase();

  const remove = async () => {
    if (!matches || deleting) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const result = await deleteTrip({ data: trip.id });
      if (!result.ok) {
        setDeleteError("That trip could not be found — it may already have been deleted.");
        return;
      }
      onChange();
    } catch {
      setDeleteError("Deleting failed. Nothing was removed; try again.");
    } finally {
      setDeleting(false);
    }
  };

  const url = `${base}/t/${trip.tracking_token}`;
  const timing = tripTiming(trip.start_date, trip.end_date);

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
    <article className="ops-trip-card overflow-hidden rounded-2xl border border-hair bg-white shadow-sm transition hover:shadow-md">
      <div className="relative h-40 overflow-hidden bg-navy">
        <img
          src={destinationPhoto(trip.destination)}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/10 to-transparent" />
        <span className="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-navy">
          {trip.destination}
        </span>
        <div className="absolute right-4 bottom-4 left-4 flex items-end justify-between gap-2">
          <p className="font-display text-2xl text-white">{trip.title || trip.destination}</p>
          <span className="shrink-0 rounded-lg bg-white/15 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur">
            {trip.day_count} days
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-4 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold text-gold-deep">{trip.trip_code}</span>
            <StatusPill trip={trip} />
          </div>
          <h3 className="mt-1.5 break-words text-sm font-bold text-navy">
            {trip.customer_name ?? "Unnamed customer"}
          </h3>
          <p className="truncate text-sm text-muted">
            {trip.destination} · {trip.start_date} → {trip.end_date}
          </p>

          <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-sand px-2.5 py-1 text-xs font-semibold text-navy">
            <Icon name="clock" className="size-3.5 text-gold-deep" />
            {trip.status === "cancelled"
              ? "Cancelled"
              : timing.phase === "upcoming"
                ? timing.daysToGo === 1
                  ? "Starts tomorrow"
                  : `Starts in ${timing.daysToGo} days`
                : timing.phase === "travelling"
                  ? `Travelling · day ${timing.day} of ${timing.of}`
                  : "Trip finished"}
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 border-t border-hair pt-3 text-xs">
          <span
            className={trip.published_at ? "font-semibold text-live" : "font-semibold text-alert"}
          >
            {trip.published_at ? "Link is live" : "Not published"}
          </span>
          <span className="text-muted">
            {trip.published_day_count}/{trip.day_count} days published
          </span>
          {Number(trip.balance_due) > 0 ? (
            // The only money signal on this screen, deliberately. The office's
            // question in the morning is "who still owes us", not "what is the
            // invoice total" — so it shows only when something is outstanding.
            <span className="font-mono font-semibold tabular-nums text-alert">
              {money(trip.balance_due)} due
            </span>
          ) : null}
          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="rounded-lg border border-hair px-3 py-1.5 font-semibold text-navy hover:border-navy"
            >
              {open ? "Close" : "Share link"}
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirming((v) => !v);
                setTyped("");
                setDeleteError("");
              }}
              aria-label={`Delete trip ${trip.trip_code}`}
              aria-expanded={confirming}
              title="Delete trip"
              className={`grid size-[30px] place-items-center rounded-lg border transition ${
                confirming
                  ? "border-alert bg-alert text-white"
                  : "border-hair text-muted hover:border-alert hover:text-alert"
              }`}
            >
              <Icon name="trash" className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-hair px-4 py-3">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper">
            <div
              className="h-full rounded-full bg-gold"
              style={{
                width:
                  (trip.day_count
                    ? Math.min(100, (trip.published_day_count / trip.day_count) * 100)
                    : 0) + "%",
              }}
            />
          </div>
          <span className="text-[10px] text-muted">
            {trip.published_day_count}/{trip.day_count} days ready
          </span>
        </div>
        <Link
          to="/admin/trips/$id"
          params={{ id: trip.id }}
          className="flex items-center justify-between rounded-xl bg-navy px-4 py-2.5 text-xs font-bold text-white"
        >
          Manage itinerary
          <Icon name="arrowRight" className="size-4" />
        </Link>
      </div>
      {confirming ? (
        <div
          role="group"
          aria-label={`Delete trip ${trip.trip_code}`}
          className="border-t border-alert/25 bg-alert/5 px-4 py-4"
        >
          <p className="flex items-center gap-2 text-sm font-semibold text-alert">
            <Icon name="alert" className="size-4" />
            Delete {trip.customer_name ? `${trip.customer_name}'s` : "this"} trip permanently?
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Removes the itinerary, documents, invoices and every photo and video. The
            customer&apos;s link stops working. This cannot be undone — to keep a record instead,
            tick &ldquo;Trip cancelled&rdquo; in the trip&apos;s details.
          </p>
          <form
            className="mt-3 flex flex-wrap items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void remove();
            }}
          >
            <label htmlFor={confirmId} className="w-full text-xs font-semibold text-navy">
              Type <span className="font-mono text-alert">{trip.trip_code}</span> to confirm
            </label>
            <input
              id={confirmId}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder={trip.trip_code}
              className="w-52 rounded-lg border border-alert/40 bg-white px-3 py-2 font-mono text-xs outline-none focus:border-alert"
            />
            <button
              type="submit"
              disabled={!matches || deleting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-alert px-4 py-2 text-xs font-bold text-white disabled:opacity-40"
            >
              <Icon name="trash" className="size-3.5" />
              {deleting ? "Deleting…" : "Delete forever"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-lg border border-hair bg-white px-4 py-2 text-xs font-semibold text-navy"
            >
              Keep it
            </button>
          </form>
          {deleteError ? (
            <p role="alert" className="mt-2 text-xs text-alert">
              {deleteError}
            </p>
          ) : null}
        </div>
      ) : null}

      {open ? (
        <div className="border-t border-hair bg-paper p-4">
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
        </div>
      ) : null}
    </article>
  );
}

function StatusPill({ trip }: { trip: TripOverview }) {
  const phase = tripTiming(trip.start_date, trip.end_date).phase;
  const [label, tone] = !trip.published_at
    ? ["Draft", "bg-gold/18 text-gold-deep"]
    : trip.status === "cancelled"
      ? ["Cancelled", "bg-alert/10 text-alert"]
      : phase === "travelling"
        ? ["Travelling", "bg-live/12 text-live"]
        : phase === "finished"
          ? ["Finished", "bg-navy/8 text-muted"]
          : ["Upcoming", "bg-navy/8 text-navy"];
  return (
    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${tone}`}>
      {label}
    </span>
  );
}
