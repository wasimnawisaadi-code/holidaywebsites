import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, SlidersHorizontal, X, ArrowRight, MessageCircle } from "lucide-react";
import { packages, priceLabel, travelStyles, waLink, type TravelStyle } from "@/data/catalogue";
import { cn } from "@/lib/utils";

/**
 * Interactive trip finder.
 *
 * Filters the real package list live as you type and toggle — no page reload, no
 * "submit and hope". Results are derived state, so the count, the grid and the
 * empty state can never disagree with the active filters.
 *
 * This is the page's main interactive surface: the rest of the landing page is
 * editorial, so the one place a visitor can actually interrogate the catalogue
 * needs to respond instantly.
 */

const BUDGETS = [
  { id: "any", label: "Any budget", test: () => true },
  { id: "under2500", label: "Under AED 2,500", test: (v: number) => v > 0 && v < 2500 },
  { id: "2500-5000", label: "AED 2,500 – 5,000", test: (v: number) => v >= 2500 && v <= 5000 },
  { id: "over5000", label: "AED 5,000+", test: (v: number) => v > 5000 },
] as const;

const LENGTHS = [
  { id: "any", label: "Any length", test: () => true },
  { id: "short", label: "3–4 nights", test: (n: number) => n <= 4 },
  { id: "mid", label: "5–7 nights", test: (n: number) => n >= 5 && n <= 7 },
  { id: "long", label: "8+ nights", test: (n: number) => n >= 8 },
] as const;

export function TripFinder() {
  const [query, setQuery] = useState("");
  const [style, setStyle] = useState<TravelStyle | "any">("any");
  const [budget, setBudget] = useState<(typeof BUDGETS)[number]["id"]>("any");
  const [length, setLength] = useState<(typeof LENGTHS)[number]["id"]>("any");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const budgetTest = BUDGETS.find((b) => b.id === budget)?.test ?? (() => true);
    const lengthTest = LENGTHS.find((l) => l.id === length)?.test ?? (() => true);

    return packages.filter((p) => {
      if (style !== "any" && !p.styles.includes(style)) return false;
      if (!budgetTest(p.priceFrom ?? 0)) return false;
      if (!lengthTest(p.nights)) return false;
      if (q) {
        const hay = `${p.title} ${p.country} ${p.destination} ${p.styles.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [query, style, budget, length]);

  const filtersActive =
    query.trim() !== "" || style !== "any" || budget !== "any" || length !== "any";

  const reset = () => {
    setQuery("");
    setStyle("any");
    setBudget("any");
    setLength("any");
  };

  return (
    <section className="relative bg-[#00365F] py-20 sm:py-24 text-white">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/3 right-10 size-96 rounded-full bg-[#CAA42D]/10 blur-[140px]" />
      </div>

      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[#CAA42D]" />
              <p className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#DDBE5E]">
                Find your trip
              </p>
            </div>
            <h2 className="mt-3 font-display text-3xl text-white sm:text-5xl">
              Search &amp; Filter <span className="italic text-[#DDBE5E]">Holiday Packages</span>
            </h2>
          </div>
          <p
            className="shrink-0 font-sans text-sm text-white/60"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="font-display text-2xl text-[#DDBE5E]">{results.length}</span>{" "}
            {results.length === 1 ? "package" : "packages"} available
          </p>
        </div>

        {/* Controls */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6 backdrop-blur-xl shadow-2xl">
          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 focus-within:border-[#CAA42D] focus-within:ring-1 focus-within:ring-[#CAA42D]/50">
            <Search className="size-4 shrink-0 text-[#CAA42D]" />
            <span className="sr-only">Search packages</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try Switzerland, Kenya, Bali, Thailand, Japan, Prague, Umrah…"
              className="w-full bg-transparent font-sans text-sm text-white outline-none placeholder:text-white/40"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="shrink-0 text-white/40 hover:text-white"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </label>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="flex items-center gap-2 font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-[#DDBE5E]">
              <SlidersHorizontal className="size-3.5 text-[#CAA42D]" />
              Travel Style
            </span>

            <Chips
              label=""
              value={style}
              onChange={(v) => setStyle(v as TravelStyle | "any")}
              options={[
                { id: "any", label: "All Styles" },
                ...travelStyles.map((s) => ({ id: s, label: s })),
              ]}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-white/50">
              Budget (AED)
            </span>
            <Chips
              label=""
              value={budget}
              onChange={(v) => setBudget(v as typeof budget)}
              options={BUDGETS.map((b) => ({ id: b.id, label: b.label }))}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <span className="font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-white/50">
                Duration
              </span>
              <Chips
                label=""
                value={length}
                onChange={(v) => setLength(v as typeof length)}
                options={LENGTHS.map((l) => ({ id: l.id, label: l.label }))}
              />
            </div>
            {filtersActive ? (
              <button
                type="button"
                onClick={reset}
                className="font-sans text-xs font-semibold text-[#DDBE5E] underline underline-offset-4 hover:text-[#edd57a]"
              >
                Reset all filters
              </button>
            ) : null}
          </div>
        </div>

        {/* Results */}
        {results.length ? (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((p) => (
              <li key={p.slug} className="min-w-0">
                <Link
                  to="/holidays/$slug"
                  params={{ slug: p.slug }}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md transition-all duration-300 hover:border-[#CAA42D]/40 hover:bg-white/[0.06] hover:shadow-[0_20px_40px_-20px_rgba(200,160,40,0.25)] hover:-translate-y-1"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#04121f]">
                    <img
                      src={p.image}
                      alt={p.title}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#00365F] via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="rounded-full bg-[#04121f]/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#DDBE5E] backdrop-blur-md border border-white/10">
                        {p.country}
                      </span>
                      <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
                        {p.nights} nights
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-lg leading-snug text-white group-hover:text-[#DDBE5E] transition-colors">
                      {p.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 font-sans text-xs leading-relaxed text-white/60">
                      {p.intro}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-5 border-t border-white/10">
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider text-white/40">From</span>
                        <span className="font-display text-lg font-bold text-[#DDBE5E]">{priceLabel(p)}</span>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#CAA42D]/30 bg-[#CAA42D]/10 px-3 py-1.5 font-sans text-xs font-semibold text-[#DDBE5E] group-hover:bg-[#CAA42D] group-hover:text-[#04121f] transition-all">
                        View Itinerary
                        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-14 text-center">
            <p className="font-display text-2xl text-white">
              No packages match your search criteria.
            </p>
            <p className="mx-auto mt-3 max-w-md font-sans text-sm leading-relaxed text-white/60">
              We design custom bespoke trips to 40+ countries. Let our specialists craft and cost your exact travel plan on WhatsApp.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={reset}
                className="rounded-xl border border-white/20 px-6 py-3 font-sans text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Clear all filters
              </button>
              <a
                href={waLink(
                  `Hi Nawi Saadi, I'm looking for a trip${query ? ` — ${query}` : ""}. Can you put something together?`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#CAA42D] px-6 py-3 font-sans text-sm font-bold text-[#04121f] transition-all hover:bg-[#DDBE5E]"
              >
                <MessageCircle className="size-4" />
                <span>Request Custom Itinerary</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Chips({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      {label ? (
        <span className="font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-white/40">
          {label}
        </span>
      ) : null}
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          aria-pressed={value === o.id}
          className={cn(
            "rounded-lg px-3 py-1.5 font-sans text-xs font-medium transition-all",
            value === o.id
              ? "bg-[#CAA42D] text-[#04121f] font-bold shadow-md shadow-[#CAA42D]/20"
              : "border border-white/10 bg-white/[0.03] text-white/70 hover:border-white/25 hover:bg-white/[0.08] hover:text-white",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
