import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Activity,
  MessageCircle,
  Users,
  RefreshCw,
  Lock,
  Mail,
  Search,
  Download,
  Check,
  Filter,
  Phone,
  MessageSquare,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Dashboard, Lead } from "@/lib/admin-data";

/**
 * Mirrors SUBSCRIBE_SOURCES in admin-data.
 *
 * That module throws on import from the client, so this file cannot pull the
 * constant across even though it is only a list of three strings.
 */
const SUBSCRIBE_SOURCES = ["subscribe", "footer", "newsletter"];

const COOKIE = "ns_admin";

/** Reads the dashboard, but only for a request carrying a valid session. */
const getDashboard = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { loadDashboard, adminConfigured } = await import("@/lib/admin-data");
    const { sessionFromToken } = await import("@/lib/admin-auth");
    const { getCookie } = await import("@tanstack/react-start/server");

    const session = await sessionFromToken(getCookie(COOKIE));
    if (!session) return { authed: false as const, configured: adminConfigured() };

    const data = await loadDashboard();
    return { authed: true as const, configured: data.configured, data, who: session.email };
  } catch (err) {
    console.error("Admin dashboard handler error:", err);
    return { authed: false as const, configured: false };
  }
});

const SESSION_SECONDS = 60 * 60 * 8;

/**
 * Verifies the credentials and, on success, sets the session cookie.
 *
 * Two things changed here beyond the original happy path:
 *
 *   - Attempts are throttled per client address. A single shared password with
 *     unlimited guesses is the one thing this panel could not survive.
 *   - The shared-password path stores a signed, expiring token rather than the
 *     password itself, so the credential never sits in a browser cookie.
 */
const signIn = createServerFn({ method: "POST" })
  .validator((d: { email: string; password: string }) => ({
    email: String(d.email ?? "").slice(0, 320),
    password: String(d.password ?? "").slice(0, 200),
  }))
  .handler(async ({ data }) => {
    const {
      signInWithPassword,
      issueSharedToken,
      throttleRetryAfterMs,
      recordFailedSignIn,
      clearFailedSignIns,
    } = await import("@/lib/admin-auth");
    const { checkPassword } = await import("@/lib/admin-data");
    const { setCookie, getRequestHeader } = await import("@tanstack/react-start/server");

    // Vercel sets x-forwarded-for; the first entry is the client. Falls back to
    // a single shared bucket when no address is available, which throttles
    // conservatively rather than not at all.
    const forwarded = getRequestHeader("x-forwarded-for") ?? "";
    const client = forwarded.split(",")[0]?.trim() || getRequestHeader("x-real-ip") || "unknown";

    const waitMs = throttleRetryAfterMs(client);
    if (waitMs > 0) {
      return {
        ok: false as const,
        reason: `Too many failed attempts. Try again in ${Math.ceil(waitMs / 60000)} minute(s).`,
      };
    }

    const store = (token: string) =>
      setCookie(COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env["NODE_ENV"] === "production",
        path: "/",
        maxAge: SESSION_SECONDS,
      });

    // 1. Shared admin password
    if (checkPassword(data.password)) {
      const token = await issueSharedToken(SESSION_SECONDS);
      if (token) {
        clearFailedSignIns(client);
        store(token);
        return { ok: true as const };
      }
    }

    // 2. Supabase Auth when an email is supplied
    if (data.email) {
      const result = await signInWithPassword(data.email, data.password);
      if (result.ok) {
        clearFailedSignIns(client);
        store(result.token);
        return { ok: true as const };
      }
      recordFailedSignIn(client);
      return { ok: false as const, reason: result.reason };
    }

    recordFailedSignIn(client);
    return { ok: false as const, reason: "Incorrect admin password." };
  });

const STATUSES = ["new", "contacted", "quoted", "booked", "closed"] as const;
type LeadStatus = (typeof STATUSES)[number];

/**
 * Moves a lead through the pipeline. Re-checks auth on every call.
 *
 * The validator does real work now. It previously passed its argument straight
 * through — the type annotation is erased at runtime, so the only thing between
 * a POST body and a service-role PATCH was TypeScript's word for it. `id` is
 * coerced to an integer because it is interpolated into a PostgREST filter, and
 * `status` is checked against the pipeline values so a typo (or a crafted
 * request) cannot invent a state the filters and colours know nothing about.
 */
const saveLead = createServerFn({ method: "POST" })
  .validator((d: { id: number; status?: string; notes?: string }) => {
    const id = Number(d?.id);
    if (!Number.isInteger(id) || id <= 0) throw new Error("A lead id is required.");

    const patch: { id: number; status?: LeadStatus; notes?: string } = { id };
    if (d?.status !== undefined) {
      const status = String(d.status);
      if (!(STATUSES as readonly string[]).includes(status)) {
        throw new Error(`Unknown lead status: ${status}`);
      }
      patch.status = status as LeadStatus;
    }
    if (d?.notes !== undefined) patch.notes = String(d.notes).slice(0, 5000);
    return patch;
  })
  .handler(async ({ data }) => {
    const { updateLead } = await import("@/lib/admin-data");
    const { sessionFromToken } = await import("@/lib/admin-auth");
    const { getCookie } = await import("@tanstack/react-start/server");
    if (!(await sessionFromToken(getCookie(COOKIE)))) return { ok: false as const };
    const { id, ...patch } = data;
    return { ok: await updateLead(id, patch) };
  });

/**
 * Permanently deletes a lead. Auth is re-checked here, not assumed from the
 * page having rendered — every server function is an independent entry point
 * and the session cookie is the only thing that proves anything.
 */
const removeLead = createServerFn({ method: "POST" })
  .validator((d: { id: number; email: string }) => {
    const id = Number(d?.id);
    if (!Number.isInteger(id) || id <= 0) throw new Error("A lead id is required.");
    const email = String(d?.email ?? "")
      .trim()
      .slice(0, 320);
    if (!email) throw new Error("The lead's email is required to confirm the delete.");
    return { id, email };
  })
  .handler(async ({ data }) => {
    const { deleteLead } = await import("@/lib/admin-data");
    const { sessionFromToken } = await import("@/lib/admin-auth");
    const { getCookie } = await import("@tanstack/react-start/server");
    const session = await sessionFromToken(getCookie(COOKIE));
    if (!session) return { ok: false as const };
    const ok = await deleteLead(data.id, data.email);
    // Deletions are the one admin action with no undo, so they leave a trace
    // in the platform logs even though nothing else here does.
    console.log(`[admin] ${session.email} deleted lead ${data.id} <${data.email}>: ${ok}`);
    return { ok };
  });

const signOut = createServerFn({ method: "POST" }).handler(async () => {
  const { setCookie } = await import("@tanstack/react-start/server");
  setCookie(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return { ok: true as const };
});

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard | Nawi Saadi Holidays" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  loader: async () => {
    try {
      return await getDashboard();
    } catch {
      return { authed: false as const, configured: false };
    }
  },
  component: AdminPage,
  errorComponent: () => <SignIn configured={false} />,
});

function AdminPage() {
  const state = Route.useLoaderData();
  if (!state.authed) return <SignIn configured={state.configured} />;
  return <DashboardView data={state.data} who={state.who} />;
}

function SignIn({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await signIn({ data: { email: email.trim(), password } });
    setBusy(false);
    if (res.ok) router.invalidate();
    else setError(res.reason ?? "Sign in failed.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#00365F] px-5">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
        <div className="flex items-center gap-2 text-[#00365F]">
          <Lock className="size-5 text-[#CAA42D]" />
          <h1 className="font-display text-2xl font-bold">Admin Portal</h1>
        </div>
        <p className="mt-2 font-sans text-xs text-[#666666]">
          Executive leads, analytics & WhatsApp monitoring for Nawi Saadi Holidays
        </p>

        {!configured ? (
          <p className="mt-4 rounded-xl bg-amber-50 p-3 font-sans text-xs leading-relaxed text-amber-900">
            Supabase connection pending. Enter your{" "}
            <code className="font-mono font-bold">ADMIN_PASSWORD</code> to sign in.
          </p>
        ) : null}

        <p className="mt-4 rounded-xl bg-slate-50 p-3 font-sans text-xs text-[#00365F]">
          Enter your <span className="font-semibold text-[#CAA42D]">Admin Password</span> to sign in
          directly.
        </p>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Admin Email (optional)"
          autoComplete="username"
          className="mt-4 w-full rounded-xl border border-[#E5E5E5] px-4 py-3 font-sans text-sm outline-none focus:border-[#CAA42D]"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin Password"
          autoComplete="current-password"
          className="mt-3 w-full rounded-xl border border-[#E5E5E5] px-4 py-3 font-sans text-sm outline-none focus:border-[#CAA42D]"
        />
        {error ? (
          <p className="mt-2 font-sans text-xs font-semibold text-red-600">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-xl bg-[#00365F] px-6 py-3.5 font-sans text-sm font-bold text-white transition-colors hover:bg-[#CAA42D] hover:text-[#00365F] disabled:opacity-60 shadow-md"
        >
          {busy ? "Authenticating…" : "Sign In to Admin"}
        </button>
      </form>
    </div>
  );
}

type TabType = "leads" | "subscribers" | "whatsapp" | "sessions";

function DashboardView({ data, who }: { data: Dashboard; who?: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<TabType>("leads");

  return (
    <div className="min-h-screen bg-[#F4F6F8] pb-20">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-[#E2E8F0] bg-white/95 px-5 py-4 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#00365F] text-[#CAA42D] font-bold">
              NS
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-[#00365F]">
                Nawi Saadi Operations
              </h1>
              {/* The strapline read "Live Production Management · shared-password",
                  which is noise and also announced the auth method on screen. */}
              <p className="font-sans text-[11px] text-[#666666]">
                {who && who !== "shared-password" ? who : "Signed in"}
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex items-center gap-1 rounded-2xl bg-[#F1F5F9] p-1">
            {[
              {
                id: "leads",
                label: "Enquiries",
                // Subscribers have their own tab, so this count is enquiries
                // only. It used to include them, which made the number look
                // healthy while the actual enquiry list was nearly empty.
                count: data.leads.length - data.subscribers.length,
                icon: Mail,
              },
              {
                id: "subscribers",
                label: "Subscribers",
                count: data.subscribers.length,
                icon: Inbox,
              },
              {
                id: "whatsapp",
                label: "WhatsApp",
                count: data.whatsappLog.length,
                icon: MessageCircle,
              },
              {
                id: "sessions",
                label: "Visitors",
                count: data.sessions.length,
                icon: Users,
              },
            ].map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id as TabType)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3.5 py-2 font-sans text-xs font-bold transition-all",
                    active
                      ? "bg-[#00365F] text-white shadow-sm"
                      : "text-[#475569] hover:bg-white/60 hover:text-[#00365F]",
                  )}
                >
                  <Icon className={cn("size-3.5", active ? "text-[#CAA42D]" : "text-[#64748B]")} />
                  <span>{t.label}</span>
                  {t.count !== undefined ? (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px]",
                        active ? "bg-white/20 text-white" : "bg-[#E2E8F0] text-[#475569]",
                      )}
                    >
                      {t.count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.invalidate()}
              className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 font-sans text-xs font-semibold text-[#00365F] shadow-sm transition-colors hover:border-[#CAA42D] hover:bg-[#CAA42D]/10"
            >
              <RefreshCw className="size-3.5 text-[#CAA42D]" />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                router.invalidate();
              }}
              className="rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 font-sans text-xs font-semibold text-red-600 shadow-sm transition-colors hover:bg-red-50"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-[1500px] px-5 pt-8 sm:px-8">
        {/*
          Three numbers, not five.
          Unique visitors, page views and total interactions were on this row —
          none of them tell anyone in the office what to do next, and they were
          crowding out the one number that does. They still exist, under
          Analytics Overview, which is where a traffic figure belongs.
          What leads is what is waiting: leads nobody has contacted yet.
        */}
        {/*
          "Waiting for a reply" counted every lead with status "new", which
          included newsletter signups. Nobody owes a subscriber a reply, so the
          card read 2 while the enquiry list was empty. Subscribers have their
          own count now, and the reply card means what it says.
        */}
        <div className="grid gap-4 sm:grid-cols-4">
          <KpiCard
            icon={Mail}
            label="Waiting for a reply"
            value={
              data.leads.filter((l) => l.status === "new" && !SUBSCRIBE_SOURCES.includes(l.source))
                .length
            }
            note="Enquiries nobody has answered yet"
            accent
          />
          <KpiCard
            icon={MessageCircle}
            label="WhatsApp enquiries"
            value={data.whatsappLog.length}
            note="Chats opened from the site"
          />
          <KpiCard
            icon={Inbox}
            label="Subscribers"
            value={data.subscribers.length}
            note="On the mailing list"
          />
          <KpiCard
            icon={Users}
            label="Visitors"
            value={data.totals.sessions}
            note="Sessions recorded"
          />
        </div>

        {tab === "leads" && (
          <LeadsManager
            leads={data.leads.filter((l) => !SUBSCRIBE_SOURCES.includes(l.source))}
            byStatus={data.leadsByStatus}
            bySource={data.leadsBySource}
          />
        )}

        {tab === "subscribers" && <SubscribersManager subscribers={data.subscribers} />}

        {tab === "whatsapp" && (
          <WhatsAppIntentLog log={data.whatsappLog} contexts={data.whatsappContexts} />
        )}

        {tab === "sessions" && (
          <VisitorSessions
            sessions={data.sessions}
            journeys={data.journeys}
            funnel={data.funnel}
            recent={data.recent}
          />
        )}
      </main>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  note,
  accent = false,
}: {
  icon: typeof Activity;
  label: string;
  value: number;
  note?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 shadow-sm transition-all",
        accent
          ? "border-[#CAA42D]/40 bg-gradient-to-br from-white to-[#CAA42D]/10"
          : "border-[#E2E8F0] bg-white",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
          {label}
        </span>
        <div
          className={cn(
            "flex size-8 items-center justify-center rounded-lg",
            accent ? "bg-[#CAA42D] text-[#00365F]" : "bg-[#00365F]/10 text-[#00365F]",
          )}
        >
          <Icon className="size-4" />
        </div>
      </div>
      <p className="mt-3 font-display text-3xl font-extrabold text-[#00365F]">
        {value.toLocaleString()}
      </p>
      {note ? <p className="mt-1 font-sans text-xs text-[#94A3B8]">{note}</p> : null}
    </div>
  );
}

function LeadsManager({
  leads,
  byStatus,
  bySource,
}: {
  leads: Lead[];
  byStatus: Dashboard["leadsByStatus"];
  bySource: Dashboard["leadsBySource"];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [busy, setBusy] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  // Which row has its delete armed. Cleared on a timer so a half-pressed
  // delete cannot sit waiting to catch an unrelated click minutes later.
  const [confirming, setConfirming] = useState<number | null>(null);

  useEffect(() => {
    if (confirming === null) return;
    const t = setTimeout(() => setConfirming(null), 5000);
    return () => clearTimeout(t);
  }, [confirming]);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (sourceFilter !== "all" && l.source !== sourceFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const ref = String(l.detail?.["reference"] ?? "");
      const pkg = String(l.detail?.["package"] ?? "");
      return (
        l.email.toLowerCase().includes(q) ||
        (l.name && l.name.toLowerCase().includes(q)) ||
        (l.phone && l.phone.includes(q)) ||
        ref.toLowerCase().includes(q) ||
        pkg.toLowerCase().includes(q) ||
        (l.notes && l.notes.toLowerCase().includes(q))
      );
    });
  }, [leads, search, statusFilter, sourceFilter]);

  const updateStatus = async (id: number, status: string) => {
    setBusy(id);
    await saveLead({ data: { id, status } });
    setBusy(null);
    router.invalidate();
  };

  const copyToClipboard = (text: string, id: string) => {
    // writeText rejects on an insecure origin or a denied permission. Ticking
    // regardless told the user something was on their clipboard when it was not.
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
      })
      .catch(() => setCopied(null));
  };

  const exportCsv = () => {
    const headers = [
      "ID",
      "Created At",
      "Email",
      "Name",
      "Phone",
      "Source",
      "Status",
      "Path",
      "Reference",
      "Package",
      "Dates",
      "Travellers",
      "Budget",
      "Notes",
    ];
    const rows = filtered.map((l) => [
      l.id,
      new Date(l.created_at).toISOString(),
      l.email,
      l.name ?? "",
      l.phone ?? "",
      l.source,
      l.status,
      l.path ?? "",
      String(l.detail?.["reference"] ?? ""),
      String(l.detail?.["package"] ?? ""),
      String(l.detail?.["dates"] ?? ""),
      String(l.detail?.["adults"] ? `${l.detail["adults"]} adults` : ""),
      String(l.detail?.["budget"] ?? ""),
      l.notes ?? "",
    ]);

    // Excel and Sheets treat a cell opening with = + - or @ as a formula, so a
    // customer note reading "=cmd|..." becomes executable the moment someone in
    // the office opens the export. An apostrophe prefix keeps the text intact
    // and inert. Tabs and carriage returns are flattened because they break the
    // row apart regardless of quoting.
    const cell = (value: unknown): string => {
      const text = String(value ?? "").replace(/[\t\r\n]+/g, " ");
      const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
      return `"${safe.replace(/"/g, '""')}"`;
    };

    const csv = [headers.map(cell).join(","), ...rows.map((r) => r.map(cell).join(","))].join(
      "\r\n",
    );

    // A Blob rather than a data: URI. encodeURI leaves "#" untouched, so one
    // hash anywhere in a customer note truncated the file at that point, and a
    // long export ran past the browser's data-URI length limit. The BOM is what
    // makes Excel read the file as UTF-8 — without it every Arabic or accented
    // name in the list arrives as mojibake.
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nawi-saadi-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-8 rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:p-8">
      {/* Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F1F5F9] pb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#00365F]">Leads</h2>
          <p className="mt-1 font-sans text-xs text-[#64748B]">
            {filtered.length} of {leads.length}
          </p>
        </div>

        <button
          type="button"
          onClick={exportCsv}
          disabled={!filtered.length}
          className="inline-flex items-center gap-2 rounded-xl bg-[#00365F] px-4 py-2.5 font-sans text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#CAA42D] hover:text-[#00365F] disabled:opacity-50"
        >
          <Download className="size-4" />
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, reference, or package…"
            className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-2.5 pl-10 pr-4 font-sans text-xs outline-none focus:border-[#CAA42D] focus:bg-white"
          />
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-1">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={cn(
              "rounded-lg px-3 py-1 font-sans text-xs font-bold capitalize transition-colors",
              statusFilter === "all"
                ? "bg-[#00365F] text-white"
                : "text-[#64748B] hover:text-[#00365F]",
            )}
          >
            All ({leads.length})
          </button>
          {byStatus.map((s) => (
            <button
              key={s.status}
              type="button"
              onClick={() => setStatusFilter(s.status)}
              className={cn(
                "rounded-lg px-3 py-1 font-sans text-xs font-bold capitalize transition-colors",
                statusFilter === s.status
                  ? "bg-[#00365F] text-white"
                  : "text-[#64748B] hover:text-[#00365F]",
              )}
            >
              {s.status} ({s.count})
            </button>
          ))}
        </div>

        {/* Source Dropdown */}
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          aria-label="Filter by Lead Source"
          className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 font-sans text-xs font-semibold text-[#00365F] outline-none focus:border-[#CAA42D]"
        >
          <option value="all">All Sources ({leads.length})</option>
          {bySource.map((s) => (
            <option key={s.source} value={s.source}>
              {s.source} ({s.count})
            </option>
          ))}
        </select>
      </div>

      {/* Leads Table */}
      {filtered.length ? (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse font-sans text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-left text-[#64748B]">
                <th className="rounded-l-xl py-3 px-4 font-bold">When</th>
                <th className="py-3 px-4 font-bold">Contact</th>
                <th className="py-3 px-4 font-bold">Source</th>
                <th className="py-3 px-4 font-bold">Trip</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="rounded-r-xl py-3 px-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filtered.map((l) => {
                const isExpanded = expanded === l.id;
                const ref = String(l.detail?.["reference"] ?? "");
                const pkg = String(l.detail?.["package"] ?? "");
                const dates = String(l.detail?.["dates"] ?? "");
                const travellers = l.detail?.["adults"]
                  ? `${l.detail["adults"]}A ${l.detail["children"] ?? 0}C`
                  : "";
                const budget = String(l.detail?.["budget"] ?? "");

                return (
                  <Fragment key={l.id}>
                    <tr
                      className={cn(
                        "transition-colors hover:bg-[#F8FAFC]",
                        isExpanded && "bg-[#F8FAFC]",
                      )}
                    >
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-[#64748B]">
                        <div className="font-semibold text-[#00365F]">
                          {new Date(l.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-[11px] text-[#94A3B8]">
                          {new Date(l.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        {l.name ? <div className="font-bold text-[#00365F]">{l.name}</div> : null}
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`mailto:${l.email}`}
                            className="font-medium text-[#00365F] hover:text-[#CAA42D] hover:underline"
                          >
                            {l.email}
                          </a>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(l.email, `email-${l.id}`)}
                            title="Copy Email"
                            className="text-[#94A3B8] hover:text-[#00365F]"
                          >
                            {copied === `email-${l.id}` ? (
                              <Check className="size-3 text-emerald-600" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </button>
                        </div>
                        {l.phone ? (
                          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-[#00365F]">
                            <Phone className="size-3 text-[#CAA42D]" />
                            <span>{l.phone}</span>
                            <a
                              href={`https://wa.me/${l.phone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100"
                            >
                              <MessageSquare className="size-2.5" /> WhatsApp
                            </a>
                          </div>
                        ) : null}
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            "inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                            l.source === "contact_enquiry"
                              ? "bg-blue-100 text-blue-800"
                              : l.source === "custom_tour"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-700",
                          )}
                        >
                          {l.source}
                        </span>
                        {ref ? (
                          <div className="mt-1 font-mono text-[10px] font-bold text-[#CAA42D]">
                            Ref: {ref}
                          </div>
                        ) : null}
                      </td>

                      {/* Trip details */}
                      <td className="py-3.5 px-4 max-w-[260px]">
                        {pkg ? (
                          <div className="font-semibold text-[#00365F] truncate">{pkg}</div>
                        ) : (
                          <div className="text-[#64748B] font-mono text-[11px] truncate">
                            {l.path ?? "Direct"}
                          </div>
                        )}
                        {/* The last two emoji in the product. A calendar and
                            a pair of silhouettes rendered differently on every
                            operating system and said less than the word does. */}
                        {dates ? (
                          <div className="text-[11px] text-[#64748B]">
                            <span className="text-[#94A3B8]">Dates</span> {dates}
                          </div>
                        ) : null}
                        {travellers ? (
                          <div className="text-[11px] text-[#64748B]">
                            <span className="text-[#94A3B8]">Travellers</span> {travellers}
                            {budget ? ` · AED ${budget}` : ""}
                          </div>
                        ) : null}
                      </td>

                      {/* Status selector */}
                      <td className="py-3.5 px-4">
                        <select
                          value={l.status}
                          disabled={busy === l.id}
                          onChange={(e) => updateStatus(l.id, e.target.value)}
                          className={cn(
                            "rounded-lg border px-2.5 py-1 font-sans text-xs font-bold capitalize outline-none transition-colors",
                            l.status === "new"
                              ? "border-amber-300 bg-amber-50 text-amber-900"
                              : l.status === "contacted"
                                ? "border-blue-300 bg-blue-50 text-blue-900"
                                : l.status === "quoted"
                                  ? "border-purple-300 bg-purple-50 text-purple-900"
                                  : l.status === "booked"
                                    ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                                    : "border-slate-300 bg-slate-50 text-slate-700",
                          )}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Actions / Expand */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setExpanded(isExpanded ? null : l.id)}
                            aria-expanded={isExpanded}
                            aria-controls={`lead-detail-${l.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] px-2.5 py-1 text-xs font-semibold text-[#00365F] hover:border-[#CAA42D]"
                          >
                            <span>{isExpanded ? "Hide" : "Details"}</span>
                            {isExpanded ? (
                              <ChevronUp className="size-3" />
                            ) : (
                              <ChevronDown className="size-3" />
                            )}
                          </button>

                          {/*
                          Two-step, because there is no undo. The first click
                          arms the button and shows the address being removed;
                          the second commits. Arming clears itself after a few
                          seconds so a half-pressed delete cannot sit waiting
                          for an unrelated click later.
                        */}
                          {confirming === l.id ? (
                            <button
                              type="button"
                              disabled={busy === l.id}
                              onClick={async () => {
                                setBusy(l.id);
                                const res = await removeLead({
                                  data: { id: l.id, email: l.email },
                                });
                                setBusy(null);
                                setConfirming(null);
                                if (res.ok) router.invalidate();
                              }}
                              className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                              title={`Permanently delete ${l.email}`}
                            >
                              <Trash2 className="size-3" />
                              {busy === l.id ? "Deleting…" : "Confirm"}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirming(l.id)}
                              aria-label={`Delete lead ${l.email}`}
                              className="inline-flex items-center rounded-lg border border-[#E2E8F0] px-2 py-1 text-xs text-[#94A3B8] hover:border-red-300 hover:text-red-600"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {isExpanded ? (
                      <tr id={`lead-detail-${l.id}`} className="bg-[#F8FAFC]">
                        <td colSpan={6} className="px-4 pb-6">
                          <LeadDetail lead={l} />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-[#CBD5E1] p-12 text-center">
          <Mail className="mx-auto size-8 text-[#94A3B8]" />
          <h3 className="mt-3 font-display text-lg font-bold text-[#00365F]">No leads found</h3>
          <p className="mt-1 font-sans text-xs text-[#64748B]">
            Try changing your search keywords or filter options.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * The expanded row behind the "Details" button.
 *
 * This did not exist. The button toggled a highlight and nothing else, so
 * everything the enquiry form collects beyond the four summary columns — the
 * free-text requirements the customer typed, the budget, the page they came
 * from, the session that ties them back to the visitor feed — was written to
 * the database and then never shown to anyone.
 *
 * Notes are the other half. `leads.notes` exists, the server function has
 * always accepted it, and there was no way to write one: a consultant could
 * move a lead to "contacted" but not record what was said.
 */
function LeadDetail({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // A different lead can land in this slot when the list re-sorts after a
  // refresh, and the box must not keep the previous lead's text.
  //
  // Adjusting during render rather than in an effect, which is React's own
  // recommendation for resetting state on a prop change: it runs before the
  // browser paints, so the previous lead's notes never flash. An effect keyed
  // on `lead.notes` — the obvious version — also cleared the "Saved"
  // confirmation the instant the post-save refresh arrived, so the write
  // landed but the panel gave no sign of it.
  const [seenId, setSeenId] = useState(lead.id);
  if (seenId !== lead.id) {
    setSeenId(lead.id);
    setNotes(lead.notes ?? "");
    setState("idle");
  }

  const dirty = notes !== (lead.notes ?? "");

  const save = async () => {
    setState("saving");
    const res = await saveLead({ data: { id: lead.id, notes } });
    if (!res.ok) {
      setState("error");
      return;
    }
    setState("saved");
    // Refresh in the background so the row's own copy catches up; the panel
    // already shows the value that was written.
    void router.invalidate();
  };

  // Everything the forms record, minus the fields already shown as columns.
  const facts: [string, string][] = Object.entries(lead.detail ?? {})
    .filter(([, v]) => v !== null && v !== "" && v !== undefined)
    .map(([k, v]) => [
      k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()),
      typeof v === "object" ? JSON.stringify(v) : String(v),
    ]);

  return (
    <div className="grid gap-5 rounded-2xl border border-[#E2E8F0] bg-white p-5 lg:grid-cols-[1fr_340px]">
      <div>
        <h4 className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
          Enquiry detail
        </h4>

        {facts.length ? (
          <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {facts.map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  {label}
                </dt>
                <dd className="font-sans text-xs text-[#00365F]">{value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-3 font-sans text-xs text-[#94A3B8]">
            No extra detail was captured with this submission.
          </p>
        )}

        <dl className="mt-5 grid gap-x-6 gap-y-2 border-t border-[#F1F5F9] pt-4 sm:grid-cols-2">
          <div className="min-w-0">
            <dt className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Landed on
            </dt>
            <dd className="truncate font-mono text-xs text-[#00365F]">{lead.path ?? "—"}</dd>
          </div>
          <div className="min-w-0">
            <dt className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Session
            </dt>
            <dd className="truncate font-mono text-xs text-[#64748B]">
              {lead.session_id ?? "not recorded"}
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <label
          htmlFor={`notes-${lead.id}`}
          className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#64748B]"
        >
          Consultant notes
        </label>
        <textarea
          id={`notes-${lead.id}`}
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            if (state !== "idle") setState("idle");
          }}
          rows={6}
          maxLength={5000}
          placeholder="What was quoted, what they asked for, when to follow up…"
          className="mt-2 w-full resize-y rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 font-sans text-xs leading-relaxed text-[#00365F] outline-none focus:border-[#CAA42D] focus:bg-white"
        />
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={save}
            disabled={!dirty || state === "saving"}
            className="rounded-xl bg-[#00365F] px-4 py-2 font-sans text-xs font-bold text-white transition-colors hover:bg-[#CAA42D] hover:text-[#00365F] disabled:opacity-40"
          >
            {state === "saving" ? "Saving…" : "Save note"}
          </button>
          {state === "saved" && !dirty ? (
            <span className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-emerald-700">
              <Check className="size-3.5" /> Saved
            </span>
          ) : null}
          {state === "error" ? (
            <span className="font-sans text-xs font-semibold text-red-600">
              Could not save. Try again.
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SessionsFeed({ recent }: { recent: Dashboard["recent"] }) {
  return (
    <div className="mt-8 rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:p-8">
      <h2 className="font-display text-2xl font-bold text-[#00365F]">
        Live Visitor Activity Feed (Last 150 Events)
      </h2>
      <p className="mt-1 font-sans text-xs text-[#64748B]">
        Real-time audit log of page views, button taps, and trip explorations
      </p>

      {recent.length ? (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse font-sans text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-left text-[#64748B]">
                <th className="rounded-l-xl py-3 px-4 font-bold">Timestamp</th>
                <th className="py-3 px-4 font-bold">Event Type</th>
                <th className="py-3 px-4 font-bold">Page Path</th>
                <th className="py-3 px-4 font-bold">Device</th>
                <th className="py-3 px-4 font-bold">Session ID</th>
                <th className="rounded-r-xl py-3 px-4 font-bold">Payload / Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {recent.map((e) => (
                <tr key={e.id} className="transition-colors hover:bg-[#F8FAFC]">
                  <td className="py-3 px-4 whitespace-nowrap text-[#64748B]">
                    {new Date(e.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        e.type === "whatsapp_click"
                          ? "bg-[#CAA42D]/20 text-[#7A641B]"
                          : e.type === "page_view"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-700",
                      )}
                    >
                      {e.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-[#00365F]">{e.path}</td>
                  <td className="py-3 px-4 text-[#64748B]">{e.device ?? "â€”"}</td>
                  <td className="py-3 px-4 font-mono text-[10px] text-[#94A3B8]">
                    {e.session_id?.slice(0, 10)}
                  </td>
                  <td className="py-3 px-4 font-mono text-[10px] text-[#64748B] max-w-[280px] truncate">
                    {JSON.stringify(e.meta)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-8 p-12 text-center text-xs text-[#94A3B8]">No events logged yet.</div>
      )}
    </div>
  );
}

/*
 * AnalyticsOverview, Panel and Bars were removed with the tab they served.
 *
 * They drew page views, device split, referrers and a fourteen-day visitor
 * chart from the `events` table — a small, worse version of what GA4 now does
 * properly, with none of its segmentation and no way to compare a period.
 * Keeping a second, weaker analytics screen inside the admin panel only
 * invited someone to read the wrong numbers.
 *
 * The traffic totals are still recorded in `events` and still returned by
 * loadDashboard(), so nothing is lost from the database — only the duplicate
 * reporting surface is gone. Traffic questions belong in GA4; this panel is
 * for leads.
 */

/* -------------------------------------------------------------------------- *
 * Shared export
 * -------------------------------------------------------------------------- */

/**
 * Writes a CSV the office can open in Excel without it mangling anything.
 *
 * Three things this handles that a naive join does not: a cell opening with
 * = + - or @ is executable in Excel and Sheets, so it is prefixed with an
 * apostrophe; tabs and newlines inside a value break the row apart regardless
 * of quoting, so they are flattened; and without a BOM, Excel reads the file
 * as the local codepage and every Arabic or accented name arrives as mojibake.
 */
function downloadCsv(filename: string, headers: string[], rows: unknown[][]): void {
  const cell = (value: unknown): string => {
    const text = String(value ?? "").replace(/[\t\r\n]+/g, " ");
    const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const csv = [headers.map(cell).join(","), ...rows.map((r) => r.map(cell).join(","))].join("\r\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Local date and time, or a dash when there is nothing to show. */
const when = (iso: string | null | undefined): string =>
  iso ? new Date(iso).toLocaleString() : "Not recorded";

/* -------------------------------------------------------------------------- *
 * Subscribers
 * -------------------------------------------------------------------------- */

/**
 * Newsletter signups, with the address prominent.
 *
 * These used to sit inside the general Leads table, sorted between real
 * enquiries and counted in the same total, so the enquiry list looked busier
 * than it was and the mailing list could not be exported on its own.
 */
function SubscribersManager({ subscribers }: { subscribers: Lead[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return subscribers;
    return subscribers.filter((s) =>
      [s.email, s.name, s.source, s.path].some((v) => (v ?? "").toLowerCase().includes(q)),
    );
  }, [subscribers, query]);

  const copyAll = () => {
    void navigator.clipboard?.writeText(filtered.map((s) => s.email).join(", "));
  };

  return (
    <div className="mt-8 rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F1F5F9] pb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#00365F]">Newsletter subscribers</h2>
          <p className="mt-1 font-sans text-xs text-[#64748B]">
            {filtered.length === subscribers.length
              ? `${subscribers.length} ${subscribers.length === 1 ? "address" : "addresses"}`
              : `${filtered.length} of ${subscribers.length}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={copyAll}
            disabled={!filtered.length}
            className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] px-4 py-2.5 font-sans text-xs font-bold text-[#00365F] transition-colors hover:bg-[#F8FAFC] disabled:opacity-40"
          >
            <Copy className="size-4" />
            <span>Copy addresses</span>
          </button>
          <button
            type="button"
            onClick={() =>
              downloadCsv(
                "nawi-saadi-subscribers",
                ["Subscribed", "Email", "Name", "Signed up from", "Page", "Status"],
                filtered.map((s) => [
                  when(s.created_at),
                  s.email,
                  s.name ?? "",
                  s.source,
                  s.path ?? "",
                  s.status,
                ]),
              )
            }
            disabled={!filtered.length}
            className="inline-flex items-center gap-2 rounded-xl bg-[#00365F] px-4 py-2.5 font-sans text-xs font-bold text-white transition-colors hover:bg-[#00243f] disabled:opacity-40"
          >
            <Download className="size-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <label className="mt-6 flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5">
        <Search className="size-4 shrink-0 text-[#94A3B8]" aria-hidden="true" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by address, name or page"
          className="w-full bg-transparent font-sans text-sm text-[#00365F] outline-none placeholder:text-[#94A3B8]"
        />
      </label>

      {filtered.length ? (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse font-sans text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-left text-[#475569]">
                <th className="rounded-l-xl px-4 py-3 font-bold">Subscribed</th>
                <th className="px-4 py-3 font-bold">Email</th>
                <th className="px-4 py-3 font-bold">Name</th>
                <th className="px-4 py-3 font-bold">Signed up from</th>
                <th className="rounded-r-xl px-4 py-3 font-bold">Page</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filtered.map((sub) => (
                <tr key={sub.id} className="transition-colors hover:bg-[#F8FAFC]">
                  <td className="whitespace-nowrap px-4 py-3 text-[#475569]">
                    {when(sub.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`mailto:${sub.email}`}
                      className="font-semibold text-[#00365F] hover:text-[#7A641B] hover:underline"
                    >
                      {sub.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-[#475569]">{sub.name ?? "Not given"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#475569]">
                      {sub.source}
                    </span>
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3 font-mono text-[11px] text-[#64748B]">
                    {sub.path ?? "Not recorded"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-[#CBD5E1] p-12 text-center text-[#64748B]">
          {subscribers.length ? "Nothing matches that search." : "No one has subscribed yet."}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- *
 * WhatsApp
 * -------------------------------------------------------------------------- */

/**
 * Every WhatsApp click, in full.
 *
 * This used to render from `recent`, which is capped at 150 events, while the
 * tab counted all of them from the 5,000-row read. The badge said one number
 * and the list showed another, which reads as enquiries going missing.
 *
 * The prefilled message is the most valuable thing the site records: it is the
 * visitor's own statement of what they want, captured at the moment they
 * decided to ask. It is shown in full, parsed into fields where the capture
 * managed it, with the raw text underneath either way.
 */
function WhatsAppIntentLog({
  log,
  contexts,
}: {
  log: Dashboard["whatsappLog"];
  contexts: Dashboard["whatsappContexts"];
}) {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return log;
    return log.filter((w) =>
      [w.intent, w.slug, w.path, w.pageType, w.label, ...Object.values(w.fields)].some((v) =>
        (v ?? "").toLowerCase().includes(q),
      ),
    );
  }, [log, query]);

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F1F5F9] pb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#00365F]">WhatsApp enquiries</h2>
            <p className="mt-1 font-sans text-xs text-[#64748B]">
              {filtered.length === log.length
                ? `${log.length} recorded, every one kept`
                : `${filtered.length} of ${log.length}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              downloadCsv(
                "nawi-saadi-whatsapp",
                ["When", "Package or page", "Page type", "Device", "Opened", "Message", "Session"],
                filtered.map((w) => [
                  when(w.created_at),
                  w.slug || w.path || "",
                  w.pageType,
                  w.device ?? "",
                  w.openKind === "new_tab" ? "new tab" : "same tab",
                  w.intent,
                  w.session_id ?? "",
                ]),
              )
            }
            disabled={!filtered.length}
            className="inline-flex items-center gap-2 rounded-xl bg-[#00365F] px-4 py-2.5 font-sans text-xs font-bold text-white transition-colors hover:bg-[#00243f] disabled:opacity-40"
          >
            <Download className="size-4" />
            <span>Export CSV</span>
          </button>
        </div>

        <label className="mt-6 flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5">
          <Search className="size-4 shrink-0 text-[#94A3B8]" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages, packages or pages"
            className="w-full bg-transparent font-sans text-sm text-[#00365F] outline-none placeholder:text-[#94A3B8]"
          />
        </label>

        {filtered.length ? (
          <ul className="mt-6 space-y-3">
            {filtered.map((w) => {
              const fieldList = Object.entries(w.fields);
              const open = openId === w.id;
              const tags = [
                w.pageType,
                w.device,
                w.openKind === "new_tab" ? "opened in a new tab" : null,
                w.referrer,
              ].filter(Boolean);
              return (
                <li
                  key={w.id}
                  className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 transition-colors hover:border-[#CAA42D]"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <span className="font-sans text-xs font-bold text-[#00365F]">
                      {w.slug || w.path || "General enquiry"}
                    </span>
                    <span className="font-sans text-[11px] text-[#64748B]">
                      {when(w.created_at)}
                    </span>
                  </div>

                  {tags.length ? (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {tags.map((tag) => (
                        <span
                          key={String(tag)}
                          className="rounded-full bg-white px-2.5 py-0.5 font-sans text-[10px] font-semibold text-[#475569] ring-1 ring-[#E2E8F0]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {fieldList.length ? (
                    <dl className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                      {fieldList.map(([k, v]) => (
                        <div key={k} className="min-w-0">
                          <dt className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                            {k}
                          </dt>
                          <dd className="truncate font-sans text-xs font-semibold text-[#00365F]">
                            {v}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}

                  {w.intent ? (
                    <>
                      <p
                        className={cn(
                          "mt-3 whitespace-pre-wrap font-sans text-xs leading-relaxed text-[#475569]",
                          !open && "line-clamp-2",
                        )}
                      >
                        {w.intent}
                      </p>
                      {w.intent.length > 130 ? (
                        <button
                          type="button"
                          onClick={() => setOpenId(open ? null : w.id)}
                          className="mt-1.5 inline-flex items-center gap-1 font-sans text-[11px] font-bold text-[#00365F] hover:text-[#7A641B]"
                        >
                          {open ? "Show less" : "Show the whole message"}
                          {open ? (
                            <ChevronUp className="size-3.5" />
                          ) : (
                            <ChevronDown className="size-3.5" />
                          )}
                        </button>
                      ) : null}
                    </>
                  ) : (
                    <p className="mt-3 font-sans text-xs italic text-[#94A3B8]">
                      No prefilled message on this link.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-[#CBD5E1] p-12 text-center text-[#64748B]">
            {log.length ? "Nothing matches that search." : "No WhatsApp clicks recorded yet."}
          </div>
        )}
      </div>

      <div className="h-fit rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:p-8">
        <h3 className="font-display text-lg font-bold text-[#00365F]">Which pages start chats</h3>
        <p className="mt-1 font-sans text-xs text-[#64748B]">Ranked by clicks</p>

        {contexts.length ? (
          <ul className="mt-6 divide-y divide-[#F1F5F9]">
            {contexts.map((c) => (
              <li key={c.context} className="flex items-center justify-between gap-3 py-3">
                <span className="truncate font-sans text-xs font-semibold text-[#00365F]">
                  {c.context}
                </span>
                <span className="shrink-0 rounded-full bg-[#CAA42D]/20 px-2.5 py-0.5 font-display text-xs font-extrabold text-[#7A641B]">
                  {c.count}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 font-sans text-xs text-[#94A3B8]">Nothing yet.</p>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- *
 * Visitors
 * -------------------------------------------------------------------------- */

/** How an event type should read to someone who did not write the code. */
const EVENT_LABELS: Record<string, string> = {
  page_view: "Viewed page",
  package_view: "Opened package",
  country_view: "Opened country",
  activity_view: "Opened activity",
  whatsapp_click: "Started a WhatsApp chat",
  phone_click: "Tapped the phone number",
  email_click: "Tapped the email address",
  cta_click: "Pressed a call to action",
  offer_shown: "Saw the offer popup",
  offer_dismissed: "Dismissed the offer",
  offer_cta: "Took the offer",
  enquiry_search: "Searched",
  outbound_click: "Left for another site",
  scroll_depth: "Scrolled",
  ui_click: "Pressed a button",
  filter_change: "Changed a filter",
};

/**
 * One visitor at a time, and what they actually did.
 *
 * The old feed was a flat table of the last 150 events across everybody, which
 * answers "is anything happening" and nothing else. Grouping by session answers
 * the question the office asks: this person messaged us about Baku, what were
 * they looking at first, and how long were they on the site.
 */
function VisitorSessions({
  sessions,
  journeys,
  funnel,
  recent,
}: {
  sessions: Dashboard["sessions"];
  journeys: Dashboard["journeys"];
  funnel: Dashboard["funnel"];
  recent: Dashboard["recent"];
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [enquirersOnly, setEnquirersOnly] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const shown = useMemo(
    () => (enquirersOnly ? sessions.filter((s) => s.whatsapp > 0) : sessions),
    [sessions, enquirersOnly],
  );

  const pct = (n: number) => (funnel.visited ? Math.round((n / funnel.visited) * 100) : 0);
  /*
   * Counts, not funnel stages, and labelled as such.
   *
   * They are not nested: someone can arrive straight on a package page from an
   * ad without ever seeing a second page, so "opened a package" runs higher
   * than "saw more than one page". Drawn as a funnel that reads as broken data.
   */
  const stages = [
    { label: "Arrived", value: funnel.visited },
    { label: "Opened a package, country or tour", value: funnel.viewedDetail },
    { label: "Saw more than one page", value: funnel.browsed },
    { label: "Started a WhatsApp chat", value: funnel.enquired },
  ];
  const detailToChat = funnel.viewedDetail
    ? Math.round((funnel.enquiredAfterDetail / funnel.viewedDetail) * 100)
    : 0;

  return (
    <div className="mt-8 space-y-6">
      {/* Funnel */}
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-display text-2xl font-bold text-[#00365F]">What visitors did</h2>
        <p className="mt-1 font-sans text-xs text-[#64748B]">
          Across the {sessions.length} {sessions.length === 1 ? "session" : "sessions"} recorded.
          These overlap: someone can arrive straight on a package page.
        </p>

        {funnel.viewedDetail ? (
          <p className="mt-5 rounded-2xl bg-[#F8FAFC] px-4 py-3 font-sans text-xs text-[#475569]">
            <span className="font-bold text-[#00365F]">
              {funnel.enquiredAfterDetail} of {funnel.viewedDetail}
            </span>{" "}
            who opened a package or tour went on to message ({detailToChat}%). That is the number
            worth moving.
          </p>
        ) : null}

        <ul className="mt-6 space-y-3">
          {stages.map((stage) => (
            <li key={stage.label}>
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-sans text-xs font-semibold text-[#00365F]">
                  {stage.label}
                </span>
                <span className="font-sans text-xs tabular-nums text-[#64748B]">
                  {stage.value} ({pct(stage.value)}%)
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#F1F5F9]">
                <div
                  className="h-full rounded-full bg-[#00365F]"
                  style={{ width: `${pct(stage.value)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Session list */}
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F1F5F9] pb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#00365F]">Visitors</h2>
            <p className="mt-1 font-sans text-xs text-[#64748B]">
              Newest first. Open one to see everywhere they went.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setEnquirersOnly((v) => !v)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-sans text-xs font-bold transition-colors",
                enquirersOnly
                  ? "bg-[#00365F] text-white"
                  : "border border-[#E2E8F0] text-[#00365F] hover:bg-[#F8FAFC]",
              )}
            >
              <Filter className="size-4" />
              <span>Only those who messaged</span>
            </button>
            <button
              type="button"
              onClick={() =>
                downloadCsv(
                  "nawi-saadi-visitors",
                  [
                    "Started",
                    "Ended",
                    "Minutes",
                    "Device",
                    "Came from",
                    "Pages",
                    "Events",
                    "WhatsApp",
                    "Session",
                  ],
                  shown.map((s) => [
                    when(s.started),
                    when(s.ended),
                    s.minutes,
                    s.device ?? "",
                    s.referrer ?? "direct",
                    s.pages.join(" > "),
                    s.events,
                    s.whatsapp,
                    s.id,
                  ]),
                )
              }
              disabled={!shown.length}
              className="inline-flex items-center gap-2 rounded-xl bg-[#00365F] px-4 py-2.5 font-sans text-xs font-bold text-white transition-colors hover:bg-[#00243f] disabled:opacity-40"
            >
              <Download className="size-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {shown.length ? (
          <ul className="mt-6 space-y-3">
            {shown.map((s) => {
              const open = openId === s.id;
              const steps = journeys[s.id];
              return (
                <li
                  key={s.id}
                  className={cn(
                    "rounded-2xl border transition-colors",
                    s.whatsapp > 0
                      ? "border-[#CAA42D]/50 bg-[#FEFCF5]"
                      : "border-[#E2E8F0] bg-[#F8FAFC]",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : s.id)}
                    aria-expanded={open}
                    className="w-full cursor-pointer p-4 text-left"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <span className="font-sans text-xs font-bold text-[#00365F]">
                        {s.pages[0] ?? "Unknown entry page"}
                        {s.pages.length > 1 ? (
                          <span className="font-normal text-[#64748B]">
                            {" "}
                            and {s.pages.length - 1} more{" "}
                            {s.pages.length - 1 === 1 ? "page" : "pages"}
                          </span>
                        ) : null}
                      </span>
                      <span className="font-sans text-[11px] text-[#64748B]">
                        {when(s.started)}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {s.whatsapp > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#CAA42D]/25 px-2.5 py-0.5 font-sans text-[10px] font-bold text-[#7A641B]">
                          <MessageCircle className="size-3" />
                          {s.whatsapp} WhatsApp {s.whatsapp === 1 ? "click" : "clicks"}
                        </span>
                      ) : null}
                      {[
                        s.device,
                        s.referrer ?? "direct",
                        `${s.events} ${s.events === 1 ? "action" : "actions"}`,
                        s.minutes > 0 ? `${s.minutes} min` : "under a minute",
                      ]
                        .filter(Boolean)
                        .map((tag) => (
                          <span
                            key={String(tag)}
                            className="rounded-full bg-white px-2.5 py-0.5 font-sans text-[10px] font-semibold text-[#475569] ring-1 ring-[#E2E8F0]"
                          >
                            {tag}
                          </span>
                        ))}
                      <span className="ml-auto inline-flex items-center gap-1 font-sans text-[11px] font-bold text-[#00365F]">
                        {open ? "Hide the journey" : "See the journey"}
                        {open ? (
                          <ChevronUp className="size-3.5" />
                        ) : (
                          <ChevronDown className="size-3.5" />
                        )}
                      </span>
                    </div>
                  </button>

                  {open ? (
                    <div className="border-t border-[#E2E8F0] px-4 pb-4 pt-3">
                      {steps?.length ? (
                        <ol className="space-y-2.5">
                          {steps.map((step, i) => (
                            <li key={`${step.t}-${i}`} className="flex gap-3">
                              <span className="mt-1 w-14 shrink-0 font-sans text-[10px] tabular-nums text-[#94A3B8]">
                                {new Date(step.t).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })}
                              </span>
                              <span
                                className={cn(
                                  "mt-1.5 size-2 shrink-0 rounded-full",
                                  step.type === "whatsapp_click" ? "bg-[#CAA42D]" : "bg-[#CBD5E1]",
                                )}
                                aria-hidden="true"
                              />
                              <span className="min-w-0 font-sans text-xs">
                                <span className="font-semibold text-[#00365F]">
                                  {EVENT_LABELS[step.type] ?? step.type}
                                </span>
                                {step.path ? (
                                  <span className="ml-1.5 font-mono text-[11px] text-[#64748B]">
                                    {step.path}
                                  </span>
                                ) : null}
                                {step.label ? (
                                  <span className="ml-1.5 text-[#475569]">{step.label}</span>
                                ) : null}
                              </span>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="font-sans text-xs text-[#94A3B8]">
                          The step-by-step journey is kept for the 80 most recent visitors only.
                          This one is older than that.
                        </p>
                      )}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-[#CBD5E1] p-12 text-center text-[#64748B]">
            {sessions.length ? "No one has messaged yet." : "No visitors recorded yet."}
          </div>
        )}
      </div>

      {/* Raw event log, folded away: useful when something looks wrong, noise otherwise. */}
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:p-8">
        <button
          type="button"
          onClick={() => setShowRaw((v) => !v)}
          aria-expanded={showRaw}
          className="flex w-full cursor-pointer items-center justify-between gap-4 text-left"
        >
          <span>
            <span className="block font-display text-lg font-bold text-[#00365F]">
              Raw event log
            </span>
            <span className="mt-0.5 block font-sans text-xs text-[#64748B]">
              The last {recent.length} actions across everyone, exactly as recorded
            </span>
          </span>
          {showRaw ? (
            <ChevronUp className="size-5 shrink-0 text-[#64748B]" />
          ) : (
            <ChevronDown className="size-5 shrink-0 text-[#64748B]" />
          )}
        </button>

        {showRaw ? <SessionsFeed recent={recent} /> : null}
      </div>
    </div>
  );
}
