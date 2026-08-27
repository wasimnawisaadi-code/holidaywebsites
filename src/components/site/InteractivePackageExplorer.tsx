import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Clock, MapPin, MessageCircle, ArrowRight, Sparkles } from "lucide-react";
import { packages, waLink, BRAND } from "@/data/catalogue";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "all", label: "🌟 All Trending", filter: () => true },
  {
    id: "alpine",
    label: "🏔️ Alpine & Nature",
    filter: (p: typeof packages[0]) =>
      ["Switzerland", "Georgia", "Kyrgyzstan", "Nepal", "Kazakhstan", "Austria", "Germany", "Finland"].includes(p.country) ||
      p.styles.includes("Adventure"),
  },
  {
    id: "beach",
    label: "🏖️ Tropical & Beach",
    filter: (p: typeof packages[0]) =>
      ["Maldives", "Indonesia", "Mauritius", "Seychelles", "Thailand", "Malaysia", "Sri Lanka"].includes(p.country) ||
      p.styles.includes("Beach") ||
      p.styles.includes("Honeymoon"),
  },
  {
    id: "culture",
    label: "🏛️ Culture & Heritage",
    filter: (p: typeof packages[0]) =>
      ["Spain", "Italy", "Japan", "Turkey", "Egypt", "France", "United Kingdom", "China", "Uzbekistan", "Jordan", "Serbia"].includes(p.country) ||
      p.styles.includes("Cultural"),
  },
  {
    id: "quick",
    label: "⚡ 4-Day Quick Escapes",
    filter: (p: typeof packages[0]) => p.days <= 4,
  },
] as const;

export function InteractivePackageExplorer() {
  const [activeTab, setActiveTab] = useState<string>("all");

  const filteredPackages = useMemo(() => {
    const currentTab = TABS.find((t) => t.id === activeTab) ?? TABS[0];
    return packages.filter(currentTab.filter).slice(0, 6);
  }, [activeTab]);

  return (
    <div className="mt-10">
      {/* Category Pills */}
      <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-2">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all duration-300 cursor-pointer shadow-xs",
                active
                  ? "bg-[#00365F] text-white shadow-md scale-102 ring-2 ring-[#CAA42D]/50"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200",
              )}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Grid */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPackages.map((p) => {
          const quickMsg = waLink(
            `Hi ${BRAND.short}, I am interested in the ${p.title} (${p.days}D/${p.nights}N, ${p.country}). Please share dates, flight options from Dubai, and package quotation.`,
          );
          return (
            <div
              key={p.slug}
              className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-[#CAA42D]/60 hover:shadow-2xl"
            >
              {/* Image Banner */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                  src={p.image}
                  alt={p.title}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
                <span className="absolute top-3.5 left-3.5 rounded-full bg-[#00365F]/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                  {p.country}
                </span>
                {p.priceFrom ? (
                  <span className="absolute bottom-3.5 right-3.5 rounded-full bg-[#CAA42D] px-3 py-1 text-xs font-extrabold text-[#00243f] shadow-md">
                    From AED {p.priceFrom.toLocaleString()}
                  </span>
                ) : null}
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-600">
                      <Clock className="size-3.5 text-[#CAA42D]" />
                      {p.days} Days / {p.nights} Nights
                    </span>
                    <span>•</span>
                    <span className="line-clamp-1">
                      {p.styles.slice(0, 2).join(", ")}
                    </span>
                  </div>

                  <h3 className="mt-2.5 line-clamp-2 font-display text-lg font-bold leading-snug text-[#00365F] transition-colors group-hover:text-[#8F7420]">
                    {p.title}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">
                    {p.intro}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center gap-2.5 border-t border-slate-100 pt-4">
                  <Link
                    to="/holidays/$slug"
                    params={{ slug: p.slug }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#00365F] py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#CAA42D] hover:text-[#00365F]"
                  >
                    <span>View Itinerary</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                  <a
                    href={quickMsg}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Inquire about ${p.title} on WhatsApp`}
                    className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-[#00365F] transition-colors hover:border-[#CAA42D] hover:bg-[#CAA42D]/10 hover:text-[#CAA42D]"
                  >
                    <MessageCircle className="size-4" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
