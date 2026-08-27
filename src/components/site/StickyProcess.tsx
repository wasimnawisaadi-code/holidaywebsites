import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Sticky split editorial.
 *
 * The image column pins while the steps scroll past it, and the pinned image
 * cross-fades to match whichever step is currently in the reading position.
 * It replaces a row of four icon tiles: tiles state the same four facts, but
 * flat and all at once, so nothing about them rewards scrolling.
 *
 * Which step is "current" is decided by an IntersectionObserver with a narrow
 * horizontal band in the middle of the viewport, rather than by scroll maths —
 * it stays correct regardless of step height or viewport size.
 */

export type ProcessStep = {
  title: string;
  body: string;
  image: string;
};

export function StickyProcess({
  eyebrow,
  heading,
  intro,
  steps,
}: {
  eyebrow: string;
  heading: React.ReactNode;
  intro: string;
  steps: ProcessStep[];
}) {
  const [current, setCurrent] = useState(0);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const els = stepRefs.current.filter(Boolean) as HTMLLIElement[];
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        // Several steps can straddle the band at once during a fast scroll;
        // take the one closest to the middle so the image never flickers.
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!hit) return;
        const i = els.indexOf(hit.target as HTMLLIElement);
        if (i >= 0) setCurrent(i);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [steps.length]);

  return (
    <section className="bg-[#F8F8F8] py-20 sm:py-28">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[#CAA42D]" />
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8F7420]">
              {eyebrow}
            </p>
          </div>
          <h2 className="mt-3 font-display text-3xl leading-[1.08] text-[#00365F] sm:text-5xl">
            {heading}
          </h2>
          <p className="mt-4 font-sans text-sm leading-relaxed text-[#666666] sm:text-base">
            {intro}
          </p>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-20">
          {/* Pinned image column */}
          <div className="hidden lg:block">
            <div className="sticky top-28 overflow-hidden rounded-3xl bg-slate-100 shadow-xl">
              <div className="relative aspect-[4/5]">
                {steps.map((s, i) => (
                  <img
                    key={s.title}
                    src={s.image}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className={cn(
                      "absolute inset-0 size-full object-cover transition-opacity duration-700 ease-out",
                      i === current ? "opacity-100" : "opacity-0",
                    )}
                  />
                ))}
                {/* Step counter, so the pinned column shows progress too. */}
                <div className="absolute bottom-5 left-5 rounded-full bg-black/55 px-4 py-1.5 font-sans text-xs font-semibold text-white backdrop-blur-sm">
                  {String(current + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
                </div>
              </div>
            </div>
          </div>

          {/* Scrolling steps */}
          <ol className="min-w-0">
            {steps.map((s, i) => (
              <li
                key={s.title}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                className="border-b border-[#E5E5E5] py-8 last:border-b-0 sm:py-10"
              >
                <div className="flex gap-5 sm:gap-7">
                  <span
                    className={cn(
                      "mt-1.5 shrink-0 font-sans text-sm font-bold tabular-nums transition-colors duration-300",
                      i === current ? "text-[#CAA42D]" : "text-[#E5E5E5]",
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    {/* Mobile has no pinned column, so each step carries its image. */}
                    <div className="mb-4 overflow-hidden rounded-2xl bg-slate-100 lg:hidden">
                      <img
                        src={s.image}
                        alt=""
                        loading="lazy"
                        className="aspect-[16/10] w-full object-cover"
                      />
                    </div>
                    <h3 className="font-display text-xl text-[#00365F] sm:text-2xl">{s.title}</h3>
                    <p className="mt-2.5 font-sans text-sm leading-relaxed text-[#666666]">
                      {s.body}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
