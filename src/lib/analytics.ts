/**
 * Client-side event logging.
 *
 * Posts straight to Supabase's REST endpoint rather than pulling in
 * @supabase/supabase-js. The SDK is ~40KB for auth, realtime and query
 * building that this never uses; the whole job here is one authenticated POST.
 *
 * Safety properties worth stating plainly:
 *
 *   - Only the anon key is used, and it is public by design. Row Level Security
 *     on `events` allows INSERT and nothing else, so a visitor cannot read back
 *     what anyone did, including themselves.
 *   - The session id is a random per-browser value in sessionStorage. It is not
 *     an account, is never joined to a name or email, and dies with the tab.
 *   - Nothing is typed into a form is captured. Only that an event occurred,
 *     and which package or button it concerned.
 *
 * Analytics must never break the site: every call is fire-and-forget, wrapped,
 * and silently gives up if the request fails or the keys are unset.
 */

const URL_BASE = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const ANON_KEY = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined;

const SESSION_KEY = "ns-session-id";

/**
 * Stops sending after the endpoint has clearly failed.
 *
 * Before the migration has run, every event 404s. Without this, a single page
 * view fires a dozen doomed requests and fills the console with noise on a
 * deployment whose only fault is that the table does not exist yet. One
 * failure is enough to know; the flag resets on the next page load, so it
 * heals by itself once the table appears.
 */
let disabled = false;

export type EventType =
  | "page_view"
  | "whatsapp_click"
  | "phone_click"
  | "email_click"
  | "enquiry_search"
  | "offer_shown"
  | "offer_dismissed"
  | "offer_cta"
  | "package_view"
  | "country_view"
  | "activity_view"
  | "outbound_click"
  | "scroll_depth"
  | "cta_click";

function sessionId(): string {
  try {
    let id = window.sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    // Blocked storage: fall back to a per-page id rather than dropping the
    // event entirely. Session counts will over-report slightly; that is
    // preferable to losing the event.
    return "no-storage";
  }
}

function device(): string {
  const w = window.innerWidth;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

/** True once configured, so callers can skip work when tracking is off. */
export function analyticsEnabled(): boolean {
  return Boolean(URL_BASE && ANON_KEY) && !disabled;
}

/**
 * Referring origin only — never the full URL, which would carry the visitor's
 * search terms.
 *
 * This used to read `new global.URL(...)`. `global` is a Node identifier and
 * does not exist in a browser, so the expression threw ReferenceError for
 * every visitor who arrived with a referrer — which is to say everyone
 * clicking through from Google, Instagram or any other site. The throw
 * propagated out of AnalyticsTracker into the root error boundary, and those
 * visitors were shown "This page didn't load" instead of the site. Direct
 * visits were unaffected, which is why it survived testing.
 */
function referrerOrigin(): string | null {
  try {
    return document.referrer ? new URL(document.referrer).origin : null;
  } catch {
    // A malformed referrer is not worth a thrown exception either.
    return null;
  }
}

export function track(type: EventType, meta: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  if (!URL_BASE || !ANON_KEY || disabled) return;

  try {
    send(type, meta);
  } catch {
    // The contract at the top of this file is that analytics can never break
    // the site. It was only ever true of the network call; everything that ran
    // before it — reading the referrer, the viewport, the session id — could
    // throw straight into the render. Now it genuinely holds.
    disabled = true;
  }
}

function send(type: EventType, meta: Record<string, unknown>): void {
  // Re-narrowed here rather than relying on the caller's check: these are
  // module-level `string | undefined`, and TypeScript cannot carry a guard
  // across a function boundary.
  if (!URL_BASE || !ANON_KEY) return;
  const apiKey = ANON_KEY;

  const body = JSON.stringify({
    type,
    path: window.location.pathname,
    referrer: referrerOrigin(),
    session_id: sessionId(),
    user_agent: navigator.userAgent.slice(0, 400),
    viewport_w: window.innerWidth,
    viewport_h: window.innerHeight,
    device: device(),
    locale: navigator.language,
    meta,
  });

  const endpoint = `${URL_BASE}/rest/v1/events`;

  // fetch with keepalive rather than sendBeacon.
  //
  // sendBeacon cannot set headers, so the key had to ride in the query string
  // and the Authorization header was missing entirely. PostgREST rejected the
  // request, and because a Blob of type application/json is not a
  // CORS-safelisted content type the browser logged a CORS failure on every
  // single page load — noise a visitor should never see, and which no
  // try/catch can suppress because the browser logs it directly.
  //
  // keepalive gives the same survive-the-unload behaviour that sendBeacon was
  // there for, while still sending real headers.
  void fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      Prefer: "return=minimal",
    },
    body,
    keepalive: true,
    mode: "cors",
  })
    .then((res) => {
      // 404 means the table is missing, 401/403 means the key or policy is
      // wrong. None of those recover within a page load, so stop asking.
      if (res.status === 404 || res.status === 401 || res.status === 403) disabled = true;
    })
    .catch(() => {
      // Network-level failure — offline, blocked by an extension, CORS.
      // Equally not worth retrying for the rest of this page.
      disabled = true;
    });
}
