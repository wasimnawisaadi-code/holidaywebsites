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
    const body = (await res.json().catch(() => ({}))) as {
      msg?: string;
      error_description?: string;
    };
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

  // The shared-password fallback carries a signed, expiring token rather than
  // the password itself — see issueSharedToken below. A cookie minted by the
  // previous scheme (the raw password) no longer validates, which is intended:
  // it means one more sign-in, and the credential stops living in the browser.
  if (await verifySharedToken(token)) return { email: "shared-password", via: "password" };

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

/* -------------------------------------------------------------------------
 * Shared-password session tokens
 *
 * The cookie used to hold ADMIN_PASSWORD verbatim: `sessionFromToken` compared
 * the cookie value against the env var directly. That works, but it means the
 * long-lived credential itself is written to disk in the browser profile, sent
 * on every request, and sitting in any proxy or log that captures a Cookie
 * header. Anything that reads the cookie once has the password permanently.
 *
 * What is stored now is a signed, expiring assertion instead:
 *
 *     v1.<expiry-epoch-seconds>.<hex hmac-sha256 of "v1.<expiry>">
 *
 * The signing key is ADMIN_PASSWORD, so no new environment variable is needed
 * and rotating the password invalidates every outstanding session. The token
 * cannot be turned back into the password, and it stops working on its own
 * after the expiry — even if the cookie is copied elsewhere.
 *
 * Web Crypto rather than node:crypto, so this behaves the same on the Node
 * runtime and on an edge deployment.
 * ---------------------------------------------------------------------- */

const TOKEN_VERSION = "v1";

async function hmacHex(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Length-independent comparison, so a mismatch leaks no position information. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Mints a signed session token for the shared-password path. */
export async function issueSharedToken(ttlSeconds: number): Promise<string | null> {
  const secret = env("ADMIN_PASSWORD");
  if (!secret) return null;
  const expiry = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${TOKEN_VERSION}.${expiry}`;
  return `${payload}.${await hmacHex(secret, payload)}`;
}

async function verifySharedToken(token: string): Promise<boolean> {
  const secret = env("ADMIN_PASSWORD");
  if (!secret) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [version, expiryRaw, signature] = parts as [string, string, string];
  if (version !== TOKEN_VERSION) return false;

  const expiry = Number(expiryRaw);
  if (!Number.isFinite(expiry) || expiry * 1000 < Date.now()) return false;

  return timingSafeEqual(signature, await hmacHex(secret, `${version}.${expiryRaw}`));
}

/* -------------------------------------------------------------------------
 * Sign-in throttling
 *
 * There was no limit at all: /admin's sign-in server function would check any
 * number of passwords as fast as they could be posted, which is the whole
 * attack against a single shared secret.
 *
 * This is an in-process counter, and it is worth being clear about what that
 * does and does not buy on a serverless platform. Each warm instance keeps its
 * own map, so an attacker spraying across many cold starts gets more attempts
 * than the numbers below suggest. What it reliably stops is the realistic
 * case — a sustained run of guesses, which lands on one warm instance and is
 * locked out within seconds. Durable throttling would mean a database write per
 * attempt; for an agency admin panel behind a long random password, that is not
 * a trade worth making.
 * ---------------------------------------------------------------------- */

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;

type Attempt = { count: number; first: number; lockedUntil: number };
const attempts = new Map<string, Attempt>();

function prune(now: number): void {
  // Bounded so a spray across many spoofed keys cannot grow the map forever.
  if (attempts.size < 1000) return;
  for (const [key, a] of attempts) {
    if (a.lockedUntil < now && now - a.first > WINDOW_MS) attempts.delete(key);
  }
}

/** How long the caller must wait, in ms. Zero means "go ahead". */
export function throttleRetryAfterMs(key: string): number {
  const now = Date.now();
  const a = attempts.get(key);
  if (!a) return 0;
  if (a.lockedUntil > now) return a.lockedUntil - now;
  return 0;
}

export function recordFailedSignIn(key: string): void {
  const now = Date.now();
  prune(now);
  const a = attempts.get(key);
  if (!a || now - a.first > WINDOW_MS) {
    attempts.set(key, { count: 1, first: now, lockedUntil: 0 });
    return;
  }
  a.count += 1;
  if (a.count >= MAX_ATTEMPTS) a.lockedUntil = now + LOCKOUT_MS;
}

export function clearFailedSignIns(key: string): void {
  attempts.delete(key);
}
