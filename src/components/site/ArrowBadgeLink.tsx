import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/**
 * Label block with a small square badge sitting off its bottom-right corner.
 *
 * On hover the badge lifts clear of the label rather than the whole control
 * moving — the two parts separating is the whole gesture, and it reads as the
 * arrow leaving the button ahead of the click.
 *
 * The badge is aligned to the bottom of the row and lifted with margin, so the
 * control's own height never changes and nothing below it reflows on hover.
 */
export function ArrowBadgeLink({
  to,
  children,
  className,
  tone = "navy",
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  tone?: "navy" | "gold";
}) {
  const solid = tone === "navy" ? "bg-[#00365F] text-white" : "bg-[#CAA42D] text-[#00365F]";

  return (
    <Link to={to} className={cn("group inline-flex items-end", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-[10px] px-4 py-2.5 font-sans text-sm font-semibold transition-colors",
          solid,
          tone === "navy" ? "group-hover:bg-[#002744]" : "group-hover:bg-[#DDBE5E]",
        )}
      >
        {children}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "mb-6 flex size-6 shrink-0 items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:mb-9",
          solid,
        )}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.75 6V15.75C18.75 15.949 18.671 16.14 18.53 16.28C18.39 16.421 18.199 16.5 18 16.5C17.801 16.5 17.61 16.421 17.47 16.28C17.329 16.14 17.25 15.949 17.25 15.75V7.81L6.53 18.53C6.39 18.671 6.199 18.75 6 18.75C5.801 18.75 5.61 18.671 5.47 18.53C5.329 18.39 5.25 18.199 5.25 18C5.25 17.801 5.329 17.61 5.47 17.47L16.19 6.75H8.25C8.051 6.75 7.86 6.671 7.72 6.53C7.579 6.39 7.5 6.199 7.5 6C7.5 5.801 7.579 5.61 7.72 5.47C7.86 5.329 8.051 5.25 8.25 5.25H18C18.199 5.25 18.39 5.329 18.53 5.47C18.671 5.61 18.75 5.801 18.75 6Z" />
        </svg>
      </span>
    </Link>
  );
}
