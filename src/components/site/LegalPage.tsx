import type { ReactNode } from "react";

/**
 * Shared shell for the legal pages.
 *
 * A single measured column rather than the site's usual multi-column bands:
 * these pages are read linearly, and the thing that makes them usable is a
 * comfortable line length and clear headings, not layout variety.
 *
 * The `updated` date is rendered in a <time> element so it is machine-readable.
 * Search engines and answer engines both use a visible, marked-up last-reviewed
 * date as a freshness signal on policy pages.
 */
export function LegalPage({
  updated,
  children,
}: {
  /** Human-readable date, e.g. "27 August 2026". */
  updated: string;
  children: ReactNode;
}) {
  // Parsed once for the machine-readable attribute; the visible text stays as
  // written so the two can never disagree about wording.
  const iso = new Date(updated).toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-[46rem] px-5 pt-16 sm:px-8">
      <p className="font-sans text-xs text-[#666666]">
        Last updated{" "}
        <time dateTime={iso} className="font-semibold text-[#00365F]">
          {updated}
        </time>
      </p>
      <div className="mt-10 space-y-12">{children}</div>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl text-[#00365F] sm:text-2xl">{title}</h2>
      <div className="mt-4 space-y-4 font-sans text-sm leading-relaxed text-[#666666]">
        {children}
      </div>
    </section>
  );
}
