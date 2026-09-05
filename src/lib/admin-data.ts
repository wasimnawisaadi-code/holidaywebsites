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

/**
 * Newsletter sources, as written by SubscribeForm.
 *
 * A lead is either an enquiry or a subscription, and the two want different
 * screens: an enquiry is worked, a subscriber is mailed. They live in one table
 * separated only by this field.
 */
export const SUBSCRIBE_SOURCES = ["subscribe", "footer", "newsletter"] as const;

/** One WhatsApp click, flattened out of the event's meta for the office. */
export type WhatsAppClick = {
  id: number;
  created_at: string;
  path: string | null;
  session_id: string | null;
  device: string | null;
  referrer: string | null;
  /** The prefilled message the visitor was about to send. */
  intent: string;
  /** That message parsed into "Key: value" pairs at capture time. */
  fields: Record<string, string>;
  slug: string;
  pageType: string;
  label: string;
  /** "new_tab" when the link was middle-clicked. */
  openKind: string;
};

/** One visitor's session, summarised from their events. */
export type SessionSummary = {
  id: string;
  started: string;
  ended: string;
  device: string | null;
  referrer: string | null;
  events: number;
  /** Distinct pages, in the order first seen. */
  pages: string[];
  whatsapp: number;
  /** Minutes between the first and last event. */
  minutes: number;
};

/** One step in a session's journey, small enough to ship a few thousand of. */
export type JourneyStep = {
  t: string;
  type: string;
  path: string | null;
  label: string;
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

  /** Newsletter signups, separated from worked enquiries. */
  subscribers: Lead[];
  /**
   * Every WhatsApp click, not a sample.
   *
   * The log used to be rendered from `recent`, which is capped at 150 events,
   * while the tab counted all of them — so the badge said 247 and the list
   * showed nine. The office reasonably read that as most enquiries being lost.
   */
  whatsappLog: WhatsAppClick[];
  /** One row per visitor, newest first. */
  sessions: SessionSummary[];
  /** Full click path for the most recent sessions, keyed by session id. */
  journeys: Record<string, JourneyStep[]>;
  /**
   * What visitors did, as independent counts rather than funnel stages.
   *
   * They are deliberately not nested. A visitor can land straight on a package
   * page from an ad without ever seeing a second page, so "opened a package"
   * legitimately runs higher than "saw more than one page" — presented as a
   * funnel that reads as broken data. `enquiredAfterDetail` is the one genuinely
   * nested number, and it is the one worth acting on.
   */
  funnel: {
    visited: number;
    browsed: number;
    viewedDetail: number;
    enquired: number;
    /** Of those who opened a package or tour, how many then messaged. */
    enquiredAfterDetail: number;
  };
};

const tally = <T extends string>(rows: { k: T }[]) => {
  const m = new Map<T, number>();
  for (const r of rows) m.set(r.k, (m.get(r.k) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};

/** A meta field as a plain string, whatever PostgREST handed back. */
const metaStr = (meta: Record<string, JsonValue> | null, key: string): string => {
  const v = meta?.[key];
  return v === null || v === undefined ? "" : String(v);
};

/**
 * Flattens a whatsapp_click event into something the office can read.
 *
 * `fields` is written at capture time by parsing the prefilled message into
 * "Key: value" lines. Events captured before that existed have none, so the
 * raw `intent` is always kept as the fallback.
 */
function toWhatsAppClick(r: EventRow): WhatsAppClick {
  const rawFields = r.meta?.["fields"];
  const fields: Record<string, string> = {};
  if (rawFields && typeof rawFields === "object" && !Array.isArray(rawFields)) {
    for (const [k, v] of Object.entries(rawFields)) {
      // Rows captured before the tracker stripped it still carry the bullet
      // from the message line, so the key arrives as "- hotel tier".
      const key = k.replace(/^[\s•*\-–—]+/, "").trim();
      if (key && v !== null && v !== undefined && String(v)) fields[key] = String(v);
    }
  }
  return {
    id: r.id,
    created_at: r.created_at,
    path: r.path,
    session_id: r.session_id,
    device: r.device,
    referrer: r.referrer,
    intent: metaStr(r.meta, "intent"),
    fields,
    slug: metaStr(r.meta, "slug"),
    pageType: metaStr(r.meta, "page_type"),
    label: metaStr(r.meta, "label"),
    openKind: metaStr(r.meta, "open_kind"),
  };
}

/** A one-line description of an event, for a journey timeline. */
function stepLabel(r: EventRow): string {
  switch (r.type) {
    case "whatsapp_click":
      return metaStr(r.meta, "slug") || metaStr(r.meta, "label") || "WhatsApp";
    case "ui_click":
    case "cta_click":
      return metaStr(r.meta, "label");
    case "filter_change":
      return `${metaStr(r.meta, "control")}: ${metaStr(r.meta, "value")}`;
    case "scroll_depth":
      return `${metaStr(r.meta, "depth")}%`;
    case "package_view":
    case "country_view":
    case "activity_view":
      return metaStr(r.meta, "slug");
    case "page_view":
      return metaStr(r.meta, "phase") === "exit" ? `${metaStr(r.meta, "seconds")}s on page` : "";
    default:
      return "";
  }
}

/**
 * Groups events into sessions.
 *
 * Rows arrive newest first, so each session is reversed at the end to read
 * forwards, which is the only order a journey makes sense in.
 */
function buildSessions(rows: EventRow[]): {
  sessions: SessionSummary[];
  journeys: Record<string, JourneyStep[]>;
} {
  const byId = new Map<string, EventRow[]>();
  for (const r of rows) {
    if (!r.session_id) continue;
    const list = byId.get(r.session_id);
    if (list) list.push(r);
    else byId.set(r.session_id, [r]);
  }

  const sessions: SessionSummary[] = [];
  const journeys: Record<string, JourneyStep[]> = {};

  for (const [id, events] of byId) {
    const forwards = [...events].reverse();
    const first = forwards[0];
    const last = forwards[forwards.length - 1];
    if (!first || !last) continue;

    const pages: string[] = [];
    for (const e of forwards) {
      if (e.type !== "page_view" || !e.path) continue;
      if (!pages.includes(e.path)) pages.push(e.path);
    }

    const started = first.created_at;
    const ended = last.created_at;
    sessions.push({
      id,
      started,
      ended,
      device: first.device,
      // The referrer is only set on the first event of a visit; later ones
      // carry the same value, but taking the first is the honest one.
      referrer: forwards.find((e) => e.referrer)?.referrer ?? null,
      events: forwards.length,
      pages,
      whatsapp: forwards.filter((e) => e.type === "whatsapp_click").length,
      minutes: Math.max(
        0,
        Math.round((new Date(ended).getTime() - new Date(started).getTime()) / 60000),
      ),
    });
  }

  sessions.sort((a, b) => (a.ended < b.ended ? 1 : -1));

  // Journeys only for the sessions the screen can actually show. The full set
  // would be a few megabytes over the server-function boundary for rows nobody
  // has scrolled to.
  for (const s of sessions.slice(0, 80)) {
    const events = byId.get(s.id);
    if (!events) continue;
    journeys[s.id] = [...events].reverse().map((e) => ({
      t: e.created_at,
      type: e.type,
      path: e.path,
      label: stepLabel(e),
    }));
  }

  return { sessions, journeys };
}

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
    subscribers: [],
    whatsappLog: [],
    sessions: [],
    journeys: {},
    funnel: { visited: 0, browsed: 0, viewedDetail: 0, enquired: 0, enquiredAfterDetail: 0 },
  };
  if (!adminConfigured()) return empty;

  // One wide read rather than a query per panel: at this volume it is a single
  // round trip, and every panel below is a grouping of the same rows.
  const [rows, leads] = await Promise.all([
    rest<EventRow>("events?select=*&order=created_at.desc&limit=5000"),
    rest<Lead>("leads?select=*&order=created_at.desc&limit=500"),
  ]);

  const sessionIds = new Set(rows.map((r) => r.session_id).filter(Boolean));
  const whatsapp = rows.filter((r) => r.type === "whatsapp_click");
  const { sessions, journeys } = buildSessions(rows);

  return {
    configured: true,
    totals: {
      events: rows.length,
      sessions: sessionIds.size,
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
    subscribers: leads.filter((l) => (SUBSCRIBE_SOURCES as readonly string[]).includes(l.source)),
    // Every click, not the handful that happen to fall inside `recent`.
    whatsappLog: whatsapp.map(toWhatsAppClick),
    sessions,
    journeys,
    funnel: (() => {
      const isDetail = (p: string) => /^\/(holidays|activities|countries)\/[^/]+/.test(p);
      const detail = sessions.filter((s) => s.pages.some(isDetail));
      return {
        visited: sessions.length,
        browsed: sessions.filter((s) => s.pages.length > 1).length,
        viewedDetail: detail.length,
        enquired: sessions.filter((s) => s.whatsapp > 0).length,
        enquiredAfterDetail: detail.filter((s) => s.whatsapp > 0).length,
      };
    })(),
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
