import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, ChevronDown, MessageCircle, Phone, Plane, ShieldCheck, Headset } from "lucide-react";
import { BRAND, packages, priceParts, waLink } from "@/data/catalogue";
import { countries } from "@/data/countries";
import { inboundActivities } from "@/data/inbound";
import { offices } from "@/data/catalogue-brand";
import { CinematicHero, type HeroClip } from "@/components/site/CinematicHero";
import { EnquiryBar } from "@/components/site/EnquiryBar";
import { ScrollMarquee, type MarqueeItem } from "@/components/site/ScrollMarquee";
import { ScrollRevealText } from "@/components/site/ScrollRevealText";
import { StackingItineraries, type StackCard } from "@/components/site/StackingItineraries";
import { ScrollJourneyFilm } from "@/components/site/ScrollJourneyFilm";
import { PaperBackdrop } from "@/components/site/PaperBackdrop";
import { Magnet } from "@/components/site/Magnet";
import { ArrowBadgeLink } from "@/components/site/ArrowBadgeLink";
import { PixelRevealCard, type PixelCard } from "@/components/site/PixelRevealCard";
import { Reveal } from "@/components/site/Reveal";
import { cn } from "@/lib/utils";
import { absoluteUrl } from "@/lib/site";

const FAQS = [
  {
    q: "What is included in a package price?",
    a: "Return flights, hotels with daily breakfast, private airport transfers, the excursions listed on the itinerary, entrance passes and visa processing. Anything not included is written on the quote, so there is nothing to discover later.",
  },
  {
    q: "Can I change the itinerary?",
    a: "Yes — published itineraries are starting points. Add nights, upgrade the room, drop an excursion or move the dates, and we re-quote until it is the trip you actually want.",
  },
  {
    q: "Where do the flights depart from?",
    a: `Most travellers fly from Dubai International (DXB), but as an IATA agency and flydubai GSA we also ticket from Kabul, Jeddah and across the GCC with connecting flights.`,
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nawi Saadi Travel & Tourism — Luxury Worldwide Holidays from Dubai" },
      {
        name: "description",
        content:
          "IATA-accredited travel agency in Deira, Dubai since 2009. Curated worldwide holiday packages to Switzerland, Japan, Maldives, Georgia, Turkey, Azerbaijan and VIP Umrah — flights, hotels, transfers and visas handled by one team.",
      },
      {
        property: "og:title",
        content: "Nawi Saadi Travel & Tourism — Luxury Worldwide Holidays from Dubai",
      },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/") }],
    scripts: [
      {
        // The same three questions the page renders. Answer engines quote
        // FAQPage entries directly, so the text here must match what a visitor
        // actually sees — duplicating or embellishing it is a manual action.
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: Home,
});

/**
 * Landing page.
 *
 * Built around depth and pacing rather than WebGL. Earlier versions leaned on a
 * rotating globe and a pinned 3D card arc; both were heavy, both restated
 * content shown elsewhere on the page, and neither survived review. What
 * replaces them is scroll motion that serves the photography — images drift
 * inside their frames at a different rate to the page, sections reveal as they
 * enter, and the section shapes alternate so scrolling has rhythm.
 *
 * Section order is a funnel, and each fact appears exactly once:
 *   hero      full-bleed video (the only dark surface above the close)
 *   enquiry   a working destination / month / travellers bar over the hero
 *   editorial two large alternating destination features with parallax
 *   packages  the actual product, priced
 *   uae       Dubai day-trip rail
 *   assurance three reasons, stated once
 *   close     navy contact block
 *   faq       three questions, not ten
 *
 * Palette is sampled from the live nawisaadi.com: #FFFFFF ground, #F8F8F8
 * alternating band, #00365F navy, #CAA42D gold, #666666 body copy.
 */
function Home() {
  return (
    <div className="bg-[#FFFFFF] text-[#353844]">
      <Hero />
      <EnquiryBar />
      <PhotoBand />
      <StatementBand />
      {/* The statement promises the whole trip is handled; the film shows it,
          then the itineraries below are the thing being sold. */}
      <ScrollJourneyFilm />
      <SignatureItineraries />
      <PackageGrid />
      <UaeRail />
      <Assurance />
      <ContactClose />
      <Faq />
    </div>
  );
}

/* ---------------------------------------------------------------- *
 * Section furniture
 * ---------------------------------------------------------------- */

function Eyebrow({ children, onDark = false }: { children: React.ReactNode; onDark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-10 bg-[#CAA42D]" />
      <p
        className={cn(
          "font-sans text-[11px] font-semibold uppercase tracking-[0.22em]",
          onDark ? "text-[#DDBE5E]" : "text-[#8F7420]",
        )}
      >
        {children}
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- *
 * Hero
 * ---------------------------------------------------------------- */

function Hero() {
  const clips: HeroClip[] = [
    {
      src: "/videos/girl-travel-2.mp4",
      poster: "/images/dst/view-at-the-top-burj-khalifa-at-the-top-1.webp",
      place: "Departing Dubai",
    },
    {
      src: "/videos/girl-travel-1.mp4",
      poster: "/images/destinations/hero-switzerland.jpg",
      place: "Arriving Worldwide",
    },
  ];
  return <CinematicHero clips={clips} />;
}

/* ---------------------------------------------------------------- *
 * Photo band — two rows of destination photography that slide in
 * opposite directions as the page scrolls past them.
 * ---------------------------------------------------------------- */

function PhotoBand() {
  const { rowA, rowB } = useMemo(() => {
    // Real catalogue photography only, de-duplicated so the same picture never
    // appears twice in one strip.
    const seen = new Set<string>();
    const pool: MarqueeItem[] = [];
    for (const p of packages) {
      if (!p.image || seen.has(p.image)) continue;
      seen.add(p.image);
      pool.push({ src: p.image, alt: `${p.country} — ${p.title}` });
    }
    const half = Math.ceil(pool.length / 2);
    return { rowA: pool.slice(0, half), rowB: pool.slice(half) };
  }, []);

  if (!rowA.length) return null;

  return (
    <section className="bg-[#FFFFFF] pt-20 sm:pt-28">
      <ScrollMarquee rowA={rowA} rowB={rowB} />
    </section>
  );
}

/* ---------------------------------------------------------------- *
 * Statement — one sentence that brightens word by word on scroll.
 * ---------------------------------------------------------------- */

function StatementBand() {
  return (
    <section className="relative bg-[#FFFFFF] py-24 sm:py-32">
      <PaperBackdrop />
      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <span className="inline-block bg-[#00365F] px-4 py-1.5 font-sans text-[12px] font-semibold tracking-wide text-white">
              Since {BRAND.founded}
            </span>
          </Reveal>
          <ScrollRevealText
            text={`We are a licensed Dubai travel agency, not a booking site. Flights, hotels, transfers and visas are arranged together by one consultant who stays with your trip until you are home.`}
            className="mt-8 font-display text-[clamp(1.4rem,3.4vw,2.9rem)] font-normal leading-[1.3] tracking-tight text-[#00365F]"
          />
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- *
 * Signature itineraries — cards that stack and scale as you scroll.
 * ---------------------------------------------------------------- */

const FEATURES = [
  { slug: "swiss-alpine-dream" },
  { slug: "maldives-overwater-escape" },
  { slug: "japan-golden-route" },
  { slug: "cappadocia-sky-turkey" },
] as const;

function SignatureItineraries() {
  const cards = useMemo<StackCard[]>(() => {
    const bySlug = new Map(packages.map((p) => [p.slug, p]));
    return FEATURES.map((f, i) => {
      const p = bySlug.get(f.slug);
      if (!p) return null;
      const price = priceParts(p);
      return {
        slug: p.slug,
        index: String(i + 1).padStart(2, "0"),
        country: p.country,
        title: p.title,
        intro: p.intro,
        nights: p.nights,
        days: p.days,
        price: price.amount,
        priceLabel: price.eyebrow,
        image: p.image,
      };
    }).filter((c) => c !== null);
  }, []);

  if (!cards.length) return null;

  return (
    <section className="bg-[#FFFFFF] pb-24 sm:pb-32">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <Reveal>
          <div className="max-w-3xl pb-12">
            <Eyebrow>Signature itineraries</Eyebrow>
            <h2 className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3.4rem)] leading-[1.08] tracking-tight text-[#00365F]">
              Trips we plan end to end, so you only{" "}
              <span className="italic text-[#8F7420]">pack a bag</span>
            </h2>
          </div>
        </Reveal>

        <StackingItineraries cards={cards} />
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- *
 * Package grid — pixel-dissolve cards
 * ---------------------------------------------------------------- */

function PackageGrid() {
  const grid = useMemo<PixelCard[]>(() => {
    // Skip anything already given a full stacking card above.
    const shown = new Set<string>(FEATURES.map((f) => f.slug));
    return packages
      .filter((p) => !shown.has(p.slug))
      .slice(0, 6)
      .map((p) => {
        const price = priceParts(p);
        return {
          slug: p.slug,
          title: p.title,
          country: p.country,
          meta: `${p.days} days · ${p.nights} nights`,
          price: price.amount,
          priceLabel: price.eyebrow,
          image: p.image,
        };
      });
  }, []);

  return (
    <section className="border-y border-[#E5E5E5] bg-[#F8F8F8] py-20 sm:py-28">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <div className="min-w-0">
              <Eyebrow>Popular right now</Eyebrow>
              <h2 className="mt-3 font-display text-[clamp(1.9rem,4.4vw,3.4rem)] leading-[1.08] tracking-tight text-[#00365F]">
                More ways to <span className="italic text-[#8F7420]">get away</span>
              </h2>
            </div>
          </Reveal>
          <ArrowBadgeLink to="/holidays" className="shrink-0">
            All {packages.length} packages
          </ArrowBadgeLink>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {grid.map((c, i) => (
            <Reveal key={c.slug} delay={i * 60}>
              <PixelRevealCard card={c} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- *
 * UAE rail
 * ---------------------------------------------------------------- */

function UaeRail() {
  const picks = useMemo(
    () =>
      inboundActivities
        .filter((a) => typeof a.fromPrice === "number")
        .sort((a, b) => (a.fromPrice ?? 0) - (b.fromPrice ?? 0))
        .slice(0, 10),
    [],
  );

  return (
    <section className="bg-[#FFFFFF] py-20 sm:py-24">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0">
            <Eyebrow>While you&apos;re in the Emirates</Eyebrow>
            <h2 className="mt-3 font-display text-3xl leading-[1.1] text-[#00365F] sm:text-5xl">
              Dubai &amp; Abu Dhabi <span className="italic text-[#8F7420]">day experiences</span>
            </h2>
          </div>
          <ArrowBadgeLink to="/activities" className="shrink-0">
            All tours &amp; passes
          </ArrowBadgeLink>
        </div>
      </div>

      {/* Trailing padding, never a negative margin — that widens the document
          past the viewport and produces a horizontal scrollbar. */}
      <div className="mx-auto mt-10 max-w-[1400px] px-5 sm:px-8">
        <div className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2">
          {picks.map((a) => (
            <Link
              key={a.slug}
              to="/activities/$slug"
              params={{ slug: a.slug }}
              className="group w-[260px] shrink-0 snap-start overflow-hidden rounded-3xl border border-[#E5E5E5] bg-white shadow-sm transition-all duration-300 hover:border-[#CAA42D] hover:shadow-xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#F8F8F8]">
                <img
                  src={a.image}
                  alt={a.title}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <span className="absolute right-3 top-3 rounded-full bg-white/92 px-2.5 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-[#00365F] backdrop-blur-sm">
                  {a.emirate}
                </span>
              </div>
              <div className="p-5">
                <p className="line-clamp-2 font-display text-base leading-snug text-[#00365F] transition-colors group-hover:text-[#8F7420]">
                  {a.title}
                </p>
                <p className="mt-3 font-sans text-sm font-bold text-[#00365F]">
                  {typeof a.fromPrice === "number"
                    ? `From AED ${a.fromPrice.toLocaleString()}`
                    : "On request"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- *
 * Assurance — three reasons, each stated once.
 * ---------------------------------------------------------------- */

const REASONS = [
  {
    icon: Plane,
    title: "We issue the tickets ourselves",
    body: `An IATA-accredited agency and flydubai's General Sales Agent in Afghanistan, ticketing directly with the major carriers rather than reselling someone else's fare.`,
  },
  {
    icon: ShieldCheck,
    title: "Visas handled in-house",
    body: "Schengen, UK, USA, Japan and Umrah visas prepared, submitted and chased by our own specialists — alongside UAE tourist and transit visas we issue directly.",
  },
  {
    icon: Headset,
    title: "One consultant, start to finish",
    body: "The person who quotes your trip stays with it until you are home, reachable on WhatsApp while you travel. Not a ticket queue, and not a different agent each time.",
  },
];

function Assurance() {
  return (
    <section className="border-y border-[#E5E5E5] bg-[#F8F8F8] py-20 sm:py-24">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-20">
          <div className="min-w-0">
            <Eyebrow>Why book with us</Eyebrow>
            <h2 className="mt-3 font-display text-3xl leading-[1.1] text-[#00365F] sm:text-4xl">
              A licensed agency, <span className="italic text-[#8F7420]">not a marketplace</span>
            </h2>
            <p className="mt-4 font-sans text-sm leading-relaxed text-[#666666]">
              Trading from Deira since {BRAND.founded}, with {offices.length} offices and{" "}
              {countries.length}+ destinations on the books.
            </p>
          </div>

          <ol className="min-w-0 border-t border-[#E5E5E5]">
            {REASONS.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="border-b border-[#E5E5E5]">
                <Reveal delay={i * 70}>
                  <div className="group flex gap-6 py-7">
                    <span className="mt-1 shrink-0 font-sans text-sm font-bold tabular-nums text-[#CAA42D]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-xl text-[#00365F]">{title}</h3>
                      <p className="mt-2 font-sans text-sm leading-relaxed text-[#666666]">{body}</p>
                    </div>
                    <Icon className="mt-1 size-5 shrink-0 text-[#E5E5E5] transition-colors group-hover:text-[#CAA42D]" />
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- *
 * Close
 * ---------------------------------------------------------------- */

/**
 * Closing call to action.
 *
 * Deliberately quiet and typographic. Two earlier versions put the suitcase
 * sequence in here — first as a floating card, then as a full-bleed half — and
 * both fought the page rather than closing it. By this point the reader has
 * already been through the marquee, the scroll film, the stacking cards, the
 * package grid and the UAE rail; another moving image is noise, and the one
 * thing this band has to do is make the next step obvious.
 *
 * So: the ask and the two ways to make it. Nothing else — the office list that
 * used to sit under the buttons was the page's third mention of the same three
 * cities, and it belongs in the footer.
 */
function ContactClose() {
  return (
    <section className="bg-[#00365F] py-24 text-white sm:py-32">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex justify-center">
            <Eyebrow onDark>Start planning</Eyebrow>
          </div>

          <h2 className="mt-6 font-display leading-[1.06] text-white [font-size:clamp(2rem,4.6vw,3.6rem)]">
            Tell us the country and the dates &mdash; we&apos;ll do{" "}
            <span className="italic text-[#DDBE5E]">the rest</span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl font-sans text-sm leading-relaxed text-white/70 sm:text-base">
            A senior consultant comes back with a full itinerary and one all-in price. No
            obligation, and no automated reply.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Magnet padding={70} strength={4}>
              <a
                href={waLink("Hi Nawi Saadi, I'd like help planning a holiday.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#CAA42D] px-8 py-4 font-sans text-sm font-bold text-[#00365F] transition-colors hover:bg-[#DDBE5E]"
              >
                <MessageCircle className="size-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </Magnet>
            <Magnet padding={70} strength={4}>
              <a
                href={`tel:${BRAND.phone.replace(/\s/g, "")}`}
                className="liquid-glass inline-flex items-center gap-2 rounded-xl px-8 py-4 font-sans text-sm font-semibold text-white transition-colors hover:bg-white/15"
              >
                <Phone className="size-4 text-[#CAA42D]" />
                <span>{BRAND.phone}</span>
              </a>
            </Magnet>
          </div>

        </div>
      </div>
    </section>
  );
}


/* ---------------------------------------------------------------- *
 * FAQ — three questions, not ten
 * ---------------------------------------------------------------- */


function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative bg-[#FFFFFF] py-20 sm:py-24">
      <PaperBackdrop />
      <div className="relative mx-auto grid max-w-[1400px] gap-x-16 gap-y-10 px-5 sm:px-8 lg:grid-cols-[minmax(0,22rem)_1fr]">
        <div className="min-w-0">
          <Eyebrow>Before you book</Eyebrow>
          <h2 className="mt-3 font-display text-3xl leading-tight text-[#00365F] sm:text-4xl">
            Common questions
          </h2>
          <p className="mt-4 font-sans text-sm leading-relaxed text-[#666666]">
            Anything not covered here, ask us directly — a consultant answers, not a bot.
          </p>
        </div>

        <div className="min-w-0 border-t border-[#E5E5E5]">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={faq.q} className="border-b border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="group flex w-full items-center justify-between gap-6 py-5 text-left"
                >
                  <span className="font-display text-lg text-[#00365F] transition-colors group-hover:text-[#8F7420]">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-5 shrink-0 text-[#CAA42D] transition-transform duration-300",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
                {isOpen ? (
                  <p className="-mt-1 max-w-2xl pb-5 font-sans text-sm leading-relaxed text-[#666666]">
                    {faq.a}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
