import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { countriesLite as countries } from "@/data/generated/countries-lite";
import { packagesLite as packages } from "@/data/generated/packages-lite";
import { activitiesLite as inboundActivities } from "@/data/generated/activities-lite";

// Resolved from SITE_URL / Vercel env, falling back to the production domain.
// This shipped as an empty string, which emitted sitemap entries no crawler
// could follow.
import { siteUrl } from "@/lib/site";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  /** Absolute URL of the page's lead photograph, for Google Images. */
  image?: string | undefined;
}

/**
 * Last-modified date for every entry.
 *
 * The sitemap previously carried no <lastmod> at all, which is the signal
 * crawlers use to decide whether a re-crawl is worth it — without it, changed
 * pages wait for the crawler's own schedule. Build time is the honest value
 * here: the catalogue ships with the bundle, so a content change *is* a
 * deploy, and this date moves exactly when the content does.
 */
const LAST_MODIFIED = new Date().toISOString().slice(0, 10);

/** Escapes the five characters that are not legal as XML character data. */
const xml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/holidays", changefreq: "weekly", priority: "0.9" },
          { path: "/countries", changefreq: "weekly", priority: "0.9" },
          { path: "/dubai", changefreq: "weekly", priority: "0.9" },
          { path: "/uae", changefreq: "weekly", priority: "0.9" },
          { path: "/deals", changefreq: "daily", priority: "0.9" },
          { path: "/plan", changefreq: "monthly", priority: "0.6" },
          { path: "/about", changefreq: "monthly", priority: "0.7" },
          { path: "/contact", changefreq: "monthly", priority: "0.7" },
          { path: "/customized-tours", changefreq: "monthly", priority: "0.7" },
          { path: "/activities", changefreq: "weekly", priority: "0.8" },
          { path: "/privacy", changefreq: "yearly", priority: "0.2" },
          { path: "/terms", changefreq: "yearly", priority: "0.3" },
          ...countries.map((c) => ({
            path: `/countries/${c.slug}`,
            changefreq: "weekly" as const,
            priority: "0.8",
            image: c.image,
          })),
          ...packages.map((p) => ({
            path: `/holidays/${p.slug}`,
            changefreq: "weekly" as const,
            priority: "0.8",
            image: p.image,
          })),
          ...inboundActivities.map((a) => ({
            path: `/activities/${a.slug}`,
            changefreq: "weekly" as const,
            priority: "0.8",
            image: a.image,
          })),
        ];

        const base = siteUrl();

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${xml(base + e.path)}</loc>`,
            `    <lastmod>${LAST_MODIFIED}</lastmod>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            // Destination photography is a real source of traffic for a travel
            // agency, and Google Images will not find it from the page markup
            // alone on a gallery that only mounts on the client.
            e.image
              ? `    <image:image><image:loc>${xml(
                  e.image.startsWith("http") ? e.image : base + e.image,
                )}</image:loc></image:image>`
              : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const body = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`,
          `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(body, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
