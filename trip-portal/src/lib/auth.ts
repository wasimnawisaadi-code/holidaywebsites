/**
 * Admin authentication for the trip portal. Server-only.
 *
 * A near-copy of the marketing site's admin auth rather than a shared module,
 * and that is a deliberate choice worth defending: the two applications deploy
 * separately, and a shared auth file means a change made for the website's
 * admin panel silently alters who can read travelling customers' passports and
 * hotel vouchers. The duplication is about forty lines. The coupling would be a
 * standing hazard.
 *
 * Two ways in, in this order:
 *
 *   1. Supabase Auth — email and password against the project's user table.
 *   2. ADMIN_PASSWORD — a shared secret, for local development or a deployment
 *      with no Supabase Auth users yet.
 *
 * The part that matters, inherited from the website's hard-won version: this
 * Supabase project has public signup enabled, so "holds a valid Supabase
 * session" does not mean "is staff". Anyone can register. Access is therefore
 * gated on an explicit email allowlist *as well as* a valid token, and the
 * token is re-verified against Supabase on every request rather than trusted
 * from the cookie.
 */

if (typeof window !== "undefined") {
  throw new Error("auth.ts is server-only — it must not reach the browser.");
}

const env = (k: string): string | undefined =>
  typeof process !== "undefined" ? process.env[k] : undefined;

export const SESSION_COOKIE = "ns-trip-admin";
/** Twelve hours. An office shift, not a fortnight. */
export const SESSION_TTL_SECONDS = 12 * 60 * 60;

function supabase() {
  const url = env("SUPABASE_URL") ?? env("VITE_SUPABASE_URL");
  const anon = env("SUPABASE_ANON_KEY") ?? env("VITE_SUPABASE_ANON_KEY");
  return url && anon ? { url, anon } : null;
}

/**
 * Who may open the admin.
 *
 * Defaults to the two addresses that exist rather than an empty list, because
 * an empty allowlist locks everyone out of a system the office needs at 6am to
 * tell a customer where their driver is. TRIP_ADMIN_EMAILS overrides.
 */
function allowlist(): string[] {
  const configured = env("TRIP_ADMIN_EMAILS") ?? env("ADMIN_EMAILS");
  const list = configured
    ? configured.split(",")
    : ["nawisaadiholidays@gmail.com", "wasimnawisaadi@gmail.com"];
  return list.map((e) => e.trim().toLowerCase()).filter(Boolean);
}

export function isAllowed(email: string | null | undefined): boolean {
  if (!email) return false;
  return allowlist().includes(email.trim().toLowerCase());
}

export type Session = { email: string; via: "supabase" | "password" };

export async function signIn(
  email: string,
  password: string,
): Promise<{ ok: true; token: string; email: string } | { ok: false; reason: string }> {
  const trimmed = email.trim();

  // The shared-password path. Checked first so a deployment with no Supabase
  // Auth user can still get in, and gated on the address being on the allowlist
  // so it is not a bare password with no username.
  const shared = env("ADMIN_PASSWORD");
  if (shared && password === shared && isAllowed(trimmed)) {
    const token = await issueSharedToken(SESSION_TTL_SECONDS);
    if (token) return { ok: true, token, email: trimmed };
  }

  const s = supabase();
  if (!s) return { ok: false, reason: "Supabase is not configured on this deployment." };

  // Refuse before contacting Supabase. Telling an unlisted address that its
  // password was correct would confirm the account exists.
  if (!isAllowed(trimmed)) {
    return { ok: false, reason: "That address is not permitted to open this admin." };
  }

  const res = await fetch(`${s.url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: s.anon, "Content-Type": "application/json" },
    body: JSON.stringify({ email: trimmed, password }),
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
  return { ok: true, token: data.access_token, email: data.user?.email ?? trimmed };
}

/** Verifies a cookie value and re-checks the allowlist. Null means no session. */
export async function sessionFromToken(token: string | undefined): Promise<Session | null> {
  if (!token) return null;

  if (await verifySharedToken(token)) {
    return { email: "shared-password", via: "password" };
  }

  const s = supabase();
  if (!s) return null;

  const res = await fetch(`${s.url}/auth/v1/user`, {
    headers: { apikey: s.anon, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;

  const user = (await res.json()) as { email?: string };
  // Re-checked every request, so removing someone from the allowlist revokes
  // them on their next page load rather than when a token happens to expire.
  if (!isAllowed(user.email)) return null;

  return { email: user.email ?? "unknown", via: "supabase" };
}

/* -------------------------------------------------------------------------
 * Shared-password session tokens
 *
 * The cookie holds a signed, expiring assertion rather than the password:
 *
 *     v1.<expiry-epoch-seconds>.<hex hmac-sha256 of "v1.<expiry>">
 *
 * The signing key is ADMIN_PASSWORD, so no new environment variable is needed
 * and changing the password invalidates every outstanding session. The token
 * cannot be turned back into the password and stops working on its own, even if
 * the cookie is copied elsewhere.
 *
 * Web Crypto rather than node:crypto, so this behaves identically on the Node
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

async function issueSharedToken(ttlSeconds: number): Promise<string | null> {
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
 * An in-process counter. Worth being honest about what that buys on a
 * serverless platform: each warm instance keeps its own map, so an attacker
 * spraying across many cold starts gets more attempts than the numbers suggest.
 * What it reliably stops is the realistic case — a sustained run of guesses,
 * which lands on one warm instance and is locked out within seconds. Durable
 * throttling would mean a database write per attempt, which is not a trade
 * worth making for an office admin behind a long random password.
 * ---------------------------------------------------------------------- */

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;

type Attempt = { count: number; first: number; lockedUntil: number };
const attempts = new Map<string, Attempt>();

function prune(now: number): void {
  if (attempts.size < 1000) return;
  for (const [key, a] of attempts) {
    if (a.lockedUntil < now && now - a.first > WINDOW_MS) attempts.delete(key);
  }
}

/** How long the caller must wait, in ms. Zero means go ahead. */
export function throttleRetryAfterMs(key: string): number {
  const a = attempts.get(key);
  if (!a) return 0;
  const now = Date.now();
  return a.lockedUntil > now ? a.lockedUntil - now : 0;
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
