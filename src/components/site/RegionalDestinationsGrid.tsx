import { Link } from "@tanstack/react-router";
import { Globe, ArrowRight, Sparkles, MapPin, MessageCircle } from "lucide-react";
import { BRAND, waLink } from "@/data/catalogue";

export type RegionGroup = {
  region: string;
  countries: { name: string; slug: string; isNew?: boolean; link?: string }[];
};

export const regionalDestinations: RegionGroup[] = [
  {
    region: "Europe",
    countries: [
      { name: "Switzerland", slug: "swiss-alpine-dream", link: "/holidays/swiss-alpine-dream" },
      { name: "France", slug: "france", link: "/countries/france" },
      { name: "Italy", slug: "italy", link: "/countries/italy" },
      { name: "United Kingdom", slug: "united-kingdom", link: "/countries/united-kingdom" },
      { name: "Finland", slug: "finland", isNew: true, link: "/countries/finland" },
      { name: "Czech Republic", slug: "czech-republic", link: "/countries/czech-republic" },
      { name: "Austria", slug: "austria", link: "/countries/austria" },
      { name: "Hungary", slug: "hungary", link: "/countries/hungary" },
      { name: "Greece", slug: "greece", link: "/countries/greece" },
      { name: "Scotland", slug: "united-kingdom", link: "/countries/united-kingdom" },
      { name: "Serbia", slug: "serbia", link: "/countries/serbia" },
    ],
  },
  {
    region: "Asia",
    countries: [
      { name: "Japan", slug: "japan-golden-route", link: "/holidays/japan-golden-route" },
      { name: "Indonesia (Bali)", slug: "bali-jungle-coast", link: "/holidays/bali-jungle-coast" },
      { name: "Singapore", slug: "singapore", link: "/countries/singapore" },
      { name: "Malaysia", slug: "malaysia", link: "/countries/malaysia" },
      { name: "Thailand", slug: "thailand", link: "/countries/thailand" },
      { name: "Sri Lanka", slug: "sri-lanka", link: "/countries/sri-lanka" },
      {
        name: "Maldives",
        slug: "maldives-overwater-escape",
        isNew: true,
        link: "/holidays/maldives-overwater-escape",
      },
      { name: "Nepal", slug: "nepal", link: "/countries/nepal" },
      { name: "Vietnam", slug: "vietnam", link: "/countries/vietnam" },
      { name: "China", slug: "china", link: "/countries/china" },
      { name: "South Korea", slug: "south-korea", link: "/countries/south-korea" },
      { name: "Kyrgyzstan", slug: "kyrgyzstan", link: "/countries/kyrgyzstan" },
      { name: "Hong Kong", slug: "hong-kong", link: "/countries/hong-kong" },
    ],
  },
  {
    region: "Africa",
    countries: [
      { name: "Morocco", slug: "morocco", link: "/countries/morocco" },
      { name: "Tanzania", slug: "tanzania", link: "/countries/tanzania" },
      { name: "Kenya", slug: "kenya", link: "/countries/kenya" },
      { name: "South Africa", slug: "south-africa", link: "/countries/south-africa" },
      { name: "Egypt", slug: "egypt", link: "/countries/egypt" },
      { name: "Seychelles", slug: "seychelles", link: "/countries/seychelles" },
    ],
  },
  {
    region: "Eurasia",
    countries: [
      { name: "Turkey", slug: "cappadocia-sky-turkey", link: "/holidays/cappadocia-sky-turkey" },
      { name: "Azerbaijan", slug: "baku-wonders", link: "/holidays/baku-wonders" },
      {
        name: "Georgia",
        slug: "georgia-mountain-weekender",
        link: "/holidays/georgia-mountain-weekender",
      },
      { name: "Armenia", slug: "armenia", link: "/countries/armenia" },
      { name: "Kazakhstan", slug: "kazakhstan", link: "/countries/kazakhstan" },
      { name: "Jordan", slug: "jordan", link: "/countries/jordan" },
      { name: "Uzbekistan", slug: "uzbekistan", link: "/countries/uzbekistan" },
    ],
  },
  {
    region: "Australia Tours",
    countries: [{ name: "Australia", slug: "australia", link: "/countries/australia" }],
  },
  {
    region: "America",
    countries: [
      { name: "United States of America", slug: "united-states", link: "/countries/united-states" },
      { name: "Argentina", slug: "argentina", link: "/countries/argentina" },
      { name: "Brazil", slug: "brazil", link: "/countries/brazil" },
    ],
  },
];

/**
 * One entry in a region column.
 *
 * These links live in the data as plain strings, and the call site used to
 * hand them straight to `<Link to={c.link as any}>`. The cast turned off the
 * router's route checking for all 41 of them, so a mistyped slug would have
 * compiled, shipped, and 404'd silently. Splitting the path into its route and
 * its param restores that checking: a slug that no longer resolves is now a
 * type error at the route level rather than a dead link in production.
 */
function DestinationLink({
  href,
  className,
  children,
}: {
  href: string | undefined;
  className?: string;
  children: React.ReactNode;
}) {
  if (href?.startsWith("/countries/")) {
    return (
      <Link
        to="/countries/$slug"
        params={{ slug: href.slice("/countries/".length) }}
        className={className}
      >
        {children}
      </Link>
    );
  }
  if (href?.startsWith("/holidays/")) {
    return (
      <Link
        to="/holidays/$slug"
        params={{ slug: href.slice("/holidays/".length) }}
        className={className}
      >
        {children}
      </Link>
    );
  }
  // No specific destination page yet — the directory is the honest fallback.
  return (
    <Link to="/countries" className={className}>
      {children}
    </Link>
  );
}

export function RegionalDestinationsGrid() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl sm:p-10">
      <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold tracking-wider text-[#7A641B] uppercase">
            <Globe className="size-4" /> Worldwide Travel Network
          </span>
          <h3 className="mt-1 text-2xl font-extrabold text-[#00365F] sm:text-3xl">
            Browse All Global Destinations by Region
          </h3>
        </div>

        <a
          href={waLink(
            `Hi ${BRAND.short}, I want to enquire about holiday packages to a specific country.`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#00365F] px-5 py-2.5 text-xs font-bold text-white shadow-md transition-transform hover:scale-105"
        >
          <MessageCircle className="size-4 text-[#CAA42D]" />
          <span>Custom Country Request</span>
        </a>
      </div>

      {/* 6 Region Columns matching official website screenshot */}
      <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {regionalDestinations.map((grp) => (
          <div key={grp.region} className="space-y-3">
            <h4 className="border-b-2 border-[#CAA42D] pb-1.5 text-sm font-extrabold text-[#8c2f26]">
              {grp.region}
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-700">
              {grp.countries.map((c) => (
                <li key={c.name} className="flex items-center gap-1.5">
                  <DestinationLink
                    href={c.link}
                    className="transition-colors hover:text-[#CAA42D] hover:underline"
                  >
                    {c.name}
                  </DestinationLink>
                  {c.isNew && (
                    <span className="rounded bg-[#CAA42D] px-1.5 py-0.5 text-[9px] font-black text-[#00365F] uppercase">
                      NEW
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
