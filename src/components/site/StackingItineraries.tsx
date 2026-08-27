import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Itinerary cards that stack as you scroll.
 *
 * Each card sticks just under the header, and the ones above shrink and dim
 * slightly as the next slides over them, so the set reads as a physical pile
 * being dealt rather than a list scrolling past. The card behind ends a little
 * smaller than the one in front, which is what gives the stack its depth.
 *
 * Scale is a pure function of how far the *next* card has travelled, so the
 * effect scrubs identically in both directions and never accumulates drift.
 */

export type StackCard = {
  slug: string;
  index: string;
  country: string;
  title: string;
  intro: string;
  nights: number;
  days: number;
  price: string;
  priceLabel: string;
  image: string;
};

export function StackingItineraries({ cards }: { cards: StackCard[] }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [scales, setScales] = useState<number[]>(() => cards.map(() => 1));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let visible = false;
    const items = Array.from(host.children) as HTMLElement[];

    const update = () => {
      raf = 0;
      const vh = window.innerHeight || 1;
      const next = items.map((item, i) => {
        if (i === items.length - 1) return 1;
        const r = item.getBoundingClientRect();
        // How far this card has been pushed past its resting position, as a
        // fraction of a viewport. 0 while it is still the front card.
        const passed = Math.min(Math.max((vh * 0.35 - r.top) / vh, 0), 1);
        return 1 - passed * 0.06;
      });
      setScales(next);
    };

    const schedule = () => {
      if (!visible || raf) return;
      raf = requestAnimationFrame(update);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e?.isIntersecting ?? false;
        if (visible) schedule();
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(host);

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [cards.length]);

  return (
    <div ref={hostRef}>
      {cards.map((c, i) => (
        <div
          key={c.slug}
          className="sticky"
          // Each card rests a little lower than the one before, so the stacked
          // edges stay visible instead of hiding exactly behind each other.
          style={{ top: `calc(6.5rem + ${i * 14}px)` }}
        >
          <div
            className="pb-6 transition-transform duration-200 ease-out will-change-transform"
            style={{ transform: `scale(${scales[i] ?? 1})`, transformOrigin: "center top" }}
          >
            <article
              className={cn(
                "grid overflow-hidden rounded-3xl border border-[#E5E5E5] bg-white shadow-[0_24px_60px_-40px_rgba(0,54,95,0.5)]",
                "lg:grid-cols-2",
              )}
            >
              <Link
                to="/holidays/$slug"
                params={{ slug: c.slug }}
                className="group relative block aspect-[16/11] overflow-hidden bg-[#F8F8F8] lg:aspect-auto lg:min-h-[420px]"
              >
                <img
                  src={c.image}
                  alt={c.title}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="absolute inset-0 size-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-[#00365F] backdrop-blur-sm">
                  {c.country}
                </span>
              </Link>

              <div className="flex flex-col justify-center p-7 sm:p-10">
                <span className="font-sans text-[11px] font-bold tabular-nums tracking-[0.2em] text-[#CAA42D]">
                  {c.index}
                </span>
                <h3 className="mt-3 font-display text-[clamp(1.5rem,2.6vw,2.4rem)] leading-[1.12] text-[#00365F]">
                  {c.title}
                </h3>
                <p className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-[#666666]">
                  {c.intro}
                </p>

                <dl className="mt-7 flex flex-wrap gap-x-10 gap-y-4 border-t border-[#E5E5E5] pt-6">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-[#CAA42D]" />
                    <div>
                      <dt className="sr-only">Duration</dt>
                      <dd className="font-sans text-sm font-semibold text-[#00365F]">
                        {c.days} days · {c.nights} nights
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-[#CAA42D]" />
                    <div>
                      <dt className="sr-only">Country</dt>
                      <dd className="font-sans text-sm font-semibold text-[#00365F]">{c.country}</dd>
                    </div>
                  </div>
                </dl>

                <div className="mt-7 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <span className="block font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-[#666666]">
                      {c.priceLabel}
                    </span>
                    <span className="font-display text-2xl font-bold text-[#00365F]">{c.price}</span>
                  </div>
                  <Link
                    to="/holidays/$slug"
                    params={{ slug: c.slug }}
                    className="group inline-flex items-center gap-2 rounded-xl bg-[#00365F] px-6 py-3.5 font-sans text-sm font-bold text-white transition-colors hover:bg-[#CAA42D] hover:text-[#00365F]"
                  >
                    <span>See the itinerary</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </div>
      ))}
    </div>
  );
}
