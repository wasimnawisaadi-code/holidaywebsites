import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { absoluteUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Visible breadcrumb trail plus the matching BreadcrumbList JSON-LD.
 *
 * Both are emitted from the same array on purpose. Structured breadcrumbs that
 * do not match what a visitor can see are a manual-action risk, and keeping two
 * separate lists in sync by hand is how they drift apart.
 *
 * The last crumb is the current page: it is rendered as plain text rather than
 * a link, and still appears in the JSON-LD, which is what Google expects.
 */

export type Crumb = { label: string; to?: string };

export function Breadcrumbs({
  items,
  className,
  onDark = false,
}: {
  items: Crumb[];
  className?: string;
  onDark?: boolean;
}) {
  if (!items.length) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.to ? { item: absoluteUrl(c.to) } : {}),
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol
        className={cn(
          "flex flex-wrap items-center gap-x-1.5 gap-y-1 font-sans text-xs",
          onDark ? "text-white/70" : "text-[#666666]",
        )}
      >
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
              {c.to && !last ? (
                <Link
                  to={c.to}
                  className={cn(
                    "transition-colors",
                    onDark ? "hover:text-[#DDBE5E]" : "hover:text-[#7A641B]",
                  )}
                >
                  {c.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className={cn("font-semibold", onDark ? "text-white" : "text-[#00365F]")}
                >
                  {c.label}
                </span>
              )}
              {!last ? (
                <ChevronRight
                  aria-hidden="true"
                  className={cn("size-3 shrink-0", onDark ? "text-white/40" : "text-[#CAA42D]")}
                />
              ) : null}
            </li>
          );
        })}
      </ol>

      <script
        type="application/ld+json"
        // Generated from the same `items` the list above renders, so the two
        // cannot disagree.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </nav>
  );
}
