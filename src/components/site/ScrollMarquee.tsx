import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Two rows of photographs that slide in opposite directions as the page
 * scrolls past them.
 *
 * Scroll position drives the offset directly rather than a looping CSS
 * animation, so the movement is tied to the reader's own gesture — stop
 * scrolling and it stops. Opposing directions on the two rows is what creates
 * the sense of parallax depth between them.
 *
 * Each row's list is duplicated and translated modulo one copy's width, so the
 * strip repeats seamlessly however far the page is scrolled.
 */

export type MarqueeItem = { src: string; alt: string };

export function ScrollMarquee({
  rowA,
  rowB,
  className,
}: {
  rowA: MarqueeItem[];
  rowB: MarqueeItem[];
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const aRef = useRef<HTMLDivElement>(null);
  const bRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const a = aRef.current;
    const b = bRef.current;
    if (!host || !a || !b) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let visible = false;

    const update = () => {
      raf = 0;
      const r = host.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // Distance the section has travelled since its top entered the viewport.
      const travelled = vh - r.top;
      const offset = travelled * 0.28;

      // One copy's width. The lists are rendered twice, so half the scroll
      // width is exactly the point where the strip repeats itself.
      const loopA = a.scrollWidth / 2 || 1;
      const loopB = b.scrollWidth / 2 || 1;

      // `% loop` keeps the translate small no matter how far the page scrolls;
      // without it the transform grows unbounded and eventually loses precision.
      a.style.transform = `translate3d(${-(offset % loopA)}px, 0, 0)`;
      b.style.transform = `translate3d(${(offset % loopB) - loopB}px, 0, 0)`;
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
  }, [rowA.length, rowB.length]);

  return (
    <div ref={hostRef} className={cn("overflow-hidden", className)} aria-hidden="true">
      <div className="flex flex-col gap-3">
        <Row innerRef={aRef} items={rowA} />
        <Row innerRef={bRef} items={rowB} />
      </div>
    </div>
  );
}

function Row({
  items,
  innerRef,
}: {
  items: MarqueeItem[];
  innerRef: React.RefObject<HTMLDivElement | null>;
}) {
  // Doubled so the strip can wrap without a visible seam.
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden">
      <div ref={innerRef} className="flex w-max gap-3 will-change-transform">
        {doubled.map((it, i) => (
          <div
            key={`${it.src}-${i}`}
            className="h-[190px] w-[300px] shrink-0 overflow-hidden rounded-2xl bg-[#F8F8F8] sm:h-[230px] sm:w-[360px]"
          >
            <img
              src={it.src}
              alt=""
              loading="lazy"
              className="size-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
