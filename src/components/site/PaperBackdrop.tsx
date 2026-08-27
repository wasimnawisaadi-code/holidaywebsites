import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Soft paper backdrop for light sections.
 *
 * Two layers, both deliberately at the edge of visibility:
 *
 * 1. A grain wash generated with SVG turbulence rather than a tiled image, so
 *    it costs no request, never repeats visibly, and resolves at any density.
 * 2. A few balloons drifting in the margins, tinted in brand navy, gold and
 *    sand rather than the pastel pink this pattern usually arrives in.
 *
 * Everything is held under 10% opacity. A backdrop that competes with the type
 * in front of it has failed, and this is also why the balloons hug the outer
 * edges: a centred text column on a wide screen reaches roughly the middle 60%
 * of the frame, so anything inside x=12%..88% ends up behind a word.
 *
 * The drift is scroll-linked as well as animated, so the layer has parallax
 * against the page instead of floating independently of it.
 */

/** x%, y%, width px, tint, opacity. Kept to the margins. */
const BALLOONS = [
  { x: 3, y: 10, w: 96, fill: "#00365F", o: 0.07 },
  { x: 10, y: 54, w: 62, fill: "#CAA42D", o: 0.08 },
  { x: 87, y: 18, w: 78, fill: "#8F7420", o: 0.06 },
  { x: 93, y: 60, w: 54, fill: "#00365F", o: 0.06 },
  { x: 90, y: 86, w: 40, fill: "#CAA42D", o: 0.07 },
] as const;

export function PaperBackdrop({
  className,
  grain = true,
}: {
  className?: string;
  grain?: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const nodes = Array.from(host.querySelectorAll<HTMLElement>("[data-balloon]"));
    if (!nodes.length) return;

    let raf = 0;
    let visible = false;
    const shown = nodes.map(() => 0);

    const update = () => {
      raf = 0;
      const r = host.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const p = Math.min(Math.max((vh - r.top) / (vh + r.height), 0), 1);
      nodes.forEach((n, i) => {
        // Larger balloons are nearer, so they travel further — the same rule
        // that makes the parallax read as depth rather than as random drift.
        const target = -p * (70 + i * 34);
        shown[i] += (target - (shown[i] ?? 0)) * 0.1;
        n.style.transform = `translate3d(0, ${(shown[i] ?? 0).toFixed(2)}px, 0)`;
      });
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
      { rootMargin: "250px 0px" },
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
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {grain ? (
        <svg className="absolute inset-0 size-full opacity-[0.5]" role="presentation">
          <filter id="ns-grain">
            {/* Fractal noise rather than a tiled bitmap: no visible repeat, and
                nothing to download. */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.82"
              numOctaves={3}
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
            {/* Crush the midtones so only a fine speckle survives. */}
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.055" intercept="0" />
            </feComponentTransfer>
          </filter>
          <rect width="100%" height="100%" filter="url(#ns-grain)" />
        </svg>
      ) : null}

      {BALLOONS.map((b, i) => (
        <div
          key={`${b.x}-${b.y}`}
          data-balloon=""
          className="absolute will-change-transform"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: b.w,
            opacity: b.o,
            // Each sways on its own cycle so they never move in lockstep.
            animation: `ns-sway ${16 + i * 5}s ease-in-out ${i * 2.2}s infinite`,
          }}
        >
          <Balloon fill={b.fill} />
        </div>
      ))}
    </div>
  );
}

/**
 * One balloon: envelope, basket, and the two lines between them. Gores are
 * drawn as slightly lighter panels so the envelope reads as round rather than
 * as a flat teardrop.
 */
function Balloon({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 100 150" className="block h-auto w-full" role="presentation">
      <g fill={fill}>
        <path d="M50 4C24 4 10 26 12 50c2 20 20 40 38 56 18-16 36-36 38-56C90 26 76 4 50 4Z" />
      </g>
      <g fill="#FFFFFF" opacity="0.42">
        <path d="M50 4c-9 0-16 22-16 50 0 20 7 39 16 52 9-13 16-32 16-52C66 26 59 4 50 4Z" />
      </g>
      <g fill={fill} opacity="0.55">
        <path d="M50 4c-4 0-7 22-7 50 0 20 3 39 7 52 4-13 7-32 7-52 0-28-3-50-7-50Z" />
      </g>
      <g fill={fill}>
        <rect x="43" y="112" width="14" height="12" rx="2" />
        <path d="M44 106h2v7h-2Zm10 0h2v7h-2Z" />
      </g>
    </svg>
  );
}
