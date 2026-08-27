import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Magnetic hover.
 *
 * The child drifts toward the pointer once the pointer is within `padding`
 * pixels of the element's box, and springs back when it leaves. The pull is the
 * offset from centre divided by `strength`, so a larger strength means a
 * subtler magnet.
 *
 * Listens on the window rather than the element itself: the whole point is to
 * react *before* the pointer arrives, and an element can only hear pointer
 * events once the pointer is already over it.
 *
 * Transform is written straight to the node — a state update per pointermove
 * would re-render the subtree on every mouse motion. Disabled entirely on touch
 * and under reduced-motion, where there is no hover to respond to.
 */
export function Magnet({
  children,
  className,
  padding = 90,
  strength = 3.2,
}: {
  children: ReactNode;
  className?: string;
  /** How far outside the element the magnet starts pulling, in px. */
  padding?: number;
  /** Higher = weaker pull. */
  strength?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    let raf = 0;
    let active = false;

    const onMove = (e: PointerEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = wrap.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const withinX = Math.abs(e.clientX - cx) < r.width / 2 + padding;
        const withinY = Math.abs(e.clientY - cy) < r.height / 2 + padding;

        if (withinX && withinY) {
          if (!active) {
            active = true;
            inner.style.transition = "transform 0.3s ease-out";
          }
          inner.style.transform = `translate3d(${(e.clientX - cx) / strength}px, ${
            (e.clientY - cy) / strength
          }px, 0)`;
        } else if (active) {
          active = false;
          // Slower on the way out, so it settles rather than snapping.
          inner.style.transition = "transform 0.6s ease-in-out";
          inner.style.transform = "translate3d(0, 0, 0)";
        }
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [padding, strength]);

  return (
    <div ref={wrapRef} className={cn("inline-block", className)}>
      <div ref={innerRef} className="will-change-transform">
        {children}
      </div>
    </div>
  );
}
