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
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { RegionalDestinationsGrid } from "@/components/site/RegionalDestinationsGrid";
import { cn } from "@/lib/utils";
import { absoluteUrl } from "@/lib/site";

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
          "Holiday packages from Dubai to Switzerland, the Maldives, Japan, Bali, Georgia, Turkey and beyond, with flights, hotels, transfers and visas handled for you.",
      },
      { property: "og:title", content: "Holiday Packages from Dubai | Nawi Saadi" },
      {
        property: "og:description",
        content:
          "Holiday packages from Dubai to Switzerland, the Maldives, Japan, Bali, Georgia, Turkey and beyond, with flights, hotels, transfers and visas handled for you.",
      },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/holidays") }],
    scripts: [
      {
        // An ItemList is what makes a listing page eligible to appear as a
        // carousel rather than a single blue link. The detail pages already
        // describe themselves as TouristTrips; this declares the collection
        // they belong to, and the order they are shown in.
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Holiday packages from Dubai",
          numberOfItems: packages.length,
          itemListElement: packages.slice(0, 50).map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: p.title,
            url: absoluteUrl(`/holidays/${p.slug}`),
          })),
        }),
      },
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

  const regions = [
    "All",
    "Europe",
    "Asia",
    "Caucasus",
    "Middle East",
    "Island & Tropical",
    "Africa",
  ];

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
    <div className="bg-[#F8F8F8] text-[#00365F]">
      <PageHero
        crumbs={[{ label: "Home", to: "/" }, { label: "Holiday packages" }]}
        eyebrow="Worldwide holiday packages"
        title={
          <>
            Handcrafted <span className="italic text-[#DDBE5E]">holiday packages</span>
          </>
        }
        intro="Every itinerary is built by our own consultants and backed by IATA ticketing, verified 4★ and 5★ central hotels, private transfers and full visa assistance from Deira."
        image="/images/destinations/swiss-lauterbrunnen.webp"
        imageAlt="Alpine valley on a Nawi Saadi Switzerland itinerary"
        stats={[
          { value: String(packages.length), label: "Packages" },
          { value: "IATA", label: "Accredited" },
        ]}
      />

      <section className="relative border-b border-[#E5E5E5] bg-[#FFFFFF] py-14">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          {/* Luxury Filter Controls */}
          <div className="mt-10 rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label
                  htmlFor="pkg-search"
                  className="text-[11px] font-bold uppercase tracking-wider text-slate-300"
                >
                  Search Destination or Style
                </label>
                <div className="relative mt-1.5">
                  <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="pkg-search"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. Switzerland, Maldives, Umrah..."
                    className="w-full rounded-xl border border-white/20 bg-[#00365F]/90 pl-10 pr-4 py-2.5 text-xs font-semibold text-white outline-none focus:border-[#CAA42D]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="pkg-style"
                  className="text-[11px] font-bold uppercase tracking-wider text-slate-300"
                >
                  Travel Style
                </label>
                <select
                  id="pkg-style"
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
                <label
                  htmlFor="pkg-duration"
                  className="text-[11px] font-bold uppercase tracking-wider text-slate-300"
                >
                  Duration
                </label>
                <select
                  id="pkg-duration"
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
                  href={waLink(
                    "Hi Nawi Saadi Travel, I would like a custom quote for a holiday package.",
                  )}
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
          Showing <span className="text-[#00365F] font-extrabold">{results.length}</span> Verified
          Holiday Packages
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
              We design custom bespoke holidays everyday. Tell our Dubai travel specialists where
              you want to go.
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
