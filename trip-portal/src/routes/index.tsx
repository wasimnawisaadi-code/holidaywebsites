import { createFileRoute, Link } from "@tanstack/react-router";

import { Icon } from "@/components/Icon";

/**
 * The bare origin.
 *
 * Nobody should arrive here: customers come in on /t/<token> and staff go to
 * /admin. It exists so the root of the domain is not a 404, which looks broken
 * to anyone checking whether the link they were sent is legitimate — and that is
 * a question customers do ask before tapping a link that carries their
 * documents. So it looks unmistakably like Nawi Saadi, and it tells them how to
 * reach the office.
 *
 * It deliberately offers no way to look up a trip. A search box here would turn
 * the domain into an oracle for guessing trip codes.
 */
export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Nawi Saadi Travel & Tourism · Trip portal" }] }),
  component: Landing,
});

function Landing() {
  return (
    <main className="min-h-screen bg-white">
      <section className="relative isolate overflow-hidden text-white">
        <img
          src="/destinations/hero-dubai.webp"
          alt=""
          className="absolute inset-0 -z-20 size-full object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-deep/70 via-navy-deep/30 to-navy-deep/85"
        />
        <div className="mx-auto flex min-h-[26rem] max-w-3xl flex-col px-6 pt-8 pb-14">
          <img
            src="/brand/logo-white.webp"
            alt="Nawi Saadi Travel & Tourism"
            className="h-11 w-auto self-start"
          />
          <div className="mt-auto">
            <p className="flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.24em] text-gold-light uppercase">
              <span className="h-px w-10 bg-gold-light" /> Trip portal
            </p>
            <h1 className="mt-3 font-display text-4xl leading-tight text-balance sm:text-5xl">
              Your journey, <span className="text-gold-light italic">day by day.</span>
            </h1>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-12">
        <p className="max-w-xl text-[15px] leading-relaxed text-ink">
          This is where Nawi Saadi customers follow their itinerary, driver, documents and invoices.
          Your consultant sends you a private link — open that link, or scan the QR code on your
          welcome letter, to see your trip.
        </p>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
          Lost your link? Message the office and we will resend it.
        </p>

        <div className="mt-8 grid max-w-md gap-2.5 sm:grid-cols-2">
          <a
            href="https://wa.me/971561228069"
            className="flex items-center justify-center gap-2 rounded-xl bg-gold py-3.5 text-sm font-semibold text-navy transition hover:bg-gold-light"
          >
            <Icon name="chat" className="size-4" /> WhatsApp the office
          </a>
          <a
            href="tel:+971561228069"
            className="flex items-center justify-center gap-2 rounded-xl bg-navy py-3.5 text-sm font-semibold text-white transition hover:bg-navy-deep"
          >
            <Icon name="phone" className="size-4" /> +971 56 122 8069
          </a>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-hair pt-6 text-xs text-muted">
          <span>IATA accredited · DTCM approved · Since 2009 · Naif Road, Deira, Dubai</span>
          <Link
            to="/admin"
            className="font-semibold text-navy underline decoration-gold/50 underline-offset-4"
          >
            Staff sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
