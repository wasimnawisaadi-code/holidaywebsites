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

export async function submitLead(payload: LeadPayload): Promise<{ ok: boolean; status?: number }> {
  if (!URL_BASE || !ANON_KEY) {
    return { ok: true };
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
    const referrer = typeof document !== "undefined" && document.referrer ? new URL(document.referrer).origin : null;

    const res = await fetch(`${URL_BASE}/rest/v1/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
        Prefer: "resolution=merge-duplicates,return=minimal",
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

    return { ok: false, status: res.status };
  } catch (err) {
    console.warn("Failed to record lead to database:", err);
    return { ok: false };
  }
}
