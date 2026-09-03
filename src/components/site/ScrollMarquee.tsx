import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { tileImage } from "@/lib/img";

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

  /**
   * Whether the strip is close enough to be worth downloading.
   *
   * These are decorative photographs well below the fold. Left to
   * loading="lazy" alone they began fetching about two seconds into a
   * throttled load and were still arriving at eight, taking bandwidth from
   * the hero image that decides LCP. A generous rootMargin means they are
   * still ready before anyone scrolls to them.
   */
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (typeof IntersectionObserver !== "function") {
      setReady(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setReady(true);
          io.disconnect();
        }
      },
      { rootMargin: "120% 0px" },
    );
    io.observe(host);
    return () => io.disconnect();
  }, []);

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
        <Row innerRef={aRef} items={rowA} ready={ready} />
        <Row innerRef={bRef} items={rowB} ready={ready} />
      </div>
    </div>
  );
}

function Row({
  items,
  innerRef,
  ready,
}: {
  items: MarqueeItem[];
  innerRef: React.RefObject<HTMLDivElement | null>;
  ready: boolean;
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
            {/*
              Held back until the strip is near the viewport.

              loading="lazy" was not enough: on a slow connection Chrome's
              lazy threshold is generous, so these began downloading around
              two seconds in and were still finishing at eight, competing for
              bandwidth with the hero image the LCP measures. Nothing here is
              above the fold, so none of it is worth that.
            */}
            {ready ? (
              <img
                src={it.src}
                alt=""
                decoding="async"
                loading="lazy"
                // 300px wide on a phone, 360px above it. Without this the
                // browser has no reason not to fetch the 1600px original.
                {...tileImage(it.src, "(min-width: 640px) 360px, 300px")}
                className="size-full object-cover"
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
