import { track } from "./analytics";

export type LeadPayload = {
  email: string;
  name?: string | null;
  phone?: string | null;
  source: string;
  path?: string;
  detail?: Record<string, unknown>;
  notes?: string | null;
};

const URL_BASE = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const ANON_KEY = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined;

/**
 * Records an enquiry.
 *
 * `ok` is what the caller must branch on: a form that ignores it will tell a
 * customer their enquiry was received when nothing was written. That is exactly
 * how repeat enquiries used to disappear — the `leads` table carried a unique
 * index across every address, so a returning customer's second enquiry came
 * back 409 and the form showed a booking reference anyway.
 *
 * `duplicate` separates "this address is already on the newsletter list", which
 * is a success from the visitor's point of view, from a real failure.
 */
export type LeadResult = { ok: boolean; status?: number; duplicate?: boolean };

export async function submitLead(payload: LeadPayload): Promise<LeadResult> {
  if (!URL_BASE || !ANON_KEY) {
    // No backend configured (local dev, or a preview build). Report honestly
    // rather than claiming a write that never happened — the caller falls back
    // to WhatsApp, which is where the enquiry needs to end up regardless.
    return { ok: false, status: 0 };
  }

  try {
    let sessionId: string | null = null;
    try {
      if (typeof window !== "undefined") {
        sessionId = window.sessionStorage.getItem("ns-session-id");
      }
    } catch {
      /* storage blocked */
    }

    const path = payload.path ?? (typeof window !== "undefined" ? window.location.pathname : "/");
    const referrer =
      typeof document !== "undefined" && document.referrer
        ? new URL(document.referrer).origin
        : null;

    const res = await fetch(`${URL_BASE}/rest/v1/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        email: payload.email.trim().toLowerCase(),
        name: payload.name?.trim() || null,
        phone: payload.phone?.trim() || null,
        source: payload.source,
        path,
        referrer,
        detail: payload.detail || {},
        notes: payload.notes || null,
        session_id: sessionId,
      }),
    });

    if (res.ok) {
      track("cta_click", {
        action: payload.source,
        source: payload.source,
        has_phone: Boolean(payload.phone),
      });
      return { ok: true, status: res.status };
    }

    // 409 on a newsletter signup means the address is already subscribed,
    // which is what the visitor wanted. On an enquiry it means the row was
    // rejected and the enquiry is not recorded, so it is a failure the caller
    // must surface.
    if (res.status === 409) {
      const isSubscription = /^(subscribe|footer|newsletter)$/.test(payload.source);
      return { ok: isSubscription, status: 409, duplicate: true };
    }

    return { ok: false, status: res.status };
  } catch (err) {
    console.warn("Failed to record lead to database:", err);
    return { ok: false };
  }
}
