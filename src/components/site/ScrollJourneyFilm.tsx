import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { clamp, damp, prefersReducedMotion } from "@/lib/scroll";
import { cn } from "@/lib/utils";

/**
 * Scroll-driven cinematic frame sequence.
 *
 * The section is several viewports tall with a sticky child. Scroll position
 * inside it maps directly onto the frame sequence, so scrolling down advances
 * the journey and scrolling up rewinds it — this is a scrubber, not a video
 * player, and there is deliberately no autoplay and no transport controls.
 *
 * Rendered to a single <canvas> rather than 120 <img> elements: swapping the
 * `src` of an image or toggling visibility across that many nodes thrashes
 * layout and drops frames. One canvas, one draw call per animation frame.
 *
 * The frame actually drawn is damped toward the scroll target instead of
 * snapping to it, which is what turns discrete stills into motion that reads as
 * a camera move. A slight scale that peaks mid-journey adds the push-in.
 *
 * Falls back to a single static frame whenever the viewer prefers reduced
 * motion, and never blocks the page: the section shows a progress state while
 * frames load and the rest of the page stays interactive throughout.
 */

type Manifest = {
  count: number;
  pad: number;
  desktop: { dir: string; width: number };
  mobile: { dir: string; width: number };
  aspect: number;
};

/**
 * Copy that fades in at fixed points along the journey.
 *
 * The thresholds are set against what the footage actually shows at that
 * progress, not spaced evenly: frame 1 is the coastline, ~20 the family on the
 * beach, ~40 the hotel lobby, ~60 the pool, ~80 the grounds, ~120 the final
 * aerial. Evenly spaced labels put "Stay" over a beach shot.
 */
const CHAPTERS = [
  { at: 0.0, label: "Discover" },
  { at: 0.13, label: "Arrive" },
  { at: 0.3, label: "Stay" },
  { at: 0.46, label: "Unwind" },
  { at: 0.62, label: "Explore" },
  { at: 0.85, label: "Remember" },
] as const;

export function ScrollJourneyFilm() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const progressRef = useRef(0);
  const barRef = useRef<HTMLDivElement>(null);

  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const [total, setTotal] = useState(0);
  const [chapter, setChapter] = useState(0);
  const [reduced, setReduced] = useState(false);

  // ---- load manifest + preload frames -------------------------------------
  useEffect(() => {
    let cancelled = false;

    if (prefersReducedMotion()) {
      setReduced(true);
      return;
    }

    (async () => {
      const res = await fetch("/frames/journey/manifest.json").catch(() => null);
      if (!res || !res.ok || cancelled) return;
      const m: Manifest = await res.json();

      // Mobile gets the smaller set — the desktop frames are roughly twice the
      // bytes and a phone has neither the bandwidth nor the memory headroom.
      const useMobile = window.matchMedia("(max-width: 768px)").matches;
      const src = useMobile ? m.mobile : m.desktop;

      setTotal(m.count);
      const imgs: HTMLImageElement[] = new Array(m.count);
      let done = 0;

      await Promise.all(
        Array.from({ length: m.count }, (_, i) => {
          return new Promise<void>((resolve) => {
            const img = new Image();
            img.decoding = "async";
            img.src = `${src.dir}/f_${String(i + 1).padStart(m.pad, "0")}.webp`;
            const finish = () => {
              imgs[i] = img;
              done++;
              // Throttle the state writes: one per frame would be 120 renders.
              if (done % 8 === 0 || done === m.count) setLoaded(done);
              resolve();
            };
            img.onload = finish;
            // A missing frame must not stall the whole sequence.
            img.onerror = finish;
          });
        }),
      );

      if (cancelled) return;
      framesRef.current = imgs.filter(Boolean);
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ---- scroll -> progress --------------------------------------------------
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let raf = 0;
    const read = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const scrubbable = r.height - window.innerHeight;
      progressRef.current = scrubbable <= 0 ? 0 : clamp(-r.top / scrubbable);
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
  }, []);

  // ---- render loop ---------------------------------------------------------
  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    const frames = framesRef.current;
    if (!canvas || !frames.length) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let raf = 0;
    let shownFrame = 0;
    let lastDrawn = -1;
    let last = performance.now();
    let running = true;

    const size = () => {
      // Capped at 1.5 rather than 2. The frames are 1280px wide, so a full 2x
      // canvas on a wide screen asks for more pixels than the source has and
      // costs memory and fill rate for detail that does not exist.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = canvas.clientWidth || 1;
      const h = canvas.clientHeight || 1;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.imageSmoothingQuality = "high";
      lastDrawn = -1; // force a redraw at the new size
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(canvas);

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!running) return;

      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const target = progressRef.current * (frames.length - 1);
      // Damping is what makes discrete stills read as continuous motion; too
      // slow and the picture lags visibly behind the scrollbar.
      shownFrame = damp(shownFrame, target, 0.055, dt);

      // Written straight to the node: this updates every frame, and a state
      // write per frame would re-render the whole section 60 times a second.
      if (barRef.current) {
        barRef.current.style.width = `${(progressRef.current * 100).toFixed(2)}%`;
      }

      const idx = Math.round(clamp(shownFrame, 0, frames.length - 1));
      const img = frames[idx];
      if (!img) return;

      // A gentle push-in that peaks at the middle of the journey.
      // Kept close to 1: the source footage is 1280x720, so anything above
      // cover already upscales, and the old 1.04-1.09 range was magnifying a
      // 720p frame across a retina full-screen canvas and softening it.
      const p = progressRef.current;
      const scale = 1 + Math.sin(p * Math.PI) * 0.022;
      const key = idx * 1000 + Math.round(scale * 1000);
      if (key === lastDrawn) return;
      lastDrawn = key;

      const cw = canvas.width;
      const ch = canvas.height;
      // Cover-fit, then apply the scale about the centre.
      const base = Math.max(cw / img.width, ch / img.height);
      const s = base * scale;
      const dw = img.width * s;
      const dh = img.height * s;
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    };
    raf = requestAnimationFrame(tick);

    // Only burn frames while the section is anywhere near the viewport.
    const io = new IntersectionObserver(
      ([e]) => {
        running = e?.isIntersecting ?? false;
      },
      { rootMargin: "150px 0px" },
    );
    if (sectionRef.current) io.observe(sectionRef.current);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [ready]);

  // ---- chapter label -------------------------------------------------------
  useEffect(() => {
    if (!ready) return;
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const p = progressRef.current;
      let next = 0;
      for (let i = 0; i < CHAPTERS.length; i++) {
        if (p >= (CHAPTERS[i]?.at ?? 1)) next = i;
      }
      setChapter((c) => (c === next ? c : next));
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [ready]);

  // ---- reduced motion: one still, no scrubbing ----------------------------
  if (reduced) {
    return (
      <section className="bg-[#00365F]">
        <div className="relative mx-auto max-w-[1400px] px-5 py-20 sm:px-8">
          <img
            src="/frames/journey/desktop/f_0001.webp"
            alt="Aerial view of a beach resort on a Nawi Saadi holiday"
            loading="eager"
            decoding="async"
            className="w-full rounded-3xl object-cover"
          />
        </div>
      </section>
    );
  }

  const pct = total ? Math.round((loaded / total) * 100) : 0;

  return (
    // Four viewports of scroll: one to settle, three to scrub through.
    <section ref={sectionRef} className="relative h-[400vh] bg-[#00365F]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 size-full" aria-hidden="true" />

        {/* Screen-reader and no-JS description of what the sequence shows. */}
        <p className="sr-only">
          A cinematic journey through a Nawi Saadi holiday: arriving at the coast, a family on the
          beach, the hotel lobby, the infinity pool, exploring the resort grounds, and a final
          aerial view of the destination.
        </p>

        {/* Scrim. Neutral black, not brand navy: a navy wash across the whole
            frame tinted the sea and sky blue and read as a colour cast rather
            than as shading. Weighted to the bottom where the caption sits, with
            just enough at the very top to keep the header legible — the middle
            of the picture is left alone. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/45 to-transparent" />

        {/* Loading state — the page stays usable while frames arrive. */}
        {!ready ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.24em] text-[#DDBE5E]">
                Loading the journey
              </p>
              <div className="mx-auto mt-4 h-px w-48 overflow-hidden bg-white/20">
                <div
                  className="h-full bg-[#CAA42D] transition-[width] duration-200"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        ) : null}

        {/* Chapter word */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
          {CHAPTERS.map((c, i) => (
            <p
              key={c.label}
              className={cn(
                "absolute inset-x-0 font-display text-[clamp(2.5rem,9vw,7rem)] leading-none text-white transition-all duration-700",
                i === chapter && ready
                  ? "translate-y-0 opacity-100 blur-0"
                  : "translate-y-3 opacity-0 blur-sm",
              )}
              style={{ textShadow: "0 2px 40px rgba(0,20,40,0.5)" }}
            >
              {c.label}
            </p>
          ))}
        </div>

        {/* Standing caption + CTA */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-end justify-between gap-6 px-5 pb-12 sm:px-8 sm:pb-16">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-[#CAA42D]" />
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-[#DDBE5E]">
                  The whole journey
                </p>
              </div>
              <p className="mt-3 max-w-lg font-display text-2xl leading-snug text-white sm:text-3xl">
                Book once. We arrange every step of it.
              </p>
            </div>

            <Link
              to="/holidays"
              className="pointer-events-auto group inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#CAA42D] px-7 py-4 font-sans text-sm font-bold text-[#00365F] transition-colors hover:bg-[#DDBE5E]"
            >
              <span>Browse holiday packages</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Scrub progress */}
          <div className="h-1 w-full bg-white/15">
            <div ref={barRef} className="h-full w-0 bg-[#CAA42D]" />
          </div>
        </div>
      </div>
    </section>
  );
}
