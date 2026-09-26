import { createFileRoute, Link } from "@tanstack/react-router";

/**
 * The bare origin.
 *
 * Nobody should arrive here: customers come in on /t/<token> and staff go to
 * /admin. It exists so the root of the domain is not a 404, which looks broken
 * to anyone checking whether the link they were sent is legitimate — and that is
 * a question customers do ask before tapping a link that carries their
 * documents.
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
    <main className="grid min-h-screen place-items-center bg-navy px-6 text-white">
      <div className="max-w-md text-center">
        <p className="text-[10px] font-semibold tracking-[0.22em] text-gold uppercase">
          Nawi Saadi Travel &amp; Tourism
        </p>
        <h1 className="mt-4 font-display text-3xl leading-tight">Trip portal</h1>
        <p className="mt-4 text-sm leading-relaxed text-white/80">
          This is where our customers follow their itinerary, driver and documents. Your consultant
          sends you a private link — open that link, or the QR code on your welcome letter, to see
          your trip.
        </p>
        <p className="mt-5 text-sm leading-relaxed text-white/80">
          Lost your link? Message the office and we will resend it.
        </p>
        <div className="mt-7 flex flex-col gap-2.5">
          <a
            href="https://wa.me/971561228069"
            className="rounded-xl bg-gold py-3 text-sm font-bold text-navy"
          >
            WhatsApp the office
          </a>
          <a
            href="tel:+971561228069"
            className="rounded-xl border border-white/25 py-3 text-sm font-semibold text-white"
          >
            Call +971 56 122 8069
          </a>
        </div>
        <Link to="/admin" className="mt-8 inline-block text-xs text-white/45 underline">
          Staff sign in
        </Link>
      </div>
    </main>
  );
}
