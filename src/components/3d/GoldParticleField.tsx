import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type ParticleFieldProps = {
  className?: string;
  particleCount?: number;
  interactive?: boolean;
};

const GOLD_SHADES = ["#d4af37", "#f59e0b", "#fbbf24", "#fef3c7", "#e2e8f0"] as const;

type Particle = {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  opacitySpeed: number;
  color: string;
};

/**
 * Drifting gold motes behind the Dubai and UAE hero images.
 *
 * Three things this now does that it did not:
 *
 *   - Honours `prefers-reduced-motion`. A permanent requestAnimationFrame loop
 *     over a full-bleed hero is exactly what that setting exists to stop, and
 *     it also runs the phone's battery down on a page someone is reading.
 *     Reduced motion gets one static frame instead of nothing, so the hero
 *     still looks composed rather than empty.
 *   - Scales the backing store by devicePixelRatio. Without it the canvas was
 *     rendered at CSS pixel size and stretched, so the motes were visibly soft
 *     on every phone and retina laptop.
 *   - Pauses while the tab is hidden, rather than animating to nobody.
 */
export function GoldParticleField({
  className,
  particleCount = 55,
  interactive = true,
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      // Draw in CSS pixels; the transform handles the density.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();

    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.6,
      speedX: (Math.random() - 0.5) * 0.35,
      speedY: -(Math.random() * 0.45 + 0.1),
      opacity: Math.random() * 0.7 + 0.2,
      opacitySpeed: (Math.random() * 0.015 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
      color: GOLD_SHADES[Math.floor(Math.random() * GOLD_SHADES.length)] ?? GOLD_SHADES[0],
    }));

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleResize = () => size();

    window.addEventListener("resize", handleResize);
    const pointerAware = interactive && !reduceMotion;
    if (pointerAware) window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const paint = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.shadowBlur = p.size * 3;
        ctx.shadowColor = p.color;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    };

    if (reduceMotion) {
      paint();
      return () => window.removeEventListener("resize", handleResize);
    }

    let animId = 0;

    const step = () => {
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;

        p.opacity += p.opacitySpeed;
        if (p.opacity > 0.85 || p.opacity < 0.15) p.opacitySpeed = -p.opacitySpeed;

        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        if (pointerAware && mouseX > 0 && mouseY > 0) {
          const dx = p.x - mouseX;
          const dy = p.y - mouseY;
          const dist = Math.hypot(dx, dy);
          // Guard the divide: a pointer exactly on a mote produced NaN
          // coordinates, and a NaN particle never draws again.
          if (dist > 0 && dist < 120) {
            const force = (120 - dist) / 120;
            p.x += (dx / dist) * force * 1.5;
            p.y += (dy / dist) * force * 1.5;
          }
        }
      }

      paint();
      animId = requestAnimationFrame(step);
    };

    const start = () => {
      if (!animId) animId = requestAnimationFrame(step);
    };
    const stop = () => {
      cancelAnimationFrame(animId);
      animId = 0;
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", handleResize);
      if (pointerAware) window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [particleCount, interactive]);

  /*
   * The positioning is the component's own, not a default a caller can drop.
   *
   * It used to be a default parameter value: className = "absolute inset-0
   * pointer-events-none". /dubai passed className="z-10 opacity-75" to add a
   * stacking order, which replaced the whole string and took the positioning
   * with it. The canvas then sat in normal flow inside the hero and pushed the
   * headline down when the effect sized it to devicePixelRatio — a 425px jump
   * about ten seconds in on a throttled phone, and the whole of that page's
   * 0.279 CLS.
   *
   * Merging instead of defaulting means a caller can add to it and cannot
   * silently remove it.
   */
  return (
    <canvas
      ref={canvasRef}
      className={cn("pointer-events-none absolute inset-0", className)}
      aria-hidden="true"
    />
  );
}
