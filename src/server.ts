import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

/**
 * Lets Vercel's CDN answer repeat visitors instead of running SSR every time.
 *
 * Every HTML response was going out as `max-age=0, must-revalidate` with
 * `X-Vercel-Cache: MISS` on every single request. That means one serverless
 * invocation per page view, no exceptions — a thousand people arriving from an
 * ad is a thousand cold renders of a catalogue that is identical for all of
 * them, and a measured 380ms TTFB because the function runs in Washington
 * while the audience is in the Gulf.
 *
 * The pages are safe to cache: three fetches of /holidays returned byte-
 * identical HTML apart from one hydration timestamp. Nothing here is
 * personalised, and there are no cookies on public routes.
 *
 *   max-age=0                    the browser still revalidates, so a visitor
 *                                never sees yesterday's page
 *   s-maxage=600                 the CDN answers for ten minutes without
 *                                waking a function
 *   stale-while-revalidate=86400 under a traffic spike the CDN serves the
 *                                slightly-stale copy instantly and refreshes
 *                                behind it, so a burst never queues on SSR
 *
 * Deploying invalidates the cache, so content is never stale across a release.
 *
 * Excluded: /admin (sensitive, and already no-store in vercel.json) and server
 * functions, which are per-caller by definition.
 */
const PUBLIC_HTML_CACHE = "public, max-age=0, s-maxage=600, stale-while-revalidate=86400";

function withEdgeCache(request: Request, response: Response): Response {
  if (request.method !== "GET" || response.status !== 200) return response;
  if (!(response.headers.get("content-type") ?? "").includes("text/html")) return response;
  // Anything that already declared its own policy — an admin route, a redirect,
  // a route that opted out deliberately — keeps it.
  const existing = response.headers.get("cache-control") ?? "";
  if (existing.includes("no-store") || existing.includes("private")) return response;

  const path = new URL(request.url).pathname;
  if (path === "/admin" || path.startsWith("/admin/") || path.startsWith("/_serverFn")) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set("cache-control", PUBLIC_HTML_CACHE);
  // The body is a stream during SSR; passing it straight through preserves
  // streaming rather than buffering the whole document first.
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return withEdgeCache(request, await normalizeCatastrophicSsrResponse(response));
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
