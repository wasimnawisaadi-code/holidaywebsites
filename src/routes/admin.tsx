import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  Activity, MessageCircle, Users, Eye, Smartphone, Globe, Clock, RefreshCw, Lock, Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Dashboard } from "@/lib/admin-data";

/**
 * Admin dashboard.
 *
 * Everything that touches Supabase runs in a server function. The service role
 * key bypasses Row Level Security, so it stays on the server: the browser only
 * ever receives the aggregated numbers, never the credential.
 *
 * Auth is a single shared password checked server-side. The password is never
 * compared in the browser and never appears in the bundle. It is held in a
 * cookie after a successful check so a refresh does not log you out.
 *
 * The page is noindex — an analytics dashboard has no business in search.
 */

const COOKIE = "ns_admin";

/** Reads the dashboard, but only for a request carrying a valid session. */
const getDashboard = createServerFn({ method: "GET" }).handler(async () => {
  const { loadDashboard, adminConfigured, checkPassword } = await import("@/lib/admin-data");
  const { getCookie } = await import("@tanstack/react-start/server");

  const token = getCookie(COOKIE);
  const authed = Boolean(token && checkPassword(token));
  if (!authed) return { authed: false as const, configured: adminConfigured() };

  const data = await loadDashboard();
  return { authed: true as const, configured: data.configured, data };
});

/** Verifies the password and, on success, sets the session cookie. */
const signIn = createServerFn({ method: "POST" })
  .validator((d: { password: string }) => d)
  .handler(async ({ data }) => {
    const { checkPassword } = await import("@/lib/admin-data");
    const { setCookie } = await import("@tanstack/react-start/server");

    if (!checkPassword(data.password)) return { ok: false as const };
    setCookie(COOKIE, data.password, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    return { ok: true as const };
  });

/** Moves a lead through the pipeline. Re-checks auth on every call. */
const saveLead = createServerFn({ method: "POST" })
  .validator((d: { id: number; status?: string; notes?: string }) => d)
  .handler(async ({ data }) => {
    const { updateLead, checkPassword } = await import("@/lib/admin-data");
    const { getCookie } = await import("@tanstack/react-start/server");
    // The cookie is checked here too: a server function is a public endpoint,
    // and being rendered inside an authenticated page proves nothing.
    const token = getCookie(COOKIE);
    if (!token || !checkPassword(token)) return { ok: false as const };
    const { id, ...patch } = data;
    return { ok: await updateLead(id, patch) };
  });

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Nawi Saadi" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  loader: () => getDashboard(),
  component: AdminPage,
});

function AdminPage() {
  const state = Route.useLoaderData();
  if (!state.authed) return <SignIn configured={state.configured} />;
  return <Dashboard data={state.data} />;
}

function SignIn({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(false);
    const res = await signIn({ data: { password } });
    setBusy(false);
    if (res.ok) router.invalidate();
    else setError(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#00365F] px-5">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
        <div className="flex items-center gap-2 text-[#00365F]">
          <Lock className="size-4 text-[#CAA42D]" />
          <h1 className="font-display text-2xl">Admin</h1>
        </div>
        <p className="mt-2 font-sans text-xs text-[#666666]">
          Activity, leads and audit log for nawisaadiholidays.com
        </p>

        {!configured ? (
          <p className="mt-5 rounded-xl bg-amber-50 p-3 font-sans text-xs leading-relaxed text-amber-900">
            Supabase is not configured on this deployment. Set{" "}
            <code className="font-mono">SUPABASE_URL</code>,{" "}
            <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> and{" "}
            <code className="font-mono">ADMIN_PASSWORD</code>.
          </p>
        ) : null}

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete="current-password"
          className="mt-6 w-full rounded-xl border border-[#E5E5E5] px-4 py-3 font-sans text-sm outline-none focus:border-[#CAA42D]"
        />
        {error ? (
          <p className="mt-2 font-sans text-xs text-red-600">That password is not correct.</p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="mt-4 w-full rounded-xl bg-[#00365F] px-6 py-3 font-sans text-sm font-bold text-white transition-colors hover:bg-[#CAA42D] hover:text-[#00365F] disabled:opacity-60"
        >
          {busy ? "Checking…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

function Dashboard({ data }: { data: Dashboard }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F8F8F8] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-[1400px]">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8F7420]">
              Activity
            </p>
            <h1 className="mt-2 font-display text-3xl text-[#00365F] sm:text-4xl">
              Everything happening on the site
            </h1>
          </div>
          <button
            type="button"
            onClick={() => router.invalidate()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#00365F] px-5 py-2.5 font-sans text-xs font-bold text-white transition-colors hover:bg-[#CAA42D] hover:text-[#00365F]"
          >
            <RefreshCw className="size-3.5" />
            Refresh
          </button>
        </header>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={MessageCircle} label="WhatsApp clicks" value={data.totals.whatsapp} accent />
          <Stat icon={Users} label="Sessions" value={data.totals.sessions} />
          <Stat icon={Eye} label="Page views" value={data.totals.pageViews} />
          <Stat icon={Activity} label="Events logged" value={data.totals.events} />
          <Stat icon={Mail} label="Leads captured" value={data.leads.length} accent />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Panel title="WhatsApp clicks by page" icon={MessageCircle}>
            {data.whatsappContexts.length ? (
              <ul className="divide-y divide-[#E5E5E5]">
                {data.whatsappContexts.map((c) => (
                  <li key={c.context} className="flex items-start justify-between gap-4 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs text-[#00365F]">{c.context}</p>
                      {c.intent ? (
                        <p className="mt-0.5 truncate font-sans text-[11px] text-[#666666]">
                          {c.intent}
                        </p>
                      ) : null}
                    </div>
                    <span className="shrink-0 font-display text-lg font-bold text-[#CAA42D]">
                      {c.count}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty />
            )}
          </Panel>

          <Panel title="Most viewed pages" icon={Eye}>
            <Bars rows={data.topPaths.map((p) => ({ label: p.path, count: p.count }))} />
          </Panel>

          <Panel title="Event types" icon={Activity}>
            <Bars rows={data.byType.map((t) => ({ label: t.type, count: t.count }))} />
          </Panel>

          <Panel title="Devices" icon={Smartphone}>
            <Bars rows={data.byDevice.map((d) => ({ label: d.device, count: d.count }))} />
          </Panel>

          <Panel title="Where visitors come from" icon={Globe}>
            <Bars rows={data.byReferrer.map((r) => ({ label: r.referrer, count: r.count }))} />
          </Panel>

          <Panel title="Last 14 days" icon={Clock}>
            <Bars rows={data.byDay.map((d) => ({ label: d.day, count: d.count }))} />
          </Panel>
        </div>

        <LeadsPanel leads={data.leads} byStatus={data.leadsByStatus} bySource={data.leadsBySource} />

        <Panel title="Audit log — most recent 150 events" icon={Activity} className="mt-6">
          {data.recent.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse font-sans text-xs">
                <thead>
                  <tr className="border-b border-[#E5E5E5] text-left text-[#666666]">
                    <th className="py-2 pr-4 font-semibold">When</th>
                    <th className="py-2 pr-4 font-semibold">Event</th>
                    <th className="py-2 pr-4 font-semibold">Path</th>
                    <th className="py-2 pr-4 font-semibold">Device</th>
                    <th className="py-2 pr-4 font-semibold">Session</th>
                    <th className="py-2 font-semibold">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent.map((e) => (
                    <tr key={e.id} className="border-b border-[#F1F1F1] align-top">
                      <td className="whitespace-nowrap py-2 pr-4 text-[#666666]">
                        {new Date(e.created_at).toLocaleString()}
                      </td>
                      <td className="py-2 pr-4">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                            e.type === "whatsapp_click"
                              ? "bg-[#CAA42D]/20 text-[#8F7420]"
                              : "bg-[#00365F]/8 text-[#00365F]",
                          )}
                        >
                          {e.type}
                        </span>
                      </td>
                      <td className="max-w-[220px] truncate py-2 pr-4 font-mono text-[#00365F]">
                        {e.path}
                      </td>
                      <td className="py-2 pr-4 text-[#666666]">{e.device}</td>
                      <td className="py-2 pr-4 font-mono text-[10px] text-[#999]">
                        {e.session_id?.slice(0, 8)}
                      </td>
                      <td className="max-w-[320px] truncate py-2 font-mono text-[10px] text-[#666666]">
                        {JSON.stringify(e.meta)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty />
          )}
        </Panel>
      </div>
    </div>
  );
}

const STATUSES = ["new", "contacted", "quoted", "booked", "closed"] as const;

function LeadsPanel({
  leads, byStatus, bySource,
}: {
  leads: Dashboard["leads"];
  byStatus: Dashboard["leadsByStatus"];
  bySource: Dashboard["leadsBySource"];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<number | null>(null);

  const setStatus = async (id: number, status: string) => {
    setBusy(id);
    await saveLead({ data: { id, status } });
    setBusy(null);
    router.invalidate();
  };

  return (
    <Panel title="Leads — subscribers and enquiries" icon={Mail} className="mt-6">
      {leads.length ? (
        <>
          <div className="mb-5 flex flex-wrap gap-2">
            {byStatus.map((s) => (
              <span
                key={s.status}
                className="rounded-full bg-[#00365F]/8 px-3 py-1 font-sans text-[11px] font-bold uppercase tracking-wide text-[#00365F]"
              >
                {s.status} {s.count}
              </span>
            ))}
            {bySource.map((s) => (
              <span
                key={s.source}
                className="rounded-full bg-[#CAA42D]/15 px-3 py-1 font-sans text-[11px] font-bold uppercase tracking-wide text-[#8F7420]"
              >
                {s.source} {s.count}
              </span>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-[#E5E5E5] text-left text-[#666666]">
                  <th className="py-2 pr-4 font-semibold">When</th>
                  <th className="py-2 pr-4 font-semibold">Email</th>
                  <th className="py-2 pr-4 font-semibold">Source</th>
                  <th className="py-2 pr-4 font-semibold">From page</th>
                  <th className="py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-b border-[#F1F1F1]">
                    <td className="whitespace-nowrap py-2 pr-4 text-[#666666]">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                    <td className="py-2 pr-4">
                      <a
                        href={`mailto:${l.email}`}
                        className="font-semibold text-[#00365F] underline underline-offset-2"
                      >
                        {l.email}
                      </a>
                    </td>
                    <td className="py-2 pr-4 text-[#666666]">{l.source}</td>
                    <td className="max-w-[200px] truncate py-2 pr-4 font-mono text-[#00365F]">
                      {l.path}
                    </td>
                    <td className="py-2">
                      <select
                        value={l.status}
                        disabled={busy === l.id}
                        onChange={(e) => setStatus(l.id, e.target.value)}
                        className="rounded-lg border border-[#E5E5E5] px-2 py-1 font-sans text-xs text-[#00365F] outline-none focus:border-[#CAA42D] disabled:opacity-50"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <Empty />
      )}
    </Panel>
  );
}

function Stat({
  icon: Icon, label, value, accent = false,
}: {
  icon: typeof Activity; label: string; value: number; accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border p-6",
        accent ? "border-[#CAA42D] bg-[#CAA42D]/8" : "border-[#E5E5E5] bg-white",
      )}
    >
      <Icon className={cn("size-5", accent ? "text-[#CAA42D]" : "text-[#00365F]/40")} />
      <p className="mt-3 font-display text-3xl font-bold text-[#00365F]">
        {value.toLocaleString()}
      </p>
      <p className="mt-1 font-sans text-[11px] font-semibold uppercase tracking-wider text-[#666666]">
        {label}
      </p>
    </div>
  );
}

function Panel({
  title, icon: Icon, children, className,
}: {
  title: string; icon: typeof Activity; children: React.ReactNode; className?: string;
}) {
  return (
    <section className={cn("rounded-3xl border border-[#E5E5E5] bg-white p-6", className)}>
      <h2 className="flex items-center gap-2 font-display text-lg text-[#00365F]">
        <Icon className="size-4 text-[#CAA42D]" />
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Horizontal bars scaled to the largest row, so proportions read at a glance. */
function Bars({ rows }: { rows: { label: string; count: number }[] }) {
  if (!rows.length) return <Empty />;
  const max = Math.max(...rows.map((r) => r.count));
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate font-mono text-xs text-[#00365F]">{r.label}</span>
            <span className="shrink-0 font-sans text-xs font-bold text-[#666666]">{r.count}</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#F1F1F1]">
            <div
              className="h-full rounded-full bg-[#CAA42D]"
              style={{ width: `${Math.max(2, (r.count / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Empty() {
  return (
    <p className="py-6 text-center font-sans text-xs text-[#666666]">
      Nothing recorded yet. Events appear here as visitors use the site.
    </p>
  );
}
