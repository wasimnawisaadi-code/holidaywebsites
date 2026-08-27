import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { prefersReducedMotion } from "@/lib/scroll";

/**
 * The destination index.
 *
 * A typographic list rather than another card grid: the destination name is set
 * large as the interface itself, and the photograph follows the cursor, showing
 * only the row being read. Card grids force every image to compete at thumbnail
 * size; here one image gets full attention at a decent size, and the section
 * stays quiet when the pointer is elsewhere.
 *
 * Pointer-follow imagery is desktop-only by nature. On touch — and whenever the
 * viewer prefers reduced motion — each row shows a small inline thumbnail
 * instead, so the same content is fully available without the effect.
 */

export type IndexRow = {
  slug: string;
  name: string;
  meta: string;
  price: string;
  image: string;
};

export function DestinationIndex({
  eyebrow,
  heading,
  rows,
}: {
  eyebrow: string;
  heading: React.ReactNode;
  rows: IndexRow[];
}) {
  const [active, setActive] = useState<number | null>(null);
  const [pointerFine, setPointerFine] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Target and rendered positions live in refs and are interpolated in a rAF
  // loop. Driving the transform from React state would re-render the whole list
  // on every pointer move.
  const target = useRef({ x: 0, y: 0 });
  const shown = useRef({ x: 0, y: 0 });
  const frame = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const apply = () => setPointerFine(mq.matches && !prefersReducedMotion());
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!pointerFine) return;
    const loop = () => {
      frame.current = requestAnimationFrame(loop);
      const el = previewRef.current;
      if (!el) return;
      // Trailing follow: the image eases toward the cursor rather than pinning
      // to it, which is what reads as weight instead of jitter.
      shown.current.x += (target.current.x - shown.current.x) * 0.14;
      shown.current.y += (target.current.y - shown.current.y) * 0.14;
      el.style.transform = `translate3d(${shown.current.x}px, ${shown.current.y}px, 0) translate(-50%, -50%)`;
    };
    frame.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame.current);
  }, [pointerFine]);

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      if (!pointerFine) return;
      const r = wrapRef.current?.getBoundingClientRect();
      if (!r) return;
      target.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    },
    [pointerFine],
  );

  const onEnterRow = useCallback(
    (i: number, e: React.PointerEvent) => {
      if (pointerFine) {
        const r = wrapRef.current?.getBoundingClientRect();
        if (r) {
          const pos = { x: e.clientX - r.left, y: e.clientY - r.top };
          target.current = pos;
          // Jump the preview to the cursor on first entry so it does not fly in
          // from wherever it was last parked.
          if (active === null) shown.current = pos;
        }
      }
      setActive(i);
    },
    [pointerFine, active],
  );

  return (
    <section className="bg-[#FFFFFF] py-20 sm:py-28">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[#CAA42D]" />
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8F7420]">
                {eyebrow}
              </p>
            </div>
            <h2 className="mt-3 max-w-2xl font-display text-3xl leading-[1.08] text-[#00365F] sm:text-5xl">
              {heading}
            </h2>
          </div>
          <Link
            to="/countries"
            className="group inline-flex shrink-0 items-center gap-2 font-sans text-xs font-bold uppercase tracking-[0.14em] text-[#00365F] transition-colors hover:text-[#8F7420]"
          >
            <span>Every destination</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div
          ref={wrapRef}
          onPointerMove={onMove}
          onPointerLeave={() => setActive(null)}
          className="relative mt-12"
        >
          {/* Cursor-follow preview. Sits above the rows but never intercepts the
              pointer, so hover keeps tracking the row underneath it. */}
          {pointerFine ? (
            <div
              ref={previewRef}
              aria-hidden="true"
              className={
                "pointer-events-none absolute left-0 top-0 z-20 hidden w-[19rem] overflow-hidden rounded-2xl shadow-2xl transition-opacity duration-300 lg:block " +
                (active === null ? "opacity-0" : "opacity-100")
              }
            >
              <div className="relative aspect-[4/5] bg-slate-100">
                {rows.map((r, i) => (
                  <img
                    key={r.slug}
                    src={r.image}
                    alt=""
                    loading="lazy"
                    className={
                      "absolute inset-0 size-full object-cover transition-opacity duration-300 " +
                      (active === i ? "opacity-100" : "opacity-0")
                    }
                  />
                ))}
              </div>
            </div>
          ) : null}

          <ul className="relative z-10 border-t border-[#E5E5E5]">
            {rows.map((r, i) => {
              const dimmed = pointerFine && active !== null && active !== i;
              return (
                <li key={r.slug} className="border-b border-[#E5E5E5]">
                  <Link
                    to="/countries/$slug"
                    params={{ slug: r.slug }}
                    onPointerEnter={(e) => onEnterRow(i, e)}
                    className={
                      "group flex items-center gap-5 py-6 transition-opacity duration-300 sm:gap-8 sm:py-7 " +
                      (dimmed ? "opacity-35" : "opacity-100")
                    }
                  >
                    {/* Inline thumbnail — the touch / reduced-motion path. */}
                    {!pointerFine ? (
                      <span className="size-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:size-20">
                        <img src={r.image} alt="" loading="lazy" className="size-full object-cover" />
                      </span>
                    ) : null}

                    <span
                      aria-hidden="true"
                      className="hidden w-8 shrink-0 font-sans text-[11px] font-semibold tabular-nums text-[#CAA42D] lg:block"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-2xl leading-tight text-[#00365F] transition-colors group-hover:text-[#8F7420] sm:text-4xl">
                        {r.name}
                      </span>
                      <span className="mt-1 block font-sans text-xs text-[#666666]">{r.meta}</span>
                    </span>

                    <span className="shrink-0 text-right font-sans text-sm font-bold text-[#00365F] sm:text-base">
                      {r.price}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
