/**
 * Admin authentication, server-side only.
 *
 * Two ways in, checked in this order:
 *
 *   1. Supabase Auth — email and password, against the project's own user
 *      table. This is the real path.
 *   2. A shared password in ADMIN_PASSWORD — the fallback for local
 *      development, or a deployment with no Supabase configured.
 *
 * The part that matters: this project has public signup enabled
 * (`disable_signup: false`), so "has a valid Supabase session" does not mean
 * "is an administrator" — anyone can register an account. Access is therefore
 * gated on an explicit email allowlist as well as a valid token. A signed-in
 * user whose address is not on the list is refused, and told so plainly.
 *
 * Tokens are verified against Supabase on every request rather than trusted
 * from the cookie. A cookie can be forged; a token that Supabase itself
 * rejects cannot. This costs one call per admin page load, which is nothing at
 * this traffic and removes a whole class of mistake.
 */

if (typeof window !== "undefined") {
  throw new Error("admin-auth.ts is server-only — it must not reach the browser.");
}

const env = (k: string): string | undefined =>
  typeof process !== "undefined" ? process.env[k] : undefined;

function supabase() {
  const url = env("SUPABASE_URL") ?? env("VITE_SUPABASE_URL");
  const anon = env("SUPABASE_ANON_KEY") ?? env("VITE_SUPABASE_ANON_KEY");
  return url && anon ? { url, anon } : null;
}

export function supabaseAuthAvailable(): boolean {
  return supabase() !== null;
}

/**
 * Addresses permitted to open /admin.
 *
 * Defaults to the agency address so the allowlist is never accidentally empty,
 * which would lock everyone out. Set ADMIN_EMAILS (comma-separated) to add
 * staff without a code change.
 */
function allowlist(): string[] {
  const configured = env("ADMIN_EMAILS");
  const list = configured
    ? configured.split(",")
    : [
        // The Supabase Auth account that actually exists. Note the plural,
        // matching the domain — the singular spelling was a typo and would
        // have locked the owner out of their own panel.
        "nawisaadiholidays@gmail.com",
        "wasimnawisaadi@gmail.com",
      ];
  return list.map((e) => e.trim().toLowerCase()).filter(Boolean);
}

export function isAllowed(email: string | null | undefined): boolean {
  if (!email) return false;
  return allowlist().includes(email.trim().toLowerCase());
}

export type Session = { email: string; via: "supabase" | "password" };

/** Exchanges email and password for an access token. */
export async function signInWithPassword(
  email: string,
  password: string,
): Promise<{ ok: true; token: string; email: string } | { ok: false; reason: string }> {
  const s = supabase();
  if (!s) return { ok: false, reason: "Supabase is not configured on this deployment." };

  // Refuse before contacting Supabase. Telling an unlisted address that its
  // password was correct would confirm the account exists.
  if (!isAllowed(email)) {
    return { ok: false, reason: "That address is not permitted to access the admin panel." };
  }

  const res = await fetch(`${s.url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: s.anon, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { msg?: string; error_description?: string };
    return {
      ok: false,
      reason: body.msg ?? body.error_description ?? "Email or password is not correct.",
    };
  }

  const data = (await res.json()) as { access_token?: string; user?: { email?: string } };
  if (!data.access_token) return { ok: false, reason: "Supabase did not return a session." };

  return { ok: true, token: data.access_token, email: data.user?.email ?? email };
}

/** Verifies a token with Supabase and re-checks the allowlist. */
export async function sessionFromToken(token: string | undefined): Promise<Session | null> {
  if (!token) return null;

  // The shared-password fallback stores the password itself, not a JWT.
  const shared = env("ADMIN_PASSWORD");
  if (shared && token === shared) return { email: "shared-password", via: "password" };

  const s = supabase();
  if (!s) return null;

  const res = await fetch(`${s.url}/auth/v1/user`, {
    headers: { apikey: s.anon, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;

  const user = (await res.json()) as { email?: string };
  // Re-checked on every request: removing someone from ADMIN_EMAILS revokes
  // them on their next page load, without waiting for a token to expire.
  if (!isAllowed(user.email)) return null;

  return { email: user.email ?? "unknown", via: "supabase" };
}
