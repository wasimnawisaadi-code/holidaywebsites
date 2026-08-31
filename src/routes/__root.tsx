import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { OfferDialog } from "@/components/site/OfferDialog";
import { AnalyticsTracker } from "@/components/site/AnalyticsTracker";
import { BRAND } from "@/data/catalogue";
import {
  absoluteUrl,
  siteUrl,
  OG_IMAGE_PATH,
  verificationMeta,
  analyticsScript,
  gtmId,
} from "@/lib/site";

/**
 * 404 page.
 *
 * Overrides the inherited title and robots directive. The root head marks the
 * site `index, follow`, which a missing page must not inherit — a soft-404 that
 * invites indexing is worse than the 404 itself. The status code is already 404;
 * this makes the head agree with it.
 *
 * Offers real routes out rather than only "go home", since a 404 is usually a
 * stale link to something that still exists under a different slug.
 */
function NotFoundComponent() {
  const ways = [
    { to: "/holidays", label: "Holiday packages" },
    { to: "/countries", label: "Destinations" },
    { to: "/activities", label: "Dubai & UAE tours" },
    { to: "/contact", label: "Contact us" },
  ] as const;

  return (
    <>
      <title>Page not found | Nawi Saadi Travel &amp; Tourism</title>
      <meta name="robots" content="noindex, follow" />

      <main className="flex min-h-screen items-center justify-center bg-[#FFFFFF] px-5 py-32">
        <div className="max-w-lg text-center">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8F7420]">
            404
          </p>
          <h1 className="mt-4 font-display text-3xl leading-tight text-[#00365F] sm:text-4xl">
            We can&apos;t find that page
          </h1>
          <p className="mt-4 font-sans text-sm leading-relaxed text-[#666666]">
            The link may be out of date, or the page may have moved. Here is where most people are
            heading.
          </p>

          <ul className="mt-8 flex flex-wrap justify-center gap-3">
            {ways.map((w) => (
              <li key={w.to}>
                <Link
                  to={w.to}
                  className="inline-flex items-center rounded-xl border border-[#E5E5E5] px-5 py-2.5 font-sans text-sm font-semibold text-[#00365F] transition-colors hover:border-[#CAA42D] hover:bg-[#CAA42D]/10"
                >
                  {w.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            to="/"
            className="mt-8 inline-flex items-center rounded-xl bg-[#00365F] px-6 py-3 font-sans text-sm font-bold text-white transition-colors hover:bg-[#CAA42D] hover:text-[#00365F]"
          >
            Back to the homepage
          </Link>
        </div>
      </main>
    </>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        {error?.message ? (
          <div className="mt-4 max-h-48 overflow-auto rounded-xl bg-red-50 p-3 text-left font-mono text-xs text-red-800 border border-red-200">
            <strong>Error:</strong> {error.message}
          </div>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Nawi Saadi Travel & Tourism — Dubai Holidays, UAE Tours & Flights" },
      {
        name: "description",
        content:
          "IATA-accredited travel agency since 2009. Dubai holidays, UAE tours, visas, Umrah, flights and corporate travel across Afghanistan, the UAE and Saudi Arabia.",
      },
      { name: "author", content: "Nawi Saadi Travel & Tourism" },
      { property: "og:site_name", content: "Nawi Saadi Travel & Tourism" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      // Absolute, because crawlers do not resolve relative image URLs.
      { property: "og:image", content: absoluteUrl(OG_IMAGE_PATH) },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Nawi Saadi Travel & Tourism" },
      { name: "twitter:image", content: absoluteUrl(OG_IMAGE_PATH) },
      { property: "og:url", content: siteUrl() },
      { property: "og:locale", content: "en_AE" },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { name: "theme-color", content: "#00365F" },
      // Present only when the corresponding token is configured.
      ...verificationMeta(),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
    scripts: [
      // Google Tag Manager. Inlined rather than src-loaded because GTM's own
      // snippet must run before the async gtm.js arrives, so that dataLayer
      // exists for any tag that fires on page load.
      ...(gtmId()
        ? [
            {
              children:
                `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':` +
                `new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],` +
                `j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=` +
                `'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);` +
                `})(window,document,'script','dataLayer','${gtmId()}');`,
            },
          ]
        : []),
      ...analyticsScript(),
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TravelAgency",
          name: "Nawi Saadi Travel & Tourism",
          alternateName: "Nawi Saadi Holidays",
          foundingDate: "2009",
          email: BRAND.email,
          telephone: "+971 56 122 8069",
          areaServed: ["AE", "AF", "SA"],
          address: {
            "@type": "PostalAddress",
            streetAddress: "Millenium Building, Naif Road, Deira",
            addressLocality: "Dubai",
            addressCountry: "AE",
          },
          hasCredential: [
            "IATA Accredited Agency",
            "flydubai General Sales Agent — Afghanistan",
            "Dubai Department of Tourism and Commerce Marketing (DTCM) approved",
          ],
          url: siteUrl(),
          logo: absoluteUrl("/og-image.jpg"),
          image: absoluteUrl(OG_IMAGE_PATH),
          priceRange: "$$-$$$",
          // Only offices we actually operate, so the entity resolves against
          // real listings rather than inventing branches.
          location: [
            {
              "@type": "TravelAgency",
              name: "Nawi Saadi Travel & Tourism — Deira",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Millenium Building, Naif Road, Deira",
                addressLocality: "Dubai",
                addressCountry: "AE",
              },
            },
            {
              "@type": "TravelAgency",
              name: "Nawi Saadi Travel & Tourism — Kabul",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Khost Tower, Jade Maiwand Road",
                addressLocality: "Kabul",
                addressCountry: "AF",
              },
            },
            {
              "@type": "TravelAgency",
              name: "Nawi Saadi Travel & Tourism — Jeddah",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Jeddah",
                addressCountry: "SA",
              },
            },
          ],
          makesOffer: [
            "Worldwide holiday packages",
            "Air ticketing",
            "UAE and international visa processing",
            "Hajj and Umrah packages",
            "Dubai and UAE tours and attraction tickets",
            "Corporate and group travel",
          ].map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } })),
        }),
      },
      {
        // Declares the site as an entity and tells search engines how to run a
        // site search, which is what produces a sitelinks search box.
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Nawi Saadi Travel & Tourism",
          url: siteUrl(),
          inLanguage: "en",
          publisher: { "@type": "Organization", name: "Nawi Saadi Travel & Tourism" },
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${siteUrl()}/holidays?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        }),
      },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <SiteHeader />
      <main id="main">
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </main>
      <SiteFooter />
      <WhatsAppFab />
      <OfferDialog />
      <AnalyticsTracker />
    </QueryClientProvider>
  );
}
