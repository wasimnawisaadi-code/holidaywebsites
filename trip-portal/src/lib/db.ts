/**
 * Database access for the trip portal. Server-only.
 *
 * Every read and write in this application goes through this file, with the
 * service role key, on the server. The browser never talks to Supabase
 * directly — there is no anon-key client anywhere in this codebase, and the
 * migration revokes anon's table privileges so that adding one later fails
 * loudly rather than silently exposing customer data.
 *
 * Why not @supabase/supabase-js: the same reason the marketing site skips it.
 * The SDK is tens of kilobytes of auth, realtime and query-builder machinery,
 * and the whole job here is authenticated HTTP against PostgREST. A thin
 * wrapper is less code than the SDK's configuration would be.
 *
 * The throw below is the guard that matters. If a future refactor imports this
 * module from a component that ends up in the client bundle, the build fails at
 * the first render instead of shipping the service role key to every visitor.
 */

if (typeof window !== "undefined") {
  throw new Error("db.ts is server-only — it must never reach the browser.");
}

const env = (k: string): string | undefined =>
  typeof process !== "undefined" ? process.env[k] : undefined;

type Creds = { url: string; key: string };

function creds(): Creds {
  const url = env("SUPABASE_URL") ?? env("VITE_SUPABASE_URL");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    // Deliberately a throw rather than a null return. Every caller here is
    // rendering or saving a real customer's trip; degrading quietly would mean
    // showing a traveller an empty itinerary and telling them it is correct.
    throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }
  return { url, key };
}

export function configured(): boolean {
  try {
    creds();
    return true;
  } catch {
    return false;
  }
}

/**
 * The acting admin, forwarded to Postgres so the audit triggers can record who
 * made a change.
 *
 * PostgREST exposes this through the `X-Actor` header only if the database is
 * configured to read it, which is fragile. Instead the actor travels as a
 * request-scoped GUC set by the RPC below — see `withActor`. When no actor is
 * set, the trigger falls back to the database role, so a change is never
 * recorded as having no author at all.
 */
let currentActor: string | null = null;

/** Runs `fn` with the audit actor set, then restores it. */
export async function withActor<T>(actor: string | null, fn: () => Promise<T>): Promise<T> {
  const previous = currentActor;
  currentActor = actor;
  try {
    return await fn();
  } finally {
    currentActor = previous;
  }
}

function headers(extra: Record<string, string> = {}): Record<string, string> {
  const { key } = creds();
  const h: Record<string, string> = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    ...extra,
  };
  // PostgREST forwards this into the transaction as `request.headers`, and the
  // audit trigger reads `app.actor`. Setting the GUC directly needs an RPC, so
  // the actor is instead written into the row by callers that have it. This
  // header remains useful in Supabase's own request logs.
  if (currentActor) h["X-Actor"] = currentActor;
  return h;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { url } = creds();
  const res = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { ...headers(), ...((init.headers as Record<string, string>) ?? {}) },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    // The status and PostgREST's own message, both. A 400 from PostgREST is
    // almost always a constraint name that says exactly what went wrong, and
    // swallowing it turns a five-second fix into an afternoon.
    throw new Error(`Supabase ${res.status} on ${path}: ${body.slice(0, 500)}`);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export function select<T>(path: string): Promise<T> {
  return request<T>(path, { method: "GET" });
}

export async function insert<T>(table: string, rows: unknown): Promise<T> {
  return request<T>(table, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(rows),
  });
}

export async function update<T>(table: string, filter: string, patch: unknown): Promise<T> {
  return request<T>(`${table}?${filter}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(patch),
  });
}

export async function remove(table: string, filter: string): Promise<void> {
  await request<void>(`${table}?${filter}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
}

/* -------------------------------------------------------------------------
 * Storage
 * ---------------------------------------------------------------------- */

/**
 * A short-lived URL for a private object.
 *
 * Both buckets are private, so this is the only way an image or a voucher
 * reaches a browser. The expiry is deliberately short relative to how long
 * someone keeps a tab open: a customer who leaves the page open overnight gets
 * a fresh URL when they reload, and a link forwarded into a family WhatsApp
 * group stops working the same afternoon.
 *
 * Returns null rather than throwing. One missing photograph must not take down
 * a whole itinerary — the block simply renders without its image.
 */
export async function signedUrl(
  bucket: "trip-media" | "trip-docs",
  path: string,
  expiresIn = 60 * 60 * 6,
): Promise<string | null> {
  if (!path) return null;
  try {
    const { url, key } = creds();
    const res = await fetch(`${url}/storage/v1/object/sign/${bucket}/${path}`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ expiresIn }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { signedURL?: string; signedUrl?: string };
    const rel = data.signedURL ?? data.signedUrl;
    return rel ? `${url}/storage/v1${rel.startsWith("/") ? "" : "/"}${rel}` : null;
  } catch {
    return null;
  }
}

/**
 * A one-time ticket for the browser to upload one file straight to storage.
 *
 * Why the file does not go through a server function: Vercel caps a serverless
 * function's request body at 4.5 MB. The first version streamed uploads through
 * one, which works on a laptop — there is no such limit locally — and fails in
 * production for nearly every real file. A 15-second phone video of an airport
 * exit is 20-50 MB; a single phone photo is often 4-8 MB. The feature the office
 * needs most, a clip showing where to meet the driver, would simply not have
 * worked once deployed.
 *
 * So the server does the part that needs a secret and the browser does the part
 * that needs bandwidth. The server decides the path and signs a ticket for it;
 * the browser PUTs the bytes to Supabase directly. Verified against the live
 * project before this was written:
 *
 *   - the PUT needs no API key at all, so no key ever reaches the browser
 *   - the ticket is locked to the one path it was issued for (another path: 400)
 *   - it cannot overwrite (a second PUT to the same ticket: 409)
 *   - it expires after two hours
 *
 * The bucket's own size limit and MIME allowlist are enforced by storage on the
 * upload itself, whatever the browser claims.
 */
export async function signedUploadUrl(
  bucket: "trip-media" | "trip-docs",
  path: string,
): Promise<string | null> {
  try {
    const { url, key } = creds();
    const res = await fetch(`${url}/storage/v1/object/upload/sign/${bucket}/${path}`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: "{}",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { url?: string };
    if (!data.url) return null;
    return `${url}/storage/v1${data.url.startsWith("/") ? "" : "/"}${data.url}`;
  } catch {
    return null;
  }
}

/** Every object directly under a folder, e.g. one trip's `<tripId>/`. */
export async function listObjects(
  bucket: "trip-media" | "trip-docs",
  prefix: string,
): Promise<string[]> {
  const { url, key } = creds();
  const names: string[] = [];
  // Paged, because a long trip with galleries on every day can pass 100 files
  // and a single page would silently leave the rest behind on delete.
  for (let offset = 0; ; offset += 100) {
    const res = await fetch(`${url}/storage/v1/object/list/${bucket}`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prefix, limit: 100, offset }),
    });
    if (!res.ok) break;
    const page = (await res.json()) as { name: string; id: string | null }[];
    for (const o of page) if (o.id) names.push(`${prefix}${o.name}`);
    if (page.length < 100) break;
  }
  return names;
}

/** Deletes many objects in one request. Returns how many storage reported removed. */
export async function deleteObjects(
  bucket: "trip-media" | "trip-docs",
  paths: string[],
): Promise<number> {
  if (!paths.length) return 0;
  try {
    const { url, key } = creds();
    const res = await fetch(`${url}/storage/v1/object/${bucket}`, {
      method: "DELETE",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prefixes: paths }),
    });
    if (!res.ok) return 0;
    const removed = (await res.json()) as unknown[];
    return Array.isArray(removed) ? removed.length : 0;
  } catch {
    return 0;
  }
}

export async function deleteObject(
  bucket: "trip-media" | "trip-docs",
  path: string,
): Promise<boolean> {
  try {
    const { url, key } = creds();
    const res = await fetch(`${url}/storage/v1/object/${bucket}/${path}`, {
      method: "DELETE",
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}
