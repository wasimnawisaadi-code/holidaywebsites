import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Decorative squares that drift up as the section scrolls, each at its own
 * rate, with a slow independent bob on top.
 *
 * Two motions layered deliberately: the parallax rise ties the marks to the
 * reader's scroll so they belong to the page, and the bob keeps them alive when
 * the page is still. A single motion reads as either dead or detached.
 *
 * Purely ornamental, so the layer is `aria-hidden` and never takes the pointer.
 */

/** x%, y%, size px — hugging the margins so nothing lands on the type. */
const MARKS = [
  { x: 6, y: 20, s: 12 },
  { x: 12, y: 34, s: 8 },
  { x: 8, y: 46, s: 6 },
  { x: 88, y: 18, s: 10 },
  { x: 92, y: 31, s: 14 },
  { x: 85, y: 43, s: 7 },
  { x: 90, y: 54, s: 5 },
  { x: 14, y: 58, s: 5 },
] as const;

export function FloatingSquares({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const nodes = Array.from(host.children) as HTMLElement[];
    let raf = 0;
    let visible = false;
    // Smoothed per-node offsets, so the rise eases rather than tracking scroll
    // one-to-one and looking mechanical.
    const shown = nodes.map(() => 0);

    const update = () => {
      raf = 0;
      const r = host.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const p = Math.min(Math.max((vh - r.top) / (vh + r.height), 0), 1);

      nodes.forEach((n, i) => {
        const target = -p * (80 + i * 30);
        shown[i] += (target - (shown[i] ?? 0)) * 0.12;
        n.style.transform = `translate3d(0, ${(shown[i] ?? 0).toFixed(2)}px, 0)`;
      });
    };

    const schedule = () => {
      if (!visible || raf) return;
      raf = requestAnimationFrame(update);
    };

    // Keep easing for a moment after scrolling stops so the smoothing lands.
    let settle = 0;
    const onScroll = () => {
      schedule();
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        let n = 0;
        const drain = () => {
          if (n++ > 30) return;
          update();
          requestAnimationFrame(drain);
        };
        drain();
      }, 40);
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
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      io.disconnect();
      window.clearTimeout(settle);
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {MARKS.map((m, i) => (
        <span
          key={`${m.x}-${m.y}`}
          className="absolute block bg-[#CAA42D]/35 will-change-transform"
          style={{
            left: `${m.x}%`,
            top: `${m.y}%`,
            width: m.s,
            height: m.s,
            // Each bobs on its own cycle so they never pulse in unison.
            animation: `ns-bob ${3 + i * 0.4}s ease-in-out ${i * 0.3}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
