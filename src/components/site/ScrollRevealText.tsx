import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Text that brightens word by word as the block scrolls through the viewport.
 *
 * Each word starts at low opacity and reaches full as the reading position
 * passes it, so the sentence appears to be read rather than simply revealed.
 *
 * Split by word rather than by character: a per-character split leaves every
 * letter as its own inline box, which breaks text selection, makes screen
 * readers announce the string letter by letter, and costs an order of
 * magnitude more nodes for a difference nobody can see at reading size. The
 * full sentence is kept in a visually hidden span and the pieces hidden from
 * assistive tech, so it is announced once, normally.
 */
export function ScrollRevealText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [progress, setProgress] = useState(0);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let visible = false;

    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0 when the block's top sits 80% down the viewport, 1 once its bottom
      // has risen to 20% — the band a reader's eye actually occupies.
      const start = vh * 0.8;
      const end = vh * 0.2;
      const raw = (start - r.top) / Math.max(start - end + r.height, 1);
      setProgress(Math.min(Math.max(raw, 0), 1));
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
    io.observe(el);

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [enabled]);

  const words = text.split(" ");

  return (
    <p ref={ref} className={className}>
      {/*
        aria-label is prohibited on <p>: the element has no implicit role that
        supports an accessible name, so assistive technology is entitled to
        ignore it — which meant this sentence could be announced as nothing at
        all, every word inside it being aria-hidden. A visually hidden copy of
        the text says the same thing using nothing but HTML.
      */}
      <span className="sr-only">{text}</span>
      {words.map((word, i) => {
        // Each word owns a slice of the timeline, with the window widened a
        // little so neighbours overlap and the brightening travels as a wave
        // instead of snapping one word at a time.
        const at = i / Math.max(words.length - 1, 1);
        const lit = enabled ? Math.min(Math.max((progress - at) * 6 + 0.35, 0), 1) : 1;
        return (
          <span
            key={`${word}-${i}`}
            aria-hidden="true"
            className={cn("transition-opacity duration-200 ease-out")}
            style={{ opacity: 0.18 + lit * 0.82 }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </p>
  );
}
