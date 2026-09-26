/**
 * Where this portal lives, for building customer links. Server-only.
 *
 * The link is pasted into WhatsApp and printed on a QR code, so it has to be
 * the real public origin — not localhost, and not a per-deployment Vercel
 * preview hostname that stops resolving after the next push. A QR code printed
 * from a preview URL is a QR code that breaks silently three days later, which
 * is why the explicit variable is checked first and the preview host last.
 */
export function portalBaseUrl(): string {
  const env = typeof process !== "undefined" ? process.env : undefined;
  const candidate =
    env?.["PORTAL_BASE_URL"] ||
    env?.["VERCEL_PROJECT_PRODUCTION_URL"] ||
    env?.["VERCEL_URL"] ||
    "http://localhost:5200";

  const withProtocol = /^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`;
  return withProtocol.replace(/\/+$/, "");
}
