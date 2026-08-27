import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Plane,
  Sparkles,
  Search,
  Clock,
  MapPin,
  CheckCircle2,
  Sliders,
  Award,
  ShieldCheck,
  ArrowRight,
  MessageCircle,
  Star,
} from "lucide-react";
import { packages, travelStyles, type TravelStyle, BRAND, waLink } from "@/data/catalogue";
import { PackageCard } from "@/components/site/PackageCard";
import { Reveal } from "@/components/site/Reveal";
import { RegionalDestinationsGrid } from "@/components/site/RegionalDestinationsGrid";
import { cn } from "@/lib/utils";

type Search = { style?: string | undefined; q?: string | undefined };

export const Route = createFileRoute("/holidays/")({
  validateSearch: (search: Record<string, unknown>): Search => {
    const out: Search = {};
    if (typeof search["style"] === "string") out.style = search["style"];
    if (typeof search["q"] === "string") out.q = search["q"];
    return out;
  },
  head: () => ({
    meta: [
      { title: "Curated Luxury Holiday Packages from Dubai | Nawi Saadi Travel" },
      {
        name: "description",
        content:
          "Browse official IATA accredited luxury holiday packages from Dubai to Switzerland, Maldives, Japan, Bali, Georgia, Turkey, Azerbaijan, Kenya and Umrah. Direct flights, 5-star hotels & complete visa handling.",
      },
      { property: "og:title", content: "Curated Luxury Holiday Packages | Nawi Saadi Travel" },
    ],
  }),
  component: HolidaysPage,
});

function HolidaysPage() {
  const search = Route.useSearch();
  const [style, setStyle] = useState<TravelStyle | "All">((search.style as TravelStyle) ?? "All");
  const [duration, setDuration] = useState<"Any" | "1-4" | "5-7" | "8+">("Any");
  const [query, setQuery] = useState(search.q ?? "");
  const [selectedRegion, setSelectedRegion] = useState<string>("All");

  const regions = ["All", "Europe", "Asia", "Caucasus", "Middle East", "Island & Tropical", "Africa"];

  const results = useMemo(() => {
    return packages.filter((p) => {
      if (style !== "All" && !p.styles.includes(style)) return false;
      if (duration === "1-4" && p.days > 4) return false;
      if (duration === "5-7" && (p.days < 5 || p.days > 7)) return false;
      if (duration === "8+" && p.days < 8) return false;
      if (query.trim()) {
        const hay = `${p.title} ${p.country} ${p.destination} ${p.styles.join(" ")}`.toLowerCase();
        if (!hay.includes(query.trim().toLowerCase())) return false;
      }
      return true;
    });
  }, [style, duration, query]);

  return (
    <div className="pt-28 bg-[#F8F8F8] text-[#00365F]">
      {/* Luxury Hero Banner */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-[#FFFFFF] py-20 text-[#00365F]">
        <div className="pointer-events-none absolute inset-0 -z-10">
          
          
        </div>

        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#CAA42D]/40 bg-[#CAA42D]/10 px-4 py-1.5 text-xs font-black tracking-widest text-[#CAA42D] uppercase backdrop-blur-md">
            <Plane className="size-3.5 text-[#CAA42D]" />
            <span>Worldwide Grand Tours · Flights Arranged</span>
          </div>

          <h1 className="mt-4 font-serif font-display text-4xl font-medium sm:text-6xl text-[#00365F] tracking-tight">
            Handcrafted <span className="text-[#8F7420]">Holiday Packages</span>
          </h1>

          <p className="mt-4 max-w-2xl font-sans text-base text-slate-600 sm:text-lg leading-relaxed">
            Every itinerary is personally curated and backed by official IATA ticketing (#2009), verified 4★ &amp; 5★ central hotels, private transfers, and full visa assistance from our Dubai headquarters.
          </p>

          {/* Luxury Filter Controls */}
          <div className="mt-10 rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Search Destination or Style
                </label>
                <div className="relative mt-1.5">
                  <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. Switzerland, Maldives, Umrah..."
                    className="w-full rounded-xl border border-white/20 bg-[#00365F]/90 pl-10 pr-4 py-2.5 text-xs font-semibold text-white outline-none focus:border-[#CAA42D]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Travel Style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as TravelStyle | "All")}
                  className="mt-1.5 w-full rounded-xl border border-white/20 bg-[#00365F]/90 px-3.5 py-2.5 text-xs font-semibold text-white outline-none focus:border-[#CAA42D]"
                >
                  <option value="All">All Travel Styles</option>
                  {travelStyles.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value as typeof duration)}
                  className="mt-1.5 w-full rounded-xl border border-white/20 bg-[#00365F]/90 px-3.5 py-2.5 text-xs font-semibold text-white outline-none focus:border-[#CAA42D]"
                >
                  <option value="Any">Any Duration</option>
                  <option value="1-4">Short Weekend (1–4 Days)</option>
                  <option value="5-7">Prime Vacation (5–7 Days)</option>
                  <option value="8+">Grand Expedition (8+ Days)</option>
                </select>
              </div>

              <div className="flex items-end">
                <a
                  href={waLink("Hi Nawi Saadi Travel, I would like a custom quote for a holiday package.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#CAA42D] via-[#DDBE5E] to-[#CAA42D] py-2.5 text-xs font-black text-[#00365F] shadow-md transition-transform hover:scale-102"
                >
                  <MessageCircle className="size-4" />
                  <span>Custom Quote on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Package Results Count */}
      <section className="mx-auto max-w-[1400px] px-5 sm:px-8 py-8 flex items-center justify-between border-b border-slate-200">
        <div className="text-sm font-bold text-slate-700">
          Showing <span className="text-[#00365F] font-extrabold">{results.length}</span> Verified Holiday Packages
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
          <ShieldCheck className="size-4 text-[#CAA42D]" />
          <span>IATA accredited &middot; flydubai GSA &middot; DTCM licensed</span>
        </div>
      </section>

      {/* Package Grid */}
      <section className="mx-auto max-w-[1400px] gap-6 px-5 sm:px-8 py-12 grid sm:grid-cols-2 lg:grid-cols-3">
        {results.map((p, i) => (
          <Reveal key={p.slug} delay={i * 50}>
            <PackageCard pkg={p} />
          </Reveal>
        ))}

        {results.length === 0 && (
          <div className="col-span-full rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <h3 className="text-2xl font-bold text-[#00365F]">No matching packages found</h3>
            <p className="mt-2 text-sm text-slate-600">
              We design custom bespoke holidays everyday. Tell our Dubai travel specialists where you want to go.
            </p>
            <Link
              to="/customized-tours"
              className="mt-6 inline-flex rounded-xl bg-[#00365F] px-6 py-3 text-xs font-bold text-white shadow-md transition-transform hover:scale-105"
            >
              Build Custom Itinerary
            </Link>
          </div>
        )}
      </section>

      {/* 6-Region Worldwide Directory */}
      <section className="bg-slate-50 border-t border-slate-200 py-20">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <RegionalDestinationsGrid />
        </div>
      </section>
    </div>
  );
}
