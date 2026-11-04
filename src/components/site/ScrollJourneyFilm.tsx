import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

/** A single still replaces the scroll-scrubbed film and its frame downloads. */
export function ScrollJourneyFilm() {
  return (
    <section className="relative h-[65svh] min-h-[420px] max-h-[800px] overflow-hidden bg-[#00365F]">
      <img
        src="/images/journey-resort-5e3fb49374.webp"
        alt="Illustrative tropical beach resort with palm-lined villas and turquoise water"
        width={1600}
        height={900}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 size-full object-cover"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-0">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-end justify-between gap-6 px-5 pb-12 sm:px-8 sm:pb-16">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[#CAA42D]" />
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-[#DDBE5E]">
                The whole journey
              </p>
            </div>
            <p className="mt-3 max-w-lg font-display text-2xl leading-snug text-white sm:text-3xl">
              Book once. We arrange every step of it.
            </p>
          </div>
          <Link
            to="/holidays"
            className="group inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#CAA42D] px-7 py-4 font-sans text-sm font-bold text-[#00365F] transition-colors hover:bg-[#DDBE5E]"
          >
            <span>Browse holiday packages</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
