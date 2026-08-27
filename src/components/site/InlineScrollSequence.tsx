import { useEffect, useRef, useState } from "react";
import { clamp, damp, prefersReducedMotion } from "@/lib/scroll";
import { cn } from "@/lib/utils";

/**
 * A frame sequence scrubbed by scroll, sized to sit inside a normal layout
 * slot rather than pinned to the viewport.
 *
 * Progress is the element's own travel across the viewport, so the sequence
 * plays forward as it rises into view and rewinds if the reader scrolls back —
 * no pinning, and the surrounding page scrolls normally throughout. That makes
 * it usable beside body copy, where a pinned full-screen stage would not fit.
 *
 * Same performance shape as the full-bleed film: one canvas, one draw per
 * animation frame, damped toward the target so stills read as motion, render
 * loop gated on visibility, and no React render per frame.
 *
 * `poster` is shown until the frames finish decoding, and is the entire
 * treatment under prefers-reduced-motion.
 */

type Manifest = {
  count: number;
  pad: number;
  desktop: { dir: string; width: number };
  mobile: { dir: string; width: number };
  aspect: number;
};

export function InlineScrollSequence({
  slug,
  alt,
  className,
  /** Fraction of the element's viewport travel used for the scrub. */
  span = 0.75,
}: {
  slug: string;
  alt: string;
  className?: string;
  span?: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const progressRef = useRef(0);

  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [poster, setPoster] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const res = await fetch(`/frames/${slug}/manifest.json`).catch(() => null);
      if (!res || !res.ok || cancelled) return;
      const m: Manifest = await res.json();

      const useMobile = window.matchMedia("(max-width: 768px)").matches;
      const src = useMobile ? m.mobile : m.desktop;
      const url = (i: number) =>
        `${src.dir}/f_${String(i + 1).padStart(m.pad, "0")}.webp`;

      // Show frame one immediately; it doubles as the reduced-motion still.
      setPoster(url(0));

      if (prefersReducedMotion()) {
        setReduced(true);
        return;
      }

      const imgs: HTMLImageElement[] = new Array(m.count);
      await Promise.all(
        Array.from({ length: m.count }, (_, i) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.decoding = "async";
            img.src = url(i);
            const finish = () => {
              imgs[i] = img;
              resolve();
            };
            img.onload = finish;
            img.onerror = finish;
          }),
        ),
      );

      if (cancelled) return;
      framesRef.current = imgs.filter(Boolean);
      if (framesRef.current.length) setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // scroll -> progress
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    let raf = 0;
    const read = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0 as the element's top reaches the bottom of the viewport, 1 once it
      // has travelled `span` of the way up. A shorter span means the sequence
      // completes before the element leaves the screen, which is what keeps
      // the final frame on show while the reader is still looking at it.
      const travelled = (vh - r.top) / (vh + r.height);
      progressRef.current = clamp(travelled / span);
    };
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [span]);

  // render loop
  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    const frames = framesRef.current;
    if (!canvas || !frames.length) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let shown = 0;
    let lastIdx = -1;
    let last = performance.now();
    let running = true;

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round((canvas.clientWidth || 1) * dpr);
      canvas.height = Math.round((canvas.clientHeight || 1) * dpr);
      lastIdx = -1;
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(canvas);

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!running) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      shown = damp(shown, progressRef.current * (frames.length - 1), 0.05, dt);
      const idx = Math.round(clamp(shown, 0, frames.length - 1));
      if (idx === lastIdx) return;
      lastIdx = idx;

      const img = frames[idx];
      if (!img) return;

      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);
      const s = Math.max(cw / img.width, ch / img.height);
      const dw = img.width * s;
      const dh = img.height * s;
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    };
    raf = requestAnimationFrame(tick);

    const io = new IntersectionObserver(
      ([e]) => {
        running = e?.isIntersecting ?? false;
      },
      { rootMargin: "150px 0px" },
    );
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [ready]);

  return (
    <div ref={hostRef} className={cn("relative overflow-hidden", className)}>
      {/* Stays under the canvas: it covers the gap before frames decode, and is
          the whole treatment when motion is reduced. */}
      {poster ? (
        <img
          src={poster}
          alt={alt}
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-500",
            ready && !reduced ? "opacity-0" : "opacity-100",
          )}
        />
      ) : null}

      {!reduced ? (
        <canvas ref={canvasRef} className="absolute inset-0 size-full" aria-hidden="true" />
      ) : null}
    </div>
  );
}
