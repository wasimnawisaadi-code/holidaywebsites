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
const FALLBACK = "https://www.nawisaadi.com";

function normalise(value: string): string {
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  // Trailing slashes double up once a path is appended.
  return withProtocol.replace(/\/+$/, "");
}

export function siteUrl(): string {
  const env = typeof process !== "undefined" ? process.env : undefined;
  const candidate =
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
