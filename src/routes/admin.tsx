import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Fragment, useMemo, useState } from "react";
import {
  Activity,
  MessageCircle,
  Users,
  Eye,
  Smartphone,
  Globe,
  Clock,
  RefreshCw,
  Lock,
  Mail,
  Search,
  Download,
  Check,
  Filter,
  Phone,
  ExternalLink,
  MessageSquare,
  Copy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Dashboard, Lead } from "@/lib/admin-data";

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

const signOut = createServerFn({ method: "POST" }).handler(async () => {
  const { setCookie } = await import("@tanstack/react-start/server");
  setCookie(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return { ok: true as const };
});

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Executive Admin Dashboard — Nawi Saadi Holidays" },
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

type TabType = "overview" | "leads" | "whatsapp" | "sessions";

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
              <p className="font-sans text-[11px] text-[#666666]">
                Live Production Management ·{" "}
                {who ? <span className="font-medium text-[#00365F]">{who}</span> : "Admin"}
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex items-center gap-1 rounded-2xl bg-[#F1F5F9] p-1">
            {[
              { id: "leads", label: "Leads & Enquiries", count: data.leads.length, icon: Mail },
              {
                id: "whatsapp",
                label: "WhatsApp Intent Log",
                count: data.totals.whatsapp,
                icon: MessageCircle,
              },
              { id: "overview", label: "Analytics Overview", icon: Activity },
              {
                id: "sessions",
                label: "Live Visitor Feed",
                count: data.recent.length,
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
        {/* KPI Banner */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <KpiCard
            icon={Mail}
            label="Total Customer Leads"
            value={data.leads.length}
            note="Subscribers & Enquiries"
            accent
          />
          <KpiCard
            icon={MessageCircle}
            label="WhatsApp Enquiries"
            value={data.totals.whatsapp}
            note="Direct chats initiated"
          />
          <KpiCard
            icon={Users}
            label="Unique Visitors"
            value={data.totals.sessions}
            note="Tracked browser sessions"
          />
          <KpiCard
            icon={Eye}
            label="Page Views"
            value={data.totals.pageViews}
            note="Destination & tour views"
          />
          <KpiCard
            icon={Activity}
            label="Total Interactions"
            value={data.totals.events}
            note="Button clicks & browsing"
          />
        </div>

        {tab === "leads" && (
          <LeadsManager
            leads={data.leads}
            byStatus={data.leadsByStatus}
            bySource={data.leadsBySource}
          />
        )}

        {tab === "whatsapp" && (
          <WhatsAppIntentLog contexts={data.whatsappContexts} events={data.recent} />
        )}

        {tab === "overview" && <AnalyticsOverview data={data} />}

        {tab === "sessions" && <SessionsFeed recent={data.recent} />}
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
          <h2 className="font-display text-2xl font-bold text-[#00365F]">
            Customer Inquiries & Subscribers Pipeline
          </h2>
          <p className="mt-1 font-sans text-xs text-[#64748B]">
            Showing {filtered.length} of {leads.length} recorded submissions
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
                <th className="rounded-l-xl py-3 px-4 font-bold">Received</th>
                <th className="py-3 px-4 font-bold">Customer Contact</th>
                <th className="py-3 px-4 font-bold">Lead Source</th>
                <th className="py-3 px-4 font-bold">Trip / Context</th>
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
                        {dates ? (
                          <div className="text-[11px] text-[#64748B]">📅 {dates}</div>
                        ) : null}
                        {travellers ? (
                          <div className="text-[11px] text-[#64748B]">
                            👥 {travellers} {budget ? `· AED ${budget}` : ""}
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
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setExpanded(isExpanded ? null : l.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] px-2.5 py-1 text-xs font-semibold text-[#00365F] hover:border-[#CAA42D]"
                        >
                          <span>{isExpanded ? "Hide" : "Details"}</span>
                          {isExpanded ? (
                            <ChevronUp className="size-3" />
                          ) : (
                            <ChevronDown className="size-3" />
                          )}
                        </button>
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
              Could not save — try again.
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function WhatsAppIntentLog({
  contexts,
  events,
}: {
  contexts: Dashboard["whatsappContexts"];
  events: Dashboard["recent"];
}) {
  const whatsappEvents = useMemo(() => {
    return events.filter((e) => e.type === "whatsapp_click");
  }, [events]);

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_400px]">
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-display text-2xl font-bold text-[#00365F]">
          Live WhatsApp Clicks & Pre-filled Messages
        </h2>
        <p className="mt-1 font-sans text-xs text-[#64748B]">
          Audit log of every WhatsApp chat triggered from the website
        </p>

        {whatsappEvents.length ? (
          <div className="mt-6 space-y-4">
            {whatsappEvents.map((w) => {
              const intent = String(w.meta?.["intent"] ?? "");
              const context = String(w.meta?.["context"] ?? w.path ?? "General Enquiry");
              return (
                <div
                  key={w.id}
                  className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 transition-all hover:border-[#CAA42D]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-2.5">
                    <span className="font-sans text-xs font-bold text-[#00365F]">{context}</span>
                    <span className="font-sans text-[11px] text-[#64748B]">
                      {new Date(w.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-2.5 font-sans text-xs leading-relaxed text-[#334155]">
                    {intent ? (
                      <span className="font-medium text-[#00365F]">&ldquo;{intent}&rdquo;</span>
                    ) : (
                      <span className="text-[#94A3B8] italic">
                        Direct WhatsApp Floating Action Button click
                      </span>
                    )}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-[#64748B]">
                    <span>📱 {w.device ?? "Device Unknown"}</span>
                    <span>
                      📍 Path: <code className="font-mono text-[#00365F]">{w.path}</code>
                    </span>
                    <span>
                      🔑 Session:{" "}
                      <code className="font-mono text-[10px] text-[#94A3B8]">
                        {w.session_id?.slice(0, 10)}
                      </code>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-[#CBD5E1] p-12 text-center text-[#64748B]">
            No recent WhatsApp clicks recorded yet.
          </div>
        )}
      </div>

      {/* Top converting contexts */}
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:p-8">
        <h3 className="font-display text-lg font-bold text-[#00365F]">Most Inquired Pages</h3>
        <p className="mt-1 font-sans text-xs text-[#64748B]">
          Pages driving the highest WhatsApp bookings
        </p>

        {contexts.length ? (
          <ul className="mt-6 divide-y divide-[#F1F5F9]">
            {contexts.map((c) => (
              <li key={c.context} className="flex items-center justify-between gap-3 py-3">
                <span className="truncate font-sans text-xs font-semibold text-[#00365F]">
                  {c.context}
                </span>
                <span className="rounded-full bg-[#CAA42D]/20 px-2.5 py-0.5 font-display text-xs font-extrabold text-[#8F7420]">
                  {c.count} {c.count === 1 ? "click" : "clicks"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-xs text-[#94A3B8]">No context stats yet.</p>
        )}
      </div>
    </div>
  );
}

function AnalyticsOverview({ data }: { data: Dashboard }) {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <Panel title="Most Visited Itineraries & Pages" icon={Eye}>
        <Bars rows={data.topPaths.map((p) => ({ label: p.path, count: p.count }))} />
      </Panel>

      <Panel title="Traffic by Device" icon={Smartphone}>
        <Bars rows={data.byDevice.map((d) => ({ label: d.device, count: d.count }))} />
      </Panel>

      <Panel title="Traffic Referral Sources" icon={Globe}>
        <Bars rows={data.byReferrer.map((r) => ({ label: r.referrer, count: r.count }))} />
      </Panel>

      <Panel title="Daily Visitors (Last 14 Days)" icon={Clock}>
        <Bars rows={data.byDay.map((d) => ({ label: d.day, count: d.count }))} />
      </Panel>
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
                          ? "bg-[#CAA42D]/20 text-[#8F7420]"
                          : e.type === "page_view"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-700",
                      )}
                    >
                      {e.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-[#00365F]">{e.path}</td>
                  <td className="py-3 px-4 text-[#64748B]">{e.device ?? "—"}</td>
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

function Panel({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: typeof Activity;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm", className)}
    >
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-[#00365F]">
        <Icon className="size-4 text-[#CAA42D]" />
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Bars({ rows }: { rows: { label: string; count: number }[] }) {
  if (!rows.length) return <p className="text-xs text-[#94A3B8]">No data recorded yet.</p>;
  const max = Math.max(...rows.map((r) => r.count));
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate font-sans text-xs font-semibold text-[#00365F]">
              {r.label}
            </span>
            <span className="shrink-0 font-display text-xs font-bold text-[#64748B]">
              {r.count.toLocaleString()}
            </span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#F1F5F9]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#00365F] to-[#CAA42D]"
              style={{ width: `${Math.max(3, (r.count / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
