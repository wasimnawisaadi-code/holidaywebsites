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
  gaId,
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

/**
 * Route-level error boundary.
 *
 * The message is deliberately not shown to visitors in production. It was
 * added during a deployment investigation and is exactly the kind of thing
 * that quietly stays in: a raw exception string can name internal modules,
 * env keys and table names, and it means nothing to a customer trying to book
 * a holiday. It still prints to the console, and still renders on screen in
 * development, which is where anyone who needs it is looking.
 */
function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    console.error(error);
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
        {import.meta.env.DEV && error?.message ? (
          <div className="mt-4 max-h-48 overflow-auto rounded-xl border border-red-200 bg-red-50 p-3 text-left font-mono text-xs text-red-800">
            <strong>Error (development only):</strong> {error.message}
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
      { title: "Dubai Holidays, UAE Tours & Flights | Nawi Saadi" },
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
      // Icon set generated from the brand mark by scripts/generate-icons.mjs.
      // The site previously declared a single 701x479 PNG as image/x-icon and
      // offered nothing for iOS, so a home-screen bookmark fell back to a
      // screenshot of the page.
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      { rel: "icon", href: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
      { rel: "manifest", href: "/site.webmanifest" },
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
      // Google Analytics 4. gtag.js is loaded async, then configured inline —
      // the inline call has to run after the library defines dataLayer, which
      // is why these are two entries rather than one.
      ...(gaId()
        ? [
            { src: `https://www.googletagmanager.com/gtag/js?id=${gaId()}`, async: true },
            {
              children:
                `window.dataLayer=window.dataLayer||[];` +
                `function gtag(){dataLayer.push(arguments);}` +
                `gtag('js',new Date());` +
                `gtag('config','${gaId()}');`,
            },
          ]
        : []),
      ...analyticsScript(),
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TravelAgency",
          // A stable identifier for the business as an entity. Without it, the
          // extra TravelAgency blocks on /about and /contact read as two more
          // agencies that happen to share a name and phone number, and the
          // signals split three ways instead of reinforcing one. With it they
          // merge into a single node.
          "@id": `${siteUrl()}/#organization`,
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
            "flydubai General Sales Agent for Afghanistan",
            "Dubai Department of Tourism and Commerce Marketing (DTCM) approved",
          ],
          url: siteUrl(),
          // This site is the holidays division of Nawi Saadi Travel & Tourism,
          // not a separate company. Saying so explicitly is what stops a search
          // engine reading two sites that share a name, a phone number and a
          // founding year as two competing businesses — and it lets the parent's
          // established authority count towards this one instead of against it.
          parentOrganization: {
            "@type": "Organization",
            name: "Nawi Saadi Travel & Tourism",
            url: "https://www.nawisaadi.com/",
          },
          // sameAs is how a search engine confirms that this site, the parent
          // company and these social accounts are one organisation rather than
          // several with a similar name. It is also what lets a verified
          // profile's own signals count towards the site.
          sameAs: [
            "https://www.nawisaadi.com/",
            BRAND.social.instagram,
            BRAND.social.facebook,
            BRAND.social.tiktok,
          ],
          logo: absoluteUrl("/og-image.jpg"),
          image: absoluteUrl(OG_IMAGE_PATH),
          priceRange: "$$-$$$",
          // Only offices we actually operate, so the entity resolves against
          // real listings rather than inventing branches.
          location: [
            {
              "@type": "TravelAgency",
              name: "Nawi Saadi Travel & Tourism, Deira",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Millenium Building, Naif Road, Deira",
                addressLocality: "Dubai",
                addressCountry: "AE",
              },
            },
            {
              "@type": "TravelAgency",
              name: "Nawi Saadi Travel & Tourism, Kabul",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Khost Tower, Jade Maiwand Road",
                addressLocality: "Kabul",
                addressCountry: "AF",
              },
            },
            {
              "@type": "TravelAgency",
              name: "Nawi Saadi Travel & Tourism, Jeddah",
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
  const gtm = gtmId();

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {/*
          GTM's <noscript> half. The head snippet alone records nothing for a
          visitor with JavaScript disabled or blocked, and it has to be the
          first thing in <body> to fire before anything else renders.
        */}
        {gtm ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtm}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        ) : null}
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
      {/*
        Keyboard and screen-reader users land on the header's mega-menus first
        and have to tab through every destination on every page load. This is
        visually hidden until focused, which is the whole convention.
      */}
      <a
        href="#main"
        className="sr-only rounded-br-xl bg-[#00365F] px-4 py-3 font-sans text-sm font-semibold text-white focus:not-sr-only focus:absolute focus:left-0 focus:top-0 focus:z-[100]"
      >
        Skip to main content
      </a>
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
