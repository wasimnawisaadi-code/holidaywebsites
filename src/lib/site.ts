/**
 * Canonical origin for the deployed site.
 *
 * Absolute URLs matter in three places that all break silently when they are
 * wrong: sitemap entries, `og:` tags (crawlers will not resolve a relative
 * image), and `rel=canonical`. The sitemap previously shipped with an empty
 * base, which produced entries no crawler could follow.
 *
 * Resolution order, most explicit first:
 *   1. SITE_URL          — set this to the custom domain in production
 *   2. VERCEL_PROJECT_PRODUCTION_URL — Vercel's stable production hostname
 *   3. VERCEL_URL        — the per-deployment hostname, for previews
 *   4. the known production domain, so a local build still emits real URLs
 */
const FALLBACK = "https://www.nawisaadiholidays.com";

function normalise(value: string): string {
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  // Trailing slashes double up once a path is appended.
  return withProtocol.replace(/\/+$/, "");
}

export function siteUrl(): string {
  // import.meta.env is inlined at build time and therefore readable in the
  // browser as well as on the server. process.env exists only on the server,
  // so a component calling this during hydration used to get the fallback
  // domain on the client and the real one on the server — which React
  // reported as a hydration mismatch on every page carrying breadcrumb
  // JSON-LD. Checking the build-time value first makes both sides agree.
  const build = import.meta.env["VITE_SITE_URL"] as string | undefined;
  const env = typeof process !== "undefined" ? process.env : undefined;
  const candidate =
    build ||
    env?.["SITE_URL"] ||
    env?.["VERCEL_PROJECT_PRODUCTION_URL"] ||
    env?.["VERCEL_URL"] ||
    FALLBACK;
  return normalise(candidate);
}

/** Absolute URL for a site-root-relative path. */
export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

/** The image crawlers use for link previews. 1200x630, generated into public/. */
export const OG_IMAGE_PATH = "/og-image.jpg";

/**
 * Search-console ownership verification.
 *
 * Google and Bing both accept a meta tag as proof of ownership. The token is
 * read from the environment rather than committed, so the same build works for
 * a preview deployment and for production, and rotating a token does not need a
 * code change.
 *
 * Returns only the tags that actually have a value — an empty `content`
 * attribute fails verification and looks like a mistake in the head.
 */
const GOOGLE_VERIFICATION = "bK2R2zLotlHJszgqDkd94qncAsajynHkI_gLnxvL4eA";

export function verificationMeta(): { name: string; content: string }[] {
  const env = typeof process !== "undefined" ? process.env : undefined;
  const pairs: [string, string | undefined][] = [
    // Committed rather than env-only: a verification token is a public
    // ownership proof, not a credential, and hardcoding it means Search
    // Console stays verified even if the env var is cleared. An env value
    // still wins, so it can be changed without a code edit.
    ["google-site-verification", env?.["GOOGLE_SITE_VERIFICATION"] ?? GOOGLE_VERIFICATION],
    ["msvalidate.01", env?.["BING_SITE_VERIFICATION"]],
  ];
  return pairs
    .filter((pair): pair is [string, string] => Boolean(pair[1]))
    .map(([name, content]) => ({ name, content }));
}

/**
 * Optional privacy-respecting analytics.
 *
 * Nothing is loaded unless PLAUSIBLE_DOMAIN is set, so the site ships with no
 * third-party requests by default. Plausible is cookieless and does not build
 * per-visitor profiles, which is what the privacy policy on this site claims.
 */
export function analyticsScript(): { src: string; defer: true; "data-domain": string }[] {
  const env = typeof process !== "undefined" ? process.env : undefined;
  const domain = env?.["PLAUSIBLE_DOMAIN"];
  if (!domain) return [];
  return [{ src: "https://plausible.io/js/script.js", defer: true, "data-domain": domain }];
}

/**
 * Google Tag Manager.
 *
 * GTM is a container: once it loads, tags are added and removed from the GTM
 * console without touching this codebase. That is the point of using it rather
 * than pasting gtag directly.
 *
 * The container id is public — it appears in the page source of every site that
 * uses one — so it is committed, with an env override for a staging container.
 * Returns nothing when disabled, so a build with GTM_ID="" ships no third-party
 * script at all.
 */
const GTM_CONTAINER = "GTM-5S3DM439";

export function gtmId(): string | null {
  const env = typeof process !== "undefined" ? process.env : undefined;
  const id = env?.["GTM_ID"] ?? GTM_CONTAINER;
  return id && id.trim() ? id.trim() : null;
}

/**
 * Google Analytics 4.
 *
 * The container above has been on the site from the start, but GA4 reported
 * "No data received from your website yet" — because a GTM container only
 * fires the tags configured inside it, and no GA4 tag had been added to this
 * one. An empty container loads happily and measures nothing.
 *
 * Rather than depend on someone remembering to wire a tag up in the GTM
 * console, the measurement ID is loaded directly. There is no double-counting
 * risk while GTM has no GA4 tag of its own; if one is added there later, unset
 * GA_MEASUREMENT_ID here rather than running both.
 *
 * The ID is public — it is visible in the page source of every site using
 * GA4 — so it is committed, with an env override for a staging property.
 */
const GA_MEASUREMENT_ID = "G-T2BBPWLYTJ";

export function gaId(): string | null {
  const env = typeof process !== "undefined" ? process.env : undefined;
  const id = env?.["GA_MEASUREMENT_ID"] ?? GA_MEASUREMENT_ID;
  return id && id.trim() ? id.trim() : null;
}
