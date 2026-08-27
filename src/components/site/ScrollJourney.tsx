import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { clamp, inverseLerp, lerp, useScrollProgress } from "@/lib/scroll";
import { cn } from "@/lib/utils";

/**
 * Scroll-driven destination sequence.
 *
 * A tall section pins one stage and scrubs a stack of plates through depth as
 * you scroll: each card starts small and far back, comes forward to fill the
 * frame, then lifts away as the next one arrives. Everything is a pure
 * function of scroll progress, so it scrubs identically in both directions and
 * needs no WebGL context, no canvas and no animation loop of its own.
 *
 * Deliberately CSS 3D rather than three.js: the previous version of this page
 * booted a WebGL globe that cost ~600KB, failed on machines without a context,
 * and put a dark slab at the top of a light-first site.
 */

export type JourneySlide = {
  place: string;
  country: string;
  nights: string;
  price: string;
  image: string;
  slug: string;
  note: string;
};

export function ScrollJourney({
  eyebrow,
  heading,
  slides,
}: {
  eyebrow: string;
  heading: string;
  slides: JourneySlide[];
}) {
  const { ref, progress } = useScrollProgress<HTMLDivElement>();

  // One "beat" per slide, plus a little air at either end so the first slide
  // has arrived before the section pins and the last has cleared before it
  // unpins.
  const beats = slides.length;
  const active = clamp(progress * beats, 0, beats - 0.0001);
  const activeIndex = Math.floor(active);

  return (
    <section
      ref={ref}
      className="relative bg-[#FFFFFF]"
      style={{ height: `${Math.max(beats * 85, 300)}vh` }}
      aria-label={heading}
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        {/* Heading rail */}
        <div className="pointer-events-none absolute inset-x-0 top-24 z-20 mx-auto max-w-[1400px] px-5 sm:px-8">
          <p className="font-sans text-[11px] font-medium tracking-[0.24em] text-[#8F7420] uppercase">
            {eyebrow}
          </p>
          <h2 className="mt-3 max-w-lg font-display text-3xl leading-[1.06] font-medium text-[#353844] sm:text-5xl">
            {heading}
          </h2>
        </div>

        {/* Depth stage */}
        <div className="perspective-1400 relative mx-auto w-full max-w-[1400px] px-5 sm:px-8">
          <div className="preserve-3d relative mx-auto aspect-[16/10] w-full max-w-3xl sm:aspect-[16/9]">
            {slides.map((slide, i) => {
              // Where this slide sits relative to the playhead:
              //   +1 → still ahead (small, far back)
              //    0 → centre stage
              //   -1 → already passed (lifted, faded)
              const offset = i - active;
              const t = clamp(inverseLerp(1, -1, offset));

              const z = lerp(-900, 420, t);
              const y = lerp(120, -260, t);
              const rotX = lerp(14, -12, t);
              const scale = lerp(0.82, 1.04, t);

              // Only the slide near the playhead is legible; the rest fade out
              // rather than stacking into visual noise.
              const distance = Math.abs(offset);
              const opacity = distance > 1.15 ? 0 : 1 - Math.pow(distance / 1.15, 2);

              return (
                <article
                  key={slide.slug}
                  aria-hidden={i !== activeIndex}
                  className="absolute inset-0 will-change-transform"
                  style={{
                    transform: `translate3d(0, ${y}px, ${z}px) rotateX(${rotX}deg) scale(${scale})`,
                    opacity,
                    zIndex: 100 - Math.round(distance * 10),
                    pointerEvents: i === activeIndex ? "auto" : "none",
                  }}
                >
                  <Link
                    to="/holidays/$slug"
                    params={{ slug: slide.slug }}
                    className="group relative block size-full overflow-hidden bg-[#FFFFFF] shadow-[0_40px_80px_-40px_rgba(28,26,23,0.55)]"
                  >
                    <img
                      src={slide.image}
                      alt={`${slide.place}, ${slide.country}`}
                      loading={i === 0 ? "eager" : "lazy"}
                      className="size-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(22,19,14,0.82)_0%,rgba(22,19,14,0.3)_42%,transparent_72%)]" />

                    <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-9">
                      <p className="font-sans text-[10px] tracking-[0.2em] text-[#e0c56a] uppercase">
                        {slide.country} · {slide.nights}
                      </p>
                      <h3 className="mt-2 font-display text-3xl leading-tight font-medium sm:text-5xl">
                        {slide.place}
                      </h3>
                      <p className="mt-3 max-w-md font-sans text-[13px] leading-relaxed text-white/80 sm:text-sm">
                        {slide.note}
                      </p>

                      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
                        <p className="font-display text-2xl font-medium">
                          <span className="align-top text-xs text-white/60">
                            {slide.price.replace(/[\d,]+/g, "").trim()}{" "}
                          </span>
                          {slide.price.match(/[\d,]+/)?.[0]}
                        </p>
                        <span className="inline-flex items-center gap-2 border-b border-white/40 pb-1 font-sans text-sm font-medium transition-colors group-hover:border-[#e0c56a] group-hover:text-[#e0c56a]">
                          See the itinerary
                          <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </div>

        {/* Progress ticks */}
        <div className="absolute right-5 bottom-10 z-20 flex items-center gap-2 sm:right-8">
          {slides.map((slide, i) => (
            <span
              key={slide.slug}
              className={cn(
                "h-px transition-all duration-500",
                i === activeIndex ? "w-9 bg-[#8F7420]" : "w-4 bg-[#c2b9a8]",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
