import { Outlet, createRootRoute, HeadContent, Scripts, useRouter } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";

/**
 * Root of the trip portal.
 *
 * Two things here differ deliberately from the marketing site's root, and both
 * are about the fact that this application serves named individuals rather than
 * an audience.
 *
 * 1. `noindex, nofollow, noarchive, nosnippet` on every page, reinforced by the
 *    same header in vercel.json. A customer itinerary carrying a phone number
 *    and a hotel booking must never appear in a search result. Belt and braces,
 *    because a meta tag is easy to lose in a refactor and a header is easy to
 *    lose in a platform migration; losing both at once is unlikely.
 *
 * 2. No analytics tags at all — no GTM, no GA4, no Ads. The marketing site
 *    measures visitors because that is what it is for. Sending a travelling
 *    customer's itinerary views to Google would be a different thing entirely,
 *    and nobody asked for it. The portal records nothing about who opens it
 *    either — the owner chose not to track customers reading their trip.
 */
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      // `viewport-fit=cover` so the navy header reaches into the notch area on
      // an iPhone rather than leaving a white bar above it.
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { title: "Your Trip · Nawi Saadi Travel & Tourism" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "theme-color", content: "#00365F" },
      // Opening a trip link in WhatsApp generates a preview card. Without this
      // the card shows the raw URL, which looks like a phishing link — exactly
      // the impression to avoid when the office sends the link by WhatsApp.
      { property: "og:site_name", content: "Nawi Saadi Travel & Tourism" },
      { property: "og:title", content: "Your trip itinerary" },
      {
        property: "og:description",
        content: "Your day-by-day plan, driver details and documents from Nawi Saadi.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=Inter:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  }),

  shellComponent: RootShell,
  component: Outlet,
  errorComponent: ErrorBoundary,
  notFoundComponent: NotFound,
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

/**
 * The 404, which is also what a wrong or expired trip token renders.
 *
 * Says "we can't find this trip" and offers the office's phone number, because
 * the person reading it is far more likely to be a customer with a mistyped
 * link than someone probing for tokens. It does not say whether the token
 * existed — see the note on `tripByToken`.
 */
function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="max-w-sm text-center">
        <p className="font-sans text-[11px] font-semibold tracking-[0.22em] text-gold-deep uppercase">
          Nawi Saadi Travel
        </p>
        <h1 className="mt-4 font-display text-2xl leading-tight text-navy">
          We can&apos;t find this trip
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          The link may be incomplete, or the trip may not be published yet. Please check the full
          link your consultant sent, or contact the office and we will resend it.
        </p>
        <a
          href="https://wa.me/971561228069"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-navy px-6 py-3 text-sm font-semibold text-white"
        >
          Message the office on WhatsApp
        </a>
        <p className="mt-4 text-xs text-muted">
          Or call{" "}
          <a href="tel:+971561228069" className="font-semibold text-navy">
            +971 56 122 8069
          </a>
        </p>
      </div>
    </main>
  );
}

function ErrorBoundary({ error }: { error: Error }) {
  const router = useRouter();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="max-w-sm text-center">
        <h1 className="font-display text-2xl text-navy">This page didn&apos;t load</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Something went wrong at our end. Your trip itself is safe — please try again, or contact
          the office and we will read it to you.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={() => router.invalidate()}
            className="rounded-xl bg-navy px-6 py-3 text-sm font-semibold text-white"
          >
            Try again
          </button>
          <a
            href="https://wa.me/971561228069"
            className="rounded-xl border border-hair px-6 py-3 text-sm font-semibold text-navy"
          >
            Message the office
          </a>
        </div>
        {import.meta.env.DEV ? (
          <pre className="mt-4 max-h-48 overflow-auto rounded-lg bg-white p-3 text-left text-[11px] text-alert">
            {error?.message}
          </pre>
        ) : null}
      </div>
    </main>
  );
}
