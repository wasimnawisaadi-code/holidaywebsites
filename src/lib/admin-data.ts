/**
 * Server-only Supabase reads for the admin dashboard.
 *
 * Everything here runs inside the SSR handler and uses the service role key,
 * which bypasses Row Level Security. That key must never be imported into a
 * component that renders on the client — importing this module from browser
 * code would leak full database access to every visitor.
 *
 * The guard below is a real check rather than a comment: if this ever gets
 * pulled into a client bundle it throws at import time, loudly, instead of
 * shipping the key.
 */

if (typeof window !== "undefined") {
  throw new Error(
    "admin-data.ts is server-only — it holds the Supabase service role key. " +
      "Import it from a route loader or server handler, never from a component.",
  );
}

const env = (key: string): string | undefined =>
  typeof process !== "undefined" ? process.env[key] : undefined;

function config() {
  const url = env("SUPABASE_URL") ?? env("VITE_SUPABASE_URL");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  return url && key ? { url, key } : null;
}

export function adminConfigured(): boolean {
  return config() !== null;
}

/** Is the supplied password the configured admin password? */
export function checkPassword(supplied: string): boolean {
  const expected = env("ADMIN_PASSWORD");
  if (!expected) return false;
  // Length-independent comparison. Not a full constant-time compare, but it
  // avoids the trivial early-exit that leaks the password prefix.
  if (supplied.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= supplied.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

async function rest<T>(pathAndQuery: string): Promise<T[]> {
  try {
    const c = config();
    if (!c || !c.url || !c.key) return [];
    const res = await fetch(`${c.url}/rest/v1/${pathAndQuery}`, {
      headers: {
        apikey: c.key,
        Authorization: `Bearer ${c.key}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) return [];
    return (await res.json().catch(() => [])) as T[];
  } catch (err) {
    console.error("Supabase REST error:", err);
    return [];
  }
}

/**
 * Anything PostgREST can return inside a jsonb column.
 *
 * `Record<string, unknown>` is what these were, and Start's server-function
 * boundary rejected it: it cannot prove `unknown` survives serialisation. It
 * is JSON coming out of Postgres, so saying so is both accurate and enough.
 */
export type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export type EventRow = {
  id: number;
  created_at: string;
  type: string;
  path: string | null;
  referrer: string | null;
  session_id: string | null;
  device: string | null;
  user_agent: string | null;
  meta: Record<string, JsonValue>;
};

export type Lead = {
  id: number;
  created_at: string;
  email: string;
  name: string | null;
  phone: string | null;
  source: string;
  path: string | null;
  status: string;
  notes: string | null;
  detail: Record<string, JsonValue>;
  session_id: string | null;
};

export type Dashboard = {
  configured: boolean;
  totals: { events: number; sessions: number; whatsapp: number; pageViews: number };
  recent: EventRow[];
  byType: { type: string; count: number }[];
  topPaths: { path: string; count: number }[];
  whatsappContexts: { context: string; count: number; intent: string }[];
  byDevice: { device: string; count: number }[];
  byReferrer: { referrer: string; count: number }[];
  byDay: { day: string; count: number }[];
  leads: Lead[];
  leadsByStatus: { status: string; count: number }[];
  leadsBySource: { source: string; count: number }[];
};

const tally = <T extends string>(rows: { k: T }[]) => {
  const m = new Map<T, number>();
  for (const r of rows) m.set(r.k, (m.get(r.k) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};

export async function loadDashboard(): Promise<Dashboard> {
  const empty: Dashboard = {
    configured: false,
    totals: { events: 0, sessions: 0, whatsapp: 0, pageViews: 0 },
    recent: [],
    byType: [],
    topPaths: [],
    whatsappContexts: [],
    byDevice: [],
    byReferrer: [],
    byDay: [],
    leads: [],
    leadsByStatus: [],
    leadsBySource: [],
  };
  if (!adminConfigured()) return empty;

  // One wide read rather than a query per panel: at this volume it is a single
  // round trip, and every panel below is a grouping of the same rows.
  const [rows, leads] = await Promise.all([
    rest<EventRow>("events?select=*&order=created_at.desc&limit=5000"),
    rest<Lead>("leads?select=*&order=created_at.desc&limit=500"),
  ]);

  const sessions = new Set(rows.map((r) => r.session_id).filter(Boolean));
  const whatsapp = rows.filter((r) => r.type === "whatsapp_click");

  return {
    configured: true,
    totals: {
      events: rows.length,
      sessions: sessions.size,
      whatsapp: whatsapp.length,
      pageViews: rows.filter((r) => r.type === "page_view").length,
    },
    recent: rows.slice(0, 150),
    byType: tally(rows.map((r) => ({ k: r.type }))).map(([type, count]) => ({ type, count })),
    topPaths: tally(rows.filter((r) => r.type === "page_view").map((r) => ({ k: r.path ?? "—" })))
      .slice(0, 15)
      .map(([path, count]) => ({ path, count })),
    whatsappContexts: tally(
      whatsapp.map((r) => ({ k: String(r.meta?.["context"] ?? r.path ?? "—") })),
    )
      .slice(0, 15)
      .map(([context, count]) => ({
        context,
        count,
        // The prefilled message names the package, which is the useful part.
        intent: String(
          whatsapp.find((w) => (w.meta?.["context"] ?? w.path) === context)?.meta?.["intent"] ?? "",
        ).slice(0, 90),
      })),
    byDevice: tally(rows.map((r) => ({ k: r.device ?? "—" }))).map(([device, count]) => ({
      device,
      count,
    })),
    byReferrer: tally(rows.map((r) => ({ k: r.referrer ?? "direct" })))
      .slice(0, 10)
      .map(([referrer, count]) => ({ referrer, count })),
    byDay: tally(rows.map((r) => ({ k: r.created_at.slice(0, 10) })))
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .slice(0, 14)
      .map(([day, count]) => ({ day, count })),
    leads,
    leadsByStatus: tally(leads.map((l) => ({ k: l.status }))).map(([status, count]) => ({
      status,
      count,
    })),
    leadsBySource: tally(leads.map((l) => ({ k: l.source }))).map(([source, count]) => ({
      source,
      count,
    })),
  };
}

/**
 * Moves a lead through the pipeline. Uses the service role key, so this is only
 * ever reachable from the authenticated /admin server function.
 */
/**
 * Permanently removes a lead.
 *
 * Deliberately narrow: it takes an id and an email, and deletes only when both
 * match the same row. The admin UI already knows the address it is showing, so
 * requiring it costs nothing there, while an id transposed by one — the way a
 * bulk script or a mis-click goes wrong — matches nothing and deletes nothing.
 *
 * This uses the service role key and bypasses Row Level Security, so it is
 * only ever reachable from the authenticated /admin server function.
 */
export async function deleteLead(id: number, email: string): Promise<boolean> {
  const c = config();
  if (!c) return false;
  const q = `id=eq.${encodeURIComponent(String(id))}&email=eq.${encodeURIComponent(email)}`;
  const res = await fetch(`${c.url}/rest/v1/leads?${q}`, {
    method: "DELETE",
    headers: {
      apikey: c.key,
      Authorization: `Bearer ${c.key}`,
      Prefer: "return=representation",
    },
  });
  if (!res.ok) return false;
  // return=representation lets us confirm a row actually matched, rather than
  // reporting success for a DELETE that touched nothing.
  const rows = (await res.json().catch(() => [])) as unknown[];
  return Array.isArray(rows) && rows.length > 0;
}

export async function updateLead(
  id: number,
  patch: { status?: string; notes?: string },
): Promise<boolean> {
  const c = config();
  if (!c) return false;
  const res = await fetch(`${c.url}/rest/v1/leads?id=eq.${encodeURIComponent(String(id))}`, {
    method: "PATCH",
    headers: {
      apikey: c.key,
      Authorization: `Bearer ${c.key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(patch),
  });
  return res.ok;
}
