import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  BedDouble,
  Bus,
  Check,
  ChevronDown,
  Clock,
  Info,
  MapPin,
  MessageCircle,
  Minus,
  Plane,
  Plus,
  ShieldCheck,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  X,
  Zap,
} from "lucide-react";
import { BRAND, packages, priceLabel, waLink } from "@/data/catalogue";
import { countries } from "@/data/countries";
import { packageDetail } from "@/data/package-details";
import { PackageCard } from "@/components/site/PackageCard";
import { Reveal } from "@/components/site/Reveal";
import { cn } from "@/lib/utils";
import { packageTitle, metaDescription } from "@/lib/seo";
import { absoluteUrl, siteUrl } from "@/lib/site";

export const Route = createFileRoute("/holidays/$slug")({
  loader: ({ params }) => {
    const pkg = packages.find((p) => p.slug === params.slug);
    if (!pkg) throw notFound();
    return { pkg, detail: packageDetail(params.slug) };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: `Journey unavailable | ${BRAND.short}` },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { pkg, detail } = loaderData;
    const title = packageTitle(pkg.title, pkg.days, pkg.country);
    const description = metaDescription(detail?.overview ?? pkg.intro);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:url", content: absoluteUrl(`/holidays/${params.slug}`) },
        { property: "og:image", content: absoluteUrl(pkg.image) },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: absoluteUrl(pkg.image) },
      ],
      links: [{ rel: "canonical", href: absoluteUrl(`/holidays/${params.slug}`) }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristTrip",
            name: pkg.title,
            description: detail?.overview ?? pkg.intro,
            itinerary: {
              "@type": "ItemList",
              itemListElement: pkg.itinerary.map((d) => ({
                "@type": "ListItem",
                position: d.day,
                name: d.title,
              })),
            },
            provider: { "@type": "TravelAgency", name: BRAND.name, url: siteUrl() },
            image: absoluteUrl(pkg.image),
            url: absoluteUrl(`/holidays/${params.slug}`),
            touristType: pkg.styles,
            // Only emit an Offer when there is a real published figure. A
            // schema price that does not match the page is a manual action, and
            // "price on request" has no numeric equivalent.
            ...(pkg.priceStatus === "from" && pkg.priceFrom
              ? {
                  offers: {
                    "@type": "Offer",
                    price: pkg.priceFrom,
                    priceCurrency: "AED",
                    availability: "https://schema.org/InStock",
                    url: absoluteUrl(`/holidays/${params.slug}`),
                    // The page shows a per-person "from" price, so the offer
                    // has to say so rather than implying a fixed total.
                    priceSpecification: {
                      "@type": "UnitPriceSpecification",
                      price: pkg.priceFrom,
                      priceCurrency: "AED",
                      valueAddedTaxIncluded: true,
                      referenceQuantity: {
                        "@type": "QuantitativeValue",
                        value: 1,
                        unitText: "person",
                      },
                    },
                  },
                }
              : {}),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
              {
                "@type": "ListItem",
                position: 2,
                name: "Holiday packages",
                item: absoluteUrl("/holidays"),
              },
              { "@type": "ListItem", position: 3, name: pkg.title },
            ],
          }),
        },
        ...(detail?.faqs?.length
          ? [
              {
                type: "application/ld+json",
                children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: detail.faqs.map((f) => ({
                    "@type": "Question",
                    name: f.q,
                    acceptedAnswer: { "@type": "Answer", text: f.a },
                  })),
                }),
              },
            ]
          : []),
      ],
    };
  },
  component: PackagePage,
  notFoundComponent: PackageNotFound,
});

function PackageNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-5 pt-40 pb-24 text-center">
      <h1 className="text-display text-4xl">Journey not found</h1>
      <Link
        to="/holidays"
        className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground"
      >
        Browse all holidays
      </Link>
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="scroll-mt-28">
      <Reveal className="mt-16">
        <h2 className="font-display text-2xl font-bold text-[#00365F] sm:text-3xl">{title}</h2>
        <div className="mt-5">{children}</div>
      </Reveal>
    </div>
  );
}

function PackagePage() {
  const { pkg, detail } = Route.useLoaderData();
  const [openDay, setOpenDay] = useState(1);
  const [openFaq, setOpenFaq] = useState(0);
  const [shot, setShot] = useState(0);

  // Interactive booking state
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [hotelTier, setHotelTier] = useState<
    "3-Star Comfort" | "4-Star Superior" | "5-Star Luxury"
  >("4-Star Superior");

  const basePrice = pkg.priceFrom || 2499;

  const estimatedTotal = useMemo(() => {
    let multiplier = 1;
    if (hotelTier === "3-Star Comfort") multiplier = 0.85;
    if (hotelTier === "5-Star Luxury") multiplier = 1.35;
    const perAdult = basePrice * multiplier;
    const perChild = perAdult * 0.65;
    return Math.round(adults * perAdult + children * perChild);
  }, [basePrice, hotelTier, adults, children]);

  const customEnquiry = useMemo(() => {
    const msg = `Hi ${BRAND.short}, I'd like to book the "${pkg.title}" package (${pkg.days}D/${pkg.nights}N, ${pkg.country}).\n- Hotel Tier: ${hotelTier}\n- Travellers: ${adults} Adult(s)${children > 0 ? `, ${children} Child(ren)` : ""}\n- Estimated Package Total: AED ${estimatedTotal.toLocaleString()}\nPlease share available departure dates, flight options from your departure city, and visa details.`;
    return waLink(msg);
  }, [pkg, hotelTier, adults, children, estimatedTotal]);

  const countryRecord = countries.find(
    (c) =>
      c.name.toLowerCase() === pkg.country.toLowerCase() ||
      c.slug.toLowerCase() === pkg.country.toLowerCase() ||
      (c.name === "United States of America" && pkg.country.includes("United States")),
  );

  const countryGallery = countryRecord?.gallery?.length ? countryRecord.gallery : [];
  const rawGallery = detail?.gallery?.length ? detail.gallery : [];
  const combined = [...new Set([pkg.image, ...rawGallery, ...countryGallery])];
  const gallery =
    combined.length >= 4 ? combined.slice(0, 4) : combined.length ? combined : [pkg.image];
  const related = packages
    .filter(
      (p) =>
        p.slug !== pkg.slug &&
        (p.region === pkg.region || p.styles.some((s) => pkg.styles.includes(s))),
    )
    .slice(0, 3);

  return (
    <article className="pb-32">
      {/* Luxury Hero Banner */}
      <header className="on-dark relative h-[72vh] min-h-[490px] w-full overflow-hidden bg-[#00365F]">
        <img
          src={pkg.image}
          alt={`${pkg.title}, a ${pkg.days} day holiday in ${pkg.country}`}
          width={1600}
          height={1000}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="kenburns absolute inset-0 size-full scale-105 object-cover brightness-75"
        />
        <div className="night-fade absolute inset-0 bg-gradient-to-t from-[#00365F] via-[#00365F]/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1400px] px-5 pb-14 sm:px-8">
          <Link
            to="/holidays"
            className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-[#CAA42D] transition-colors"
          >
            <ArrowLeft className="size-4" aria-hidden /> All holiday packages
          </Link>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#CAA42D] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#00243f]">
              {pkg.country}
            </span>
            {pkg.seasonal ? (
              <span className="rounded-full bg-white/20 px-3.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
                {pkg.seasonal}
              </span>
            ) : null}
          </div>
          <h1 className="text-display mt-3 max-w-4xl text-3xl font-extrabold text-white sm:text-5xl lg:text-6xl leading-tight">
            {pkg.title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-200">
            <span className="inline-flex items-center gap-2">
              <MapPin className="size-4 text-[#CAA42D]" aria-hidden />
              {pkg.destination}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="size-4 text-[#CAA42D]" aria-hidden />
              {pkg.days} Days / {pkg.nights} Nights
            </span>
            <span className="inline-flex items-center gap-2">
              <Plane className="size-4 text-[#CAA42D]" aria-hidden />
              Flights arranged on request
            </span>
            <span className="rounded-full bg-white px-3.5 py-1 text-xs font-extrabold text-[#00365F] shadow-md">
              {priceLabel(pkg)}
            </span>
          </div>
        </div>
      </header>

      {/* Four-image gallery */}
      <div className="mx-auto mt-8 max-w-[1400px] px-5 sm:px-8">
        {/*
          The thumbnail rail only earns its column when there is more than one
          photograph. Several galleries lost images in the relevance audit —
          wrong-country pictures were removed rather than replaced with more
          wrong ones — and a fixed two-column grid left a large hole where the
          missing thumbnails used to sit.
        */}
        <div className={cn("grid gap-3", gallery.length > 1 && "lg:grid-cols-[2.2fr_1fr]")}>
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-slate-100 shadow-md">
            <img
              src={gallery[shot] ?? pkg.image}
              alt={`${pkg.title}, view ${shot + 1}`}
              width={1600}
              height={1000}
              loading="lazy"
              decoding="async"
              className="size-full object-cover transition-all duration-500"
            />
            <div className="absolute bottom-4 left-4 rounded-full bg-black/60 px-3.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
              Photo {shot + 1} of {gallery.length}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 lg:grid-cols-2">
            {gallery.slice(0, 4).map((g, i) => (
              <button
                key={`${g}-${i}`}
                type="button"
                onClick={() => setShot(i)}
                aria-label={`Show image ${i + 1}`}
                className={cn(
                  "group relative aspect-[4/3] overflow-hidden rounded-2xl ring-2 transition-all cursor-pointer bg-slate-100",
                  shot === i
                    ? "ring-[#00365F] shadow-md scale-102"
                    : "ring-transparent hover:ring-[#00365F]/40 opacity-80 hover:opacity-100",
                )}
              >
                <img
                  src={g}
                  alt=""
                  decoding="async"
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute top-2 left-2 flex size-5 items-center justify-center rounded-full bg-black/50 text-[10px] font-bold text-white backdrop-blur-xs">
                  {i + 1}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1400px] gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <Section id="overview" title="Package overview">
            <p className="text-lg leading-relaxed text-slate-700">
              {detail?.overview ?? pkg.intro}
            </p>
            <p className="mt-4 text-slate-600 leading-relaxed">{pkg.story}</p>
          </Section>

          <Section id="highlights" title="Top highlights">
            <ul className="grid gap-3 sm:grid-cols-2">
              {pkg.highlights.map((h) => (
                <li
                  key={h}
                  className="flex gap-3 rounded-2xl bg-slate-50 p-4 text-sm border border-slate-200"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-[#CAA42D]" aria-hidden />
                  <span className="text-slate-800 font-medium">{h}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="itinerary" title="Day-by-day itinerary">
            <ol className="border-l-2 border-[#CAA42D]/40 pl-6 space-y-6">
              {pkg.itinerary.map((d) => {
                const open = openDay === d.day;
                const blocks = detail?.dayBlocks.find((b) => b.day === d.day);
                return (
                  <li key={d.day} className="relative">
                    <span
                      className={cn(
                        "absolute -left-[31px] top-1 size-3.5 rounded-full border-2 transition-colors",
                        open ? "border-[#00365F] bg-[#00365F]" : "border-slate-300 bg-white",
                      )}
                      aria-hidden
                    />
                    <button
                      type="button"
                      onClick={() => setOpenDay(open ? -1 : d.day)}
                      aria-expanded={open}
                      className="w-full text-left cursor-pointer"
                    >
                      <span className="text-xs font-bold uppercase tracking-wider text-[#CAA42D]">
                        Day {String(d.day).padStart(2, "0")}
                      </span>
                      <span className="mt-1 block font-display text-xl font-bold text-[#00365F]">
                        {d.title}
                      </span>
                      <span className="mt-1 block text-sm text-slate-600">{d.summary}</span>
                    </button>

                    {open && (
                      <div className="mt-4 rounded-2xl bg-slate-50 p-5 text-sm border border-slate-200 shadow-sm">
                        {blocks ? (
                          <div className="grid gap-4 sm:grid-cols-2">
                            <p className="flex gap-3">
                              <Sunrise
                                className="mt-0.5 size-4 shrink-0 text-[#CAA42D]"
                                aria-hidden
                              />
                              <span>
                                <span className="block font-bold text-[#00365F]">Morning</span>
                                <span className="text-slate-600">{blocks.morning}</span>
                              </span>
                            </p>
                            <p className="flex gap-3">
                              <Sun className="mt-0.5 size-4 shrink-0 text-[#CAA42D]" aria-hidden />
                              <span>
                                <span className="block font-bold text-[#00365F]">Afternoon</span>
                                <span className="text-slate-600">{blocks.afternoon}</span>
                              </span>
                            </p>
                            <p className="flex gap-3">
                              <Sunset
                                className="mt-0.5 size-4 shrink-0 text-[#CAA42D]"
                                aria-hidden
                              />
                              <span>
                                <span className="block font-bold text-[#00365F]">Evening</span>
                                <span className="text-slate-600">{blocks.evening}</span>
                              </span>
                            </p>
                            <p className="flex gap-3">
                              <BedDouble
                                className="mt-0.5 size-4 shrink-0 text-[#CAA42D]"
                                aria-hidden
                              />
                              <span>
                                <span className="block font-bold text-[#00365F]">Overnight</span>
                                <span className="text-slate-600">{blocks.overnight}</span>
                              </span>
                            </p>
                          </div>
                        ) : null}
                        <ul
                          className={cn(
                            "space-y-2",
                            blocks && "mt-5 border-t border-slate-200 pt-4",
                          )}
                        >
                          {d.activities.map((a) => (
                            <li key={a} className="flex gap-2 text-slate-700">
                              <Check
                                className="mt-0.5 size-4 shrink-0 text-[#CAA42D]"
                                aria-hidden
                              />
                              <span>{a}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-4 border-t border-slate-200/60 pt-3 text-xs font-semibold text-slate-500">
                          {/* The per-day detail block carries the more specific
                              line where it exists; the itinerary's own coarser
                              value is the fallback. */}
                          Meals: {blocks?.meals ?? d.meals} · Transport: {d.transport}
                        </p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </Section>

          <Section id="inclusions" title="Inclusions &amp; exclusions">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-6 border border-slate-200">
                <h3 className="text-base font-bold text-[#00365F]">What's included</h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {(detail?.inclusions ?? pkg.inclusions).map((i) => (
                    <li key={i} className="flex gap-2.5 text-slate-700">
                      <Check className="mt-0.5 size-4 shrink-0 text-[#CAA42D]" aria-hidden />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl border border-slate-200 p-6 bg-white">
                <h3 className="text-base font-bold text-[#00365F]">Not included</h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {(detail?.exclusions ?? pkg.exclusions).map((i) => (
                    <li key={i} className="flex gap-2.5 text-slate-500">
                      <X className="mt-0.5 size-4 shrink-0 text-rose-500" aria-hidden />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          {detail?.accommodation ? (
            <Section id="accommodation" title="Accommodation &amp; Hotel Tier">
              <div className="grid gap-4 rounded-3xl bg-slate-50 p-6 border border-slate-200 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Hotel Category
                  </p>
                  <p className="mt-1 font-bold text-[#00365F]">{detail.accommodation.category}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Room Type
                  </p>
                  <p className="mt-1 font-bold text-[#00365F]">{detail.accommodation.roomType}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Meal Plan
                  </p>
                  <p className="mt-1 font-bold text-[#00365F]">{detail.accommodation.mealPlan}</p>
                </div>
                {detail.accommodation.note ? (
                  <p className="text-xs text-slate-500 sm:col-span-3 border-t border-slate-200/60 pt-3">
                    {detail.accommodation.note}
                  </p>
                ) : null}
              </div>
            </Section>
          ) : null}

          {detail?.transportation?.length ? (
            <Section id="transport" title="Transportation">
              <ul className="space-y-2.5 text-sm">
                {detail.transportation.map((t) => (
                  <li
                    key={t}
                    className="flex gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-200 text-slate-700"
                  >
                    <Bus className="mt-0.5 size-4 shrink-0 text-[#CAA42D]" aria-hidden />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          <Section id="route" title="Journey Route">
            <div className="no-scrollbar flex items-center gap-3 overflow-x-auto rounded-3xl bg-slate-50 p-6 border border-slate-200">
              {pkg.route.map((r, i) => (
                <div key={r} className="flex shrink-0 items-center gap-3">
                  <span className="rounded-full border border-[#00365F]/30 bg-white px-4 py-2 text-xs font-bold text-[#00365F] shadow-sm">
                    {r}
                  </span>
                  {i < pkg.route.length - 1 ? (
                    <span className="h-0.5 w-6 bg-[#CAA42D]" aria-hidden />
                  ) : null}
                </div>
              ))}
            </div>
          </Section>

          {detail?.faqs?.length ? (
            <Section id="faqs" title="Frequently asked questions">
              <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {detail.faqs.map((f, i) => {
                  const open = openFaq === i;
                  return (
                    <div key={f.q}>
                      <button
                        type="button"
                        onClick={() => setOpenFaq(open ? -1 : i)}
                        aria-expanded={open}
                        className="flex w-full items-center justify-between gap-4 p-5 text-left"
                      >
                        <span className="font-bold text-[#00365F] text-sm sm:text-base">{f.q}</span>
                        <ChevronDown
                          className={cn(
                            "size-4 shrink-0 text-[#CAA42D] transition-transform",
                            open && "rotate-180",
                          )}
                          aria-hidden
                        />
                      </button>
                      {open && (
                        <div className="p-5 pt-0 text-sm text-slate-600 leading-relaxed bg-slate-50/50 border-t border-slate-100">
                          {f.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>
          ) : null}
        </div>

        {/* Interactive Booking Calculator Sidebar */}
        <aside className="lg:sticky lg:top-28 lg:h-fit lg:pt-16">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Calculation
                </p>
                <p className="text-2xl font-extrabold text-[#00365F] mt-1">
                  AED {estimatedTotal.toLocaleString()}
                </p>
              </div>
              <span className="rounded-full bg-[#CAA42D]/15 px-3 py-1 text-xs font-bold text-[#00365F]">
                {pkg.days}D / {pkg.nights}N
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {/* Hotel Tier Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Hotel Preference
                </label>
                <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                  {(["3-Star Comfort", "4-Star Superior", "5-Star Luxury"] as const).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setHotelTier(tier)}
                      className={cn(
                        "rounded-xl py-2 text-[11px] font-bold transition-all",
                        hotelTier === tier
                          ? "bg-[#00365F] text-white shadow-sm"
                          : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100",
                      )}
                    >
                      {tier.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Guest Counts */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Adults</span>
                    <span className="text-xs font-semibold text-slate-400">12+ yrs</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="size-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="text-sm font-bold text-[#00365F]">{adults}</span>
                    <button
                      type="button"
                      onClick={() => setAdults(adults + 1)}
                      className="size-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Children</span>
                    <span className="text-xs font-semibold text-slate-400">2-11 yrs</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="size-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="text-sm font-bold text-[#00365F]">{children}</span>
                    <button
                      type="button"
                      onClick={() => setChildren(children + 1)}
                      className="size-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <a
              href={customEnquiry}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#00365F] py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-102 hover:bg-[#00365F]"
            >
              <MessageCircle className="size-4 text-[#CAA42D]" />
              <span>Instant WhatsApp Booking</span>
            </a>

            <Link
              to="/contact"
              search={{ pkg: pkg.slug }}
              className="mt-3 block w-full rounded-xl border border-slate-200 py-2.5 text-center text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Custom Request / Group Booking
            </Link>

            <ul className="mt-6 space-y-2.5 border-t border-slate-100 pt-5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <BadgeCheck className="size-4 text-[#CAA42D] shrink-0" />
                <span>IATA Accredited Agency since 2009</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-[#CAA42D] shrink-0" />
                <span>Full Visa Assistance for UAE Residents</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="size-4 text-[#CAA42D] shrink-0" />
                <span>24/7 Dedicated Concierge Support</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Related Journeys */}
      {related.length > 0 ? (
        <section className="mx-auto mt-24 max-w-[1400px] px-5 sm:px-8">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold text-[#00365F] sm:text-3xl">You May Also Like</h2>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PackageCard key={p.slug} pkg={p} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Mobile Sticky Bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-slate-200 bg-white/95 px-5 py-3.5 backdrop-blur-md lg:hidden shadow-2xl">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-[#00365F]">{pkg.title}</p>
          <p className="text-sm font-extrabold text-[#CAA42D]">
            AED {estimatedTotal.toLocaleString()}
          </p>
        </div>
        <a
          href={customEnquiry}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-xl bg-[#00365F] px-5 py-2.5 text-xs font-bold text-white shadow-md"
        >
          Book WhatsApp
        </a>
      </div>
    </article>
  );
}
