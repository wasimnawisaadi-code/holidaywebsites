import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Compass,
  Heart,
  MessageCircle,
  Plane,
  Sparkles,
  Users,
} from "lucide-react";
import { BRAND, waLink } from "@/data/catalogue-brand";
import { Reveal } from "@/components/site/Reveal";
import { PageHero } from "@/components/site/PageHero";
import { cn } from "@/lib/utils";
import { absoluteUrl } from "@/lib/site";
import { submitLead } from "@/lib/leads";

const title = `Customized Tours & Tailor-Made Holidays | ${BRAND.short}`;
const description =
  "Build a tailor-made holiday from Dubai on your dates, at your pace, to your budget. Honeymoons, family trips, corporate and multi-country journeys.";

export const Route = createFileRoute("/customized-tours")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl("/customized-tours") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/customized-tours") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Customized Tours & Tailor-Made Holidays",
          serviceType: "Tailor-made travel planning",
          areaServed: "United Arab Emirates",
          provider: { "@type": "TravelAgency", name: BRAND.name },
          description,
        }),
      },
    ],
  }),
  component: CustomizedToursPage,
});

/**
 * Rebuilt around one idea: this page is a brief, so it should look like a
 * form on paper, not a stack of shadowed white panels.
 *
 * What was removed and why:
 *   - a WhatsApp-green (#25D366) submit button on a non-WhatsApp action
 *   - a blurred gold "glow blob" floating over a light background
 *   - an empty leftover <div> from a deleted suitcase animation
 *   - the 3D budget calculator, which invented prices we do not quote
 *   - font-black / font-extrabold headings fighting the Playfair 500 rule
 */

const tripTypes = [
  {
    id: "honeymoon",
    label: "Honeymoon & romance",
    icon: Heart,
    note: "Private villas, scenic pacing",
  },
  { id: "family", label: "Family holiday", icon: Users, note: "Kid-friendly pacing & suites" },
  { id: "group", label: "Group / friends", icon: Compass, note: "Private coach, shared itinerary" },
  {
    id: "corporate",
    label: "Corporate / MICE",
    icon: Plane,
    note: "Flights, meetings & logistics",
  },
  { id: "multi", label: "Multi-country tour", icon: Sparkles, note: "Two or more destinations" },
  {
    id: "luxury",
    label: "Five-star luxury",
    icon: BadgeCheck,
    note: "Top-tier hotels & chauffeur",
  },
] as const;

const styleOptions = [
  "Relaxed",
  "Balanced sights & leisure",
  "Fast-paced",
  "Adventure",
  "Culture & heritage",
  "Beach",
];

const budgets = [
  "Under AED 3,000 per person",
  "AED 3,000 – 6,000 per person",
  "AED 6,000 – 12,000 per person",
  "AED 12,000+ per person",
  "Flexible",
];

const inclusionOptions = [
  "Flights",
  "Hotels",
  "Airport transfers",
  "Private car with driver",
  "Tour guide",
  "Visa handling",
  "Travel insurance",
  "Restaurant bookings",
];

const process = [
  {
    step: "01",
    title: "Tell us the outline",
    body: "Dates, travellers, destinations and how you like to travel. Two minutes on this page, or straight to WhatsApp.",
  },
  {
    step: "02",
    title: "We build the itinerary",
    body: "A travel manager puts together a day-by-day plan with named hotels and real flight times, usually within 24 hours.",
  },
  {
    step: "03",
    title: "We change what you want",
    body: "Swap hotels, add nights, change cabin class. The itinerary is revised until it is the trip you actually want.",
  },
  {
    step: "04",
    title: "You travel",
    body: "Tickets, visas and vouchers issued, with a named contact reachable on WhatsApp for the whole trip.",
  },
];

function CustomizedToursPage() {
  const [type, setType] = useState<string>("honeymoon");
  const [style, setStyle] = useState(styleOptions[1]!);
  const [budget, setBudget] = useState(budgets[1]!);
  const [incl, setIncl] = useState<string[]>(["Flights", "Hotels", "Airport transfers"]);
  const [dest, setDest] = useState("");
  const [dates, setDates] = useState("");
  const [pax, setPax] = useState("2");
  const [notes, setNotes] = useState("");

  const toggle = (v: string) =>
    setIncl((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]));

  const message = useMemo(() => {
    const label = tripTypes.find((t) => t.id === type)?.label ?? "Custom trip";
    return [
      `Hi ${BRAND.short}, I'd like a customized tour.`,
      `Trip type: ${label}`,
      `Destination(s): ${dest || "Open to suggestions"}`,
      `Travel dates: ${dates || "Flexible"}`,
      `Travellers: ${pax}`,
      `Pace: ${style}`,
      `Budget: ${budget}`,
      `Include: ${incl.length ? incl.join(", ") : "To be advised"}`,
      notes ? `Notes: ${notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [type, dest, dates, pax, style, budget, incl, notes]);

  return (
    <div className="bg-[#FFFFFF] pb-24 text-[#353844]">
      <PageHero
        crumbs={[{ label: "Home", to: "/" }, { label: "Tailor-made" }]}
        eyebrow="Tailor-made"
        title={
          <>
            Tell us the trip. <span className="italic text-[#DDBE5E]">We build it.</span>
          </>
        }
        intro="No fixed departures. Give us your destinations, dates and how you like to travel, and a travel manager in Deira builds the itinerary around you."
        image="/images/destinations/maldives-villas.webp"
        imageAlt="Overwater villas on a tailor-made Maldives itinerary"
      />

      {/* How it works — numbered rows, not four shadowed tiles */}
      <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8">
        <div className="grid gap-x-16 gap-y-8 lg:grid-cols-[minmax(0,18rem)_1fr]">
          <h2 className="font-display text-3xl leading-[1.08] font-medium sm:text-4xl">
            How it
            <br />
            works.
          </h2>

          <div className="divide-y divide-[#e3ded4] border-y border-[#e3ded4]">
            {process.map((p, i) => (
              <Reveal key={p.step} delay={i * 60}>
                <div className="flex gap-6 py-6 sm:gap-10">
                  <span className="font-display text-sm font-medium text-[#6B6355] tabular-nums">
                    {p.step}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-medium">{p.title}</h3>
                    <p className="mt-2 max-w-2xl font-sans text-sm leading-relaxed text-[#5f584f]">
                      {p.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* The brief */}
      <section id="brief" className="border-t border-[#e3ded4] bg-[#FFFFFF] py-20 scroll-mt-28">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_360px] lg:items-start">
          <div>
            <p className="font-sans text-[11px] font-medium tracking-[0.24em] text-[#7A641B] uppercase">
              Your brief
            </p>
            <h2 className="mt-3 font-display text-3xl font-medium sm:text-4xl">Design your trip</h2>

            <fieldset className="mt-10">
              <legend className="font-sans text-[10px] font-semibold tracking-[0.16em] text-[#6B6355] uppercase">
                What kind of trip?
              </legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tripTypes.map((t) => {
                  const Icon = t.icon;
                  const on = type === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setType(t.id)}
                      className={cn(
                        "rounded-sm border p-4 text-left transition-colors",
                        on
                          ? "border-[#12293f] bg-white"
                          : "border-[#ded7c9] bg-white/60 hover:border-[#c2b9a8]",
                      )}
                    >
                      <Icon
                        className={cn("size-5", on ? "text-[#12293f]" : "text-[#7A641B]")}
                        aria-hidden
                      />
                      <span className="mt-3 block font-sans text-sm font-semibold text-[#353844]">
                        {t.label}
                      </span>
                      <span className="mt-1 block font-sans text-xs text-[#6B6355]">{t.note}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-9 grid gap-5 sm:grid-cols-2">
              <Labelled label="Destination(s)">
                <input
                  value={dest}
                  onChange={(e) => setDest(e.target.value)}
                  placeholder="e.g. Switzerland + Paris, or Maldives"
                  className={inputCls}
                />
              </Labelled>
              <Labelled label="Travel dates / month">
                <input
                  value={dates}
                  onChange={(e) => setDates(e.target.value)}
                  placeholder="e.g. October 2026, or flexible"
                  className={inputCls}
                />
              </Labelled>
              <Labelled label="Number of travellers">
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={pax}
                  onChange={(e) => setPax(e.target.value)}
                  className={inputCls}
                />
              </Labelled>
              <Labelled label="Budget">
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className={inputCls}
                >
                  {budgets.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </Labelled>
            </div>

            <fieldset className="mt-9">
              <legend className="font-sans text-[10px] font-semibold tracking-[0.16em] text-[#6B6355] uppercase">
                Pace &amp; style
              </legend>
              <div className="mt-4 flex flex-wrap gap-2">
                {styleOptions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={style === s}
                    onClick={() => setStyle(s)}
                    className={cn(
                      "rounded-sm border px-4 py-2 font-sans text-xs font-medium transition-colors",
                      style === s
                        ? "border-[#12293f] bg-[#00365F] text-white"
                        : "border-[#ded7c9] bg-white text-[#4c4741] hover:border-[#c2b9a8]",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-9">
              <legend className="font-sans text-[10px] font-semibold tracking-[0.16em] text-[#6B6355] uppercase">
                What should be included?
              </legend>
              <div className="mt-4 flex flex-wrap gap-2">
                {inclusionOptions.map((o) => {
                  const on = incl.includes(o);
                  return (
                    <button
                      key={o}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(o)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-sm border px-4 py-2 font-sans text-xs font-medium transition-colors",
                        on
                          ? "border-[#8F7420] bg-[#8F7420]/12 text-[#353844]"
                          : "border-[#ded7c9] bg-white text-[#4c4741] hover:border-[#c2b9a8]",
                      )}
                    >
                      {on && <Check className="size-3.5 text-[#7A641B]" aria-hidden />}
                      <span>{o}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-9">
              <Labelled label="Anything else?">
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anniversary surprises, room preferences, preferred airlines, dietary requirements…"
                  className={inputCls}
                />
              </Labelled>
            </div>
          </div>

          {/* Summary */}
          <div className="border border-[#ded7c9] bg-white p-7 lg:sticky lg:top-28">
            <p className="font-sans text-[10px] font-semibold tracking-[0.16em] text-[#7A641B] uppercase">
              Your brief so far
            </p>
            <h3 className="mt-2 font-display text-xl font-medium">
              {tripTypes.find((t) => t.id === type)?.label}
            </h3>

            <dl className="mt-6 space-y-3">
              <Row k="Destination" v={dest || "Open to suggestions"} />
              <Row k="Dates" v={dates || "Flexible"} />
              <Row k="Travellers" v={pax} />
              <Row k="Pace" v={style} />
              <Row k="Budget" v={budget} />
              <Row k="Inclusions" v={incl.length ? `${incl.length} selected` : "To be advised"} />
            </dl>

            <a
              href={waLink(message)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                submitLead({
                  email: `custom-tour-${Date.now()}@lead.nawisaadiholidays.com`,
                  source: "custom_tour",
                  path: "/customized-tours",
                  detail: {
                    type: tripTypes.find((t) => t.id === type)?.label,
                    destination: dest || "Open",
                    dates: dates || "Flexible",
                    travellers: pax,
                    style,
                    budget,
                    inclusions: incl,
                  },
                }).catch(() => {});
              }}
              className="mt-7 flex items-center justify-center gap-2 rounded-sm bg-[#00365F] px-5 py-3.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-[#8F7420]"
            >
              <MessageCircle className="size-4" aria-hidden />
              <span>Send brief on WhatsApp</span>
            </a>

            <Link
              to="/contact"
              className="group mt-3 flex items-center justify-center gap-1.5 rounded-sm border border-[#ded7c9] px-5 py-3 font-sans text-xs font-medium text-[#4c4741] transition-colors hover:border-[#8F7420] hover:text-[#7A641B]"
            >
              <span>Or contact the Deira office</span>
              <ArrowRight className="size-3.5 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>

            <p className="mt-6 border-t border-[#e3ded4] pt-5 font-sans text-[11px] leading-relaxed text-[#6B6355]">
              The consultation and first itinerary draft are free. IATA accredited agency, member
              #2009.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

const inputCls =
  "w-full rounded-sm border border-[#ded7c9] bg-white px-4 py-3 font-sans text-sm text-[#353844] outline-none transition-colors focus:border-[#8F7420]";

function Labelled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-sans text-[10px] font-semibold tracking-[0.16em] text-[#6B6355] uppercase">
        {label}
      </span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[#e3ded4] pb-2.5">
      <dt className="shrink-0 font-sans text-xs text-[#6B6355]">{k}</dt>
      <dd className="text-right font-sans text-xs font-medium text-[#353844]">{v}</dd>
    </div>
  );
}
