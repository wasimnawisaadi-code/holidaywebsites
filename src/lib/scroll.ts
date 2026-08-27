/**
 * Scroll primitives shared by every cinematic set piece.
 *
 * The house rule for this site: scroll drives a single normalised progress value
 * (0 → 1) per pinned stage, and every animated property is a pure function of it.
 * That keeps set pieces scrubbable in both directions and immune to the drift you
 * get from accumulating deltas.
 */

import { useEffect, useRef, useState } from "react";

export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

/** Normalised position of `v` inside [a, b], clamped to the ends. */
export const inverseLerp = (a: number, b: number, v: number) =>
  a === b ? 0 : clamp((v - a) / (b - a));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Remap `v` from one range to another, clamped. */
export const mapRange = (v: number, inA: number, inB: number, outA: number, outB: number) =>
  lerp(outA, outB, inverseLerp(inA, inB, v));

/** Cosine ease — the workhorse for camera moves that must not feel mechanical. */
export const easeInOut = (t: number) => -(Math.cos(Math.PI * clamp(t)) - 1) / 2;

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp(t), 3);

export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(t)));

/**
 * Frame-rate independent exponential smoothing.
 *
 * `smoothing` is the fraction of the remaining distance left after one second,
 * so the feel stays identical on a 60Hz laptop and a 144Hz monitor.
 */
export const damp = (current: number, target: number, smoothing: number, dt: number) =>
  lerp(target, current, Math.exp(-dt * (1 / Math.max(smoothing, 1e-4))));

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Progress of a pinned section: 0 when its top hits the top of the viewport,
 * 1 when its bottom reaches the bottom. A section `h` screens tall therefore
 * yields `h - 1` screens of scrubbing while the sticky child stays fixed.
 *
 * Reads are batched into rAF so several stages on one page cost one layout pass.
 */
export function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const progress = useRef(0);
  const [, forceRender] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    let visible = true;

    const read = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const scrubbable = rect.height - window.innerHeight;
      progress.current = scrubbable <= 0 ? 0 : clamp(-rect.top / scrubbable);
      forceRender((n) => (n + 1) % 1_000_000);
    };

    const schedule = () => {
      if (!visible || frame) return;
      frame = requestAnimationFrame(read);
    };

    // Only pay for scroll work while the stage is anywhere near the viewport.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false;
        if (visible) schedule();
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);

    read();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      io.disconnect();
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return { ref, progress: progress.current };
}

/**
 * Like `useScrollProgress`, but hands progress to a callback instead of
 * re-rendering. Use this to drive canvas/WebGL stages, where a React render per
 * scroll event would be pure waste.
 */
export function useScrollProgressRef<T extends HTMLElement>(onProgress: (p: number) => void) {
  const ref = useRef<T | null>(null);
  const cb = useRef(onProgress);
  cb.current = onProgress;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    let visible = true;

    const read = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const scrubbable = rect.height - window.innerHeight;
      cb.current(scrubbable <= 0 ? 0 : clamp(-rect.top / scrubbable));
    };

    const schedule = () => {
      if (!visible || frame) return;
      frame = requestAnimationFrame(read);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false;
        if (visible) schedule();
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);

    read();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      io.disconnect();
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return ref;
}

/** Fires once when the element first enters the viewport — for reveal-on-scroll. */
export function useInView<T extends HTMLElement>(rootMargin = "-12% 0px") {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}

/** Pointer position in [-1, 1] on both axes, smoothed, for parallax tilt. */
export function usePointerParallax<T extends HTMLElement>(strength = 1) {
  const ref = useRef<T | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let frame = 0;
    const onMove = (e: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = el.getBoundingClientRect();
        setTilt({
          x: clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1) * strength,
          y: clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1) * strength,
        });
      });
    };
    const onLeave = () => setTilt({ x: 0, y: 0 });

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [strength]);

  return { ref, tilt };
}
