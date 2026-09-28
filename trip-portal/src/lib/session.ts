/**
 * The staff-session check every admin server function starts with.
 *
 * Server modules are imported inside the function, not at the top of the file.
 * This module is imported by route files that also ship to the browser, and the
 * only callers are server-function handlers, which TanStack strips from the
 * client build — so the dynamic imports below go with them and auth.ts never
 * becomes a client chunk. A top-level import would defeat that.
 */
export async function requireSession(): Promise<{ email: string }> {
  const { getCookie } = await import("@tanstack/react-start/server");
  const { sessionFromToken, SESSION_COOKIE } = await import("./auth");
  const session = await sessionFromToken(getCookie(SESSION_COOKIE));
  if (!session) throw new Error("Not signed in.");
  return { email: session.email };
}
