import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Progress of an element through the viewport: 0 when entering, 1 when leaving. */
export function useViewportProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [p, setP] = useState(0.5);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const raw = (vh - rect.top) / (vh + rect.height);
      setP(Math.min(Math.max(raw, 0), 1));
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return { ref, progress: p };
}

/** Depth layer: moves and pushes back in Z as the section scrolls past. */
export function Depth({
  children,
  speed = 40,
  z = 0,
  className,
}: {
  children: ReactNode;
  /** px of vertical drift across the full scroll pass */
  speed?: number;
  /** translateZ in px inside a perspective parent */
  z?: number;
  className?: string;
}) {
  const { ref, progress } = useViewportProgress<HTMLDivElement>();
  const y = (0.5 - progress) * speed * 2;

  return (
    <div
      ref={ref}
      className={cn("will-change-transform", className)}
      style={{ transform: `translate3d(0, ${y.toFixed(2)}px, ${z}px)` }}
    >
      {children}
    </div>
  );
}

/** Card that tilts in 3D on pointer move and lifts on hover. */
export function TiltCard({
  children,
  className,
  max = 8,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ x: 0, y: 0 });

  return (
    <div className="[perspective:1200px]">
      <div
        ref={ref}
        onPointerMove={(e) => {
          const el = ref.current;
          if (!el || window.matchMedia("(pointer: coarse)").matches) return;
          const r = el.getBoundingClientRect();
          setT({
            x: ((e.clientY - r.top) / r.height - 0.5) * -max,
            y: ((e.clientX - r.left) / r.width - 0.5) * max,
          });
        }}
        onPointerLeave={() => setT({ x: 0, y: 0 })}
        className={cn(
          "transition-transform duration-500 [transform-style:preserve-3d] [transition-timing-function:var(--ease-cine)]",
          className,
        )}
        style={{
          transform: `rotateX(${t.x.toFixed(2)}deg) rotateY(${t.y.toFixed(2)}deg) translateZ(0)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
