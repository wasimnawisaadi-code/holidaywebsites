import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * An image that drifts inside its own frame as the page scrolls.
 *
 * The image is rendered taller than its container and translated between
 * roughly -overscan/2 and +overscan/2 as the frame crosses the viewport, so the
 * photograph moves at a different rate to the page. That difference is what
 * gives a flat page depth without any WebGL.
 *
 * The transform is written straight to the node from a rAF loop rather than
 * held in React state — a state update per scroll event would re-render the
 * whole section and stutter on long pages.
 */
export function ParallaxImage({
  src,
  alt,
  className,
  imgClassName,
  /** Extra image height, as a percentage of the frame. More = stronger drift. */
  overscan = 18,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  overscan?: number;
  priority?: boolean;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const img = imgRef.current;
    if (!frame || !img) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let visible = false;

    const update = () => {
      raf = 0;
      const r = frame.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // -1 just below the fold, 0 centred, +1 just above it.
      const centred = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
      const range = (overscan / 100) * r.height;
      img.style.transform = `translate3d(0, ${(-centred * range) / 2}px, 0)`;
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
      { rootMargin: "120px 0px" },
    );
    io.observe(frame);

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [overscan]);

  return (
    <div ref={frameRef} className={cn("relative overflow-hidden bg-[#F8F8F8]", className)}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        // The extra height is what there is to move into; without it the drift
        // would expose the frame's background at the top or bottom.
        style={{ height: `${100 + overscan}%`, top: `${-overscan / 2}%` }}
        className={cn("absolute inset-x-0 w-full object-cover will-change-transform", imgClassName)}
      />
    </div>
  );
}
