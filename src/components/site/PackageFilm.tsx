import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { clamp, inverseLerp, useScrollProgressRef } from "@/lib/scroll";

/**
 * Full-bleed package film.
 *
 * A pinned stage where each package occupies the entire viewport as a single
 * photograph, and scroll cuts from one to the next: the outgoing plate scales up
 * and fades while the incoming one settles back to rest. Type is set over the
 * image, bottom-left, with the price and a link to the itinerary.
 *
 * Every transform is a pure function of scroll progress, so it scrubs identically
 * in both directions. Only the two plates either side of the cut are mounted as
 * visible layers, so fourteen full-bleed photographs cost two composited layers.
 */

export type FilmSlide = {
  slug: string;
  country: string;
  title: string;
  nights: string;
  price: string;
  image: string;
  blurb: string;
};

export function PackageFilm({ slides }: { slides: FilmSlide[] }) {
  const [p, setP] = useState(0);
  const ref = useScrollProgressRef<HTMLElement>(setP);

  const n = slides.length;
  // Progress across the whole stage maps onto n-1 cuts.
  const pos = p * Math.max(n - 1, 1);
  const index = clamp(Math.floor(pos), 0, n - 1);
  const t = clamp(pos - index);

  const current = slides[index];
  const next = slides[Math.min(index + 1, n - 1)];

  const heading = useMemo(() => current ?? slides[0], [current, slides]);

  if (!heading) return null;

  return (
    <section ref={ref} className="relative bg-[#04121f]" style={{ height: `${Math.max(n, 2) * 90}vh` }}>
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* Outgoing plate: drifts back and fades as the cut completes. */}
        {current ? (
          <Plate
            slide={current}
            style={{
              transform: `scale(${1 + t * 0.14})`,
              opacity: 1 - t,
            }}
          />
        ) : null}

        {/* Incoming plate: settles from slightly forward into rest. */}
        {next && next !== current ? (
          <Plate
            slide={next}
            style={{
              transform: `scale(${1.14 - t * 0.14})`,
              opacity: t,
            }}
          />
        ) : null}

        {/* Scrim */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#04121f] via-[#04121f]/40 to-[#04121f]/20" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#04121f]/75 via-transparent to-transparent" />

        {/* Type. Only ONE caption is ever mounted — the earlier version
            cross-faded two stacked copies, which left both legible through each
            other for most of the cut and read as garbled. Swapping at the
            midpoint keeps exactly one headline on screen at all times. */}
        <div className="relative flex h-full flex-col justify-end">
          <div className="mx-auto w-full max-w-[1400px] px-5 pb-16 sm:px-8 sm:pb-24">
            <Caption slide={(t < 0.5 ? current : next) ?? heading} />

            {/* Progress ticks */}
            <div className="mt-10 flex items-center gap-1.5" aria-hidden="true">
              {slides.map((s, i) => (
                <span
                  key={s.slug}
                  className={
                    "h-0.5 flex-1 transition-colors duration-500 " +
                    (i === index ? "bg-[#CAA42D]" : "bg-white/20")
                  }
                />
              ))}
            </div>
            <p className="mt-3 font-sans text-[11px] uppercase tracking-[0.2em] text-white/50">
              {String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")} — holiday packages
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Plate({ slide, style }: { slide: FilmSlide; style: React.CSSProperties }) {
  return (
    <div className="absolute inset-0" style={{ ...style, willChange: "transform, opacity" }}>
      <img
        src={slide.image}
        alt={slide.title}
        className="size-full object-cover"
        loading="lazy"
      />
    </div>
  );
}

function Caption({ slide }: { slide: FilmSlide }) {
  return (
    // Keyed on the slug so React swaps the subtree outright rather than
    // mutating text in place mid-cut.
    <div key={slide.slug}>
      <p className="font-sans text-[11px] font-medium uppercase tracking-[0.28em] text-[#DDBE5E]">
        {slide.country} · {slide.nights}
      </p>
      <h3 className="mt-4 max-w-3xl font-display text-[2.1rem] leading-[1.05] text-white sm:text-6xl">
        {slide.title}
      </h3>
      <p className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-white/70 sm:text-base">
        {slide.blurb}
      </p>
      <div className="mt-7 flex flex-wrap items-center gap-6">
        <Link
          to="/holidays/$slug"
          params={{ slug: slide.slug }}
          className="group pointer-events-auto inline-flex items-center gap-2 rounded-sm bg-[#CAA42D] px-7 py-3.5 font-sans text-sm font-semibold text-[#04121f] transition-colors hover:bg-[#DDBE5E]"
        >
          <span>View itinerary</span>
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
        <span className="font-display text-2xl text-white">{slide.price}</span>
      </div>
    </div>
  );
}
