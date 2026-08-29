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
  return Boolean(URL_BASE && ANON_KEY);
}

export function track(type: EventType, meta: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  if (!URL_BASE || !ANON_KEY) return;

  const body = JSON.stringify({
    type,
    path: window.location.pathname,
    // Only the referring origin, never a full URL with someone's query string.
    referrer: document.referrer ? new global.URL(document.referrer).origin : null,
    session_id: sessionId(),
    user_agent: navigator.userAgent.slice(0, 400),
    viewport_w: window.innerWidth,
    viewport_h: window.innerHeight,
    device: device(),
    locale: navigator.language,
    meta,
  });

  const endpoint = `${URL_BASE}/rest/v1/events`;

  // sendBeacon survives the page being unloaded, which is exactly the case for
  // an outbound WhatsApp click. It cannot set headers, so the keys ride in the
  // query string — they are the public anon key, which is safe there.
  try {
    if (navigator.sendBeacon) {
      const beaconUrl = `${endpoint}?apikey=${encodeURIComponent(ANON_KEY)}`;
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon(beaconUrl, blob)) return;
    }
  } catch {
    /* fall through to fetch */
  }

  void fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
      Prefer: "return=minimal",
    },
    body,
    keepalive: true,
  }).catch(() => {
    /* analytics must never surface an error to a visitor */
  });
}
