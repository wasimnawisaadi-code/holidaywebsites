import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Horizontal destination rail — tall portrait plates, name and one-line tagline.
 *
 * Scrolls natively (so it stays usable with a trackpad, touch and keyboard) with
 * arrow buttons layered on for mouse users. The track is the scroller, so no
 * transform bookkeeping is needed and it cannot drift out of sync.
 */

export type RailItem = {
  slug: string;
  name: string;
  tagline: string;
  image: string;
  fromAed?: number | undefined;
};

export function DestinationRail({
  eyebrow,
  heading,
  items,
}: {
  eyebrow: string;
  heading: string;
  items: RailItem[];
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = () => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  };

  const nudge = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(el.clientWidth * 0.8, 240), behavior: "smooth" });
  };

  return (
    <section className="bg-[#FFFFFF] py-20 sm:py-24">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[#CAA42D]" />
              <p className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#8F7420]">
                {eyebrow}
              </p>
            </div>
            <h2 className="mt-3 font-display text-3xl text-[#00365F] sm:text-5xl">{heading}</h2>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => nudge(-1)}
              disabled={atStart}
              aria-label="Scroll destinations left"
              className="flex size-11 items-center justify-center rounded-sm border border-[#00365F]/20 text-[#00365F] transition-colors hover:bg-[#00365F]/5 disabled:opacity-30"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => nudge(1)}
              disabled={atEnd}
              aria-label="Scroll destinations right"
              className="flex size-11 items-center justify-center rounded-sm border border-[#00365F]/20 text-[#00365F] transition-colors hover:bg-[#00365F]/5 disabled:opacity-30"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </div>

      <ul
        ref={trackRef}
        onScroll={sync}
        className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-5 pb-2 sm:px-8"
      >
        {items.map((item) => (
          <li key={item.slug} className="w-[70vw] shrink-0 snap-start sm:w-[300px]">
            <Link
              to="/countries/$slug"
              params={{ slug: item.slug }}
              className="group block overflow-hidden rounded-sm bg-slate-100"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="font-display text-xl text-white">{item.name}</p>
                  <p className="mt-1 font-sans text-xs leading-relaxed text-white/80">
                    {item.tagline}
                  </p>
                  {typeof item.fromAed === "number" ? (
                    <p className="mt-2.5 font-sans text-[11px] uppercase tracking-[0.16em] text-[#DDBE5E]">
                      From AED {item.fromAed.toLocaleString()}
                    </p>
                  ) : null}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
