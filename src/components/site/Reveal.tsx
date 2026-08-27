import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Reveal-on-scroll wrapper.
 *
 * Fades up from 20px with a 4px blur that resolves as it lands — the blur is
 * what separates this from a plain fade: the element reads as coming into
 * focus rather than simply appearing. Easing is the standard expressive-out
 * curve so it decelerates hard at the end.
 *
 * Fires once and disconnects; nothing re-animates on the way back up.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "article";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      // @ts-expect-error polymorphic ref
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        // min-w-0 is load-bearing: as a grid/flex child this wrapper otherwise
        // refuses to shrink below its content's intrinsic width, which pushed
        // cards past the viewport on 390px screens.
        "min-w-0 transition-all duration-[800ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
        shown ? "translate-y-0 blur-0 opacity-100" : "translate-y-5 opacity-0 blur-[4px]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
