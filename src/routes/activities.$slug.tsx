import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Bus,
  Check,
  ChevronDown,
  Clock,
  Info,
  MapPin,
  MessageCircle,
  Plus,
  Minus,
  ShieldCheck,
  Sparkles,
  Zap,
  X,
} from "lucide-react";
import { BRAND, waLink } from "@/data/catalogue";
import { inboundActivities, inboundBySlug, inboundFrom } from "@/data/inbound";
import { ActivityCard } from "@/components/site/ActivityCard";
import { Reveal } from "@/components/site/Reveal";
import { cn } from "@/lib/utils";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/activities/$slug")({
  loader: ({ params }) => {
    const activity = inboundBySlug(params.slug);
    if (!activity) throw notFound();
    return { activity };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Activity unavailable" }, { name: "robots", content: "noindex" }] };
    }
    const a = loaderData.activity;
    const title = `${a.title} — ${a.emirate} | Book with ${BRAND.short}`;
    const description = a.overview.slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:url", content: absoluteUrl(`/activities/${params.slug}`) },
        { property: "og:image", content: absoluteUrl(a.image) },
        { name: "twitter:image", content: absoluteUrl(a.image) },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: absoluteUrl(`/activities/${params.slug}`) }],
      scripts: [
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
                name: "Dubai & UAE",
                item: absoluteUrl("/activities"),
              },
              { "@type": "ListItem", position: 3, name: a.title },
            ],
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristAttraction",
            name: a.title,
            description: a.overview,
            address: { "@type": "PostalAddress", addressLocality: a.emirate, addressCountry: "AE" },
            ...(a.fromPrice
              ? {
                  offers: {
                    "@type": "Offer",
                    price: a.fromPrice,
                    priceCurrency: "AED",
                    availability: "https://schema.org/InStock",
                  },
                }
              : {}),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: a.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
      ],
    };
  },
  component: ActivityPage,
  notFoundComponent: ActivityNotFound,
});

function ActivityNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-5 pt-40 pb-24 text-center">
      <h1 className="text-display text-4xl">Activity not found</h1>
      <Link
        to="/activities"
        className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground"
      >
        Browse all activities
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
      <Reveal className="mt-14">
        <h2 className="font-display text-2xl font-bold text-accent sm:text-3xl">{title}</h2>
        <div className="mt-5">{children}</div>
      </Reveal>
    </div>
  );
}

function ActivityPage() {
  const { activity: a } = Route.useLoaderData();
  const [shot, setShot] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);

  // Ticket selection state
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const selectedOption = a.options[selectedOptionIndex] || a.options[0];
  const adultPrice = selectedOption?.adult || a.fromPrice || 0;
  const childPrice = selectedOption?.child || 0;

  const totalPrice = useMemo(() => {
    return adults * adultPrice + children * childPrice;
  }, [adults, children, adultPrice, childPrice]);

  const customEnquiry = useMemo(() => {
    const optLabel = selectedOption?.label || "General Admission";
    const msg = `Hi ${BRAND.short}, I'd like to book "${a.title}" in ${a.emirate}.\n- Option: ${optLabel}\n- Guests: ${adults} Adult(s)${children > 0 ? `, ${children} Child(ren)` : ""}\n- Estimated Total: AED ${totalPrice.toLocaleString()}\nPlease confirm availability and share the payment/voucher details.`;
    return waLink(msg);
  }, [a, selectedOption, adults, children, totalPrice]);

  const related = inboundActivities
    .filter((x) => x.slug !== a.slug && x.category === a.category)
    .slice(0, 4);
  const gallery = a.gallery.length ? a.gallery : [a.image];

  return (
    <article className="pb-32 pt-24">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <Link
          to="/activities"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
        >
          <ArrowLeft className="size-4" aria-hidden /> All activities &amp; tours
        </Link>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-secondary px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
            {a.category}
          </span>
          {a.badge ? (
            <span className="rounded-full bg-[#CAA42D] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#00365F]">
              {a.badge}
            </span>
          ) : null}
        </div>
        <h1 className="text-display mt-3 max-w-4xl text-3xl font-extrabold sm:text-5xl text-[#00365F]">
          {a.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-4 text-[#CAA42D]" aria-hidden />
            {a.emirate}, UAE
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock className="size-4 text-[#CAA42D]" aria-hidden />
            {a.duration}
          </span>
          {a.instantConfirm ? (
            <span className="inline-flex items-center gap-2 font-medium text-[#CAA42D]">
              <BadgeCheck className="size-4" aria-hidden /> Instant Barcode Confirmation
            </span>
          ) : null}
        </div>
      </div>

      {/* 4 high-quality images gallery */}
      <div className="mx-auto mt-8 max-w-[1400px] px-5 sm:px-8">
        <div className="grid gap-3 lg:grid-cols-[2.2fr_1fr]">
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-slate-100 shadow-md">
            <img
              src={gallery[shot] ?? a.image}
              alt={`${a.title} — view ${shot + 1}`}
              width={1600}
              height={1000}
              className="size-full object-cover transition-all duration-500"
            />
          </div>
          <div className="grid grid-cols-4 gap-3 lg:grid-cols-2">
            {gallery.slice(0, 4).map((g, i) => (
              <button
                key={`${g}-${i}`}
                type="button"
                onClick={() => setShot(i)}
                aria-label={`Show image ${i + 1}`}
                className={cn(
                  "relative aspect-[4/3] overflow-hidden rounded-2xl ring-2 transition-all cursor-pointer bg-slate-100",
                  shot === i ? "ring-[#00365F] shadow-md" : "ring-transparent hover:ring-[#00365F]/40 opacity-80 hover:opacity-100",
                )}
              >
                <img src={g} alt="" className="size-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1400px] gap-14 px-5 pt-4 sm:px-8 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <Section id="overview" title="Overview">
            <p className="text-lg leading-relaxed text-slate-700">{a.overview}</p>
          </Section>

          <Section id="highlights" title="Top highlights">
            <ul className="grid gap-3 sm:grid-cols-2">
              {a.highlights.map((h) => (
                <li
                  key={h}
                  className="flex gap-3 rounded-2xl bg-slate-50 p-4 text-sm border border-slate-200/80"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-[#CAA42D]" aria-hidden />
                  <span className="text-slate-800 font-medium">{h}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="itinerary" title="How the experience runs">
            <ol className="border-l-2 border-[#CAA42D]/40 pl-6 space-y-6">
              {a.timeline.map((t) => (
                <li key={t.time} className="relative">
                  <span
                    className="absolute -left-[31px] top-1 size-3.5 rounded-full border-2 border-[#CAA42D] bg-white"
                    aria-hidden
                  />
                  <p className="text-xs font-bold uppercase tracking-wider text-[#CAA42D]">{t.time}</p>
                  <p className="mt-1 text-sm text-slate-700 font-medium">{t.detail}</p>
                </li>
              ))}
            </ol>
          </Section>

          <Section id="pricing" title="Prices &amp; ticket options">
            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-[#00365F]">
                  <tr>
                    <th className="px-4 py-3.5 font-bold">Ticket Option</th>
                    <th className="px-4 py-3.5 font-bold">Adult Price</th>
                    <th className="px-4 py-3.5 font-bold">Child Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {a.options.map((o, idx) => (
                    <tr
                      key={o.label}
                      onClick={() => setSelectedOptionIndex(idx)}
                      className={cn(
                        "cursor-pointer transition-colors",
                        selectedOptionIndex === idx ? "bg-[#00365F]/5" : "hover:bg-slate-50",
                      )}
                    >
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-[#00365F]">{o.label}</span>
                        {o.note ? (
                          <span className="mt-0.5 block text-xs text-slate-500">{o.note}</span>
                        ) : null}
                        {o.unit && o.unit !== "per person" ? (
                          <span className="mt-0.5 block text-xs text-[#CAA42D] font-semibold">{o.unit}</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-bold text-[#00365F]">
                        {o.adult ? `AED ${o.adult.toLocaleString()}` : "On request"}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-600">
                        {o.child ? `AED ${o.child.toLocaleString()}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              * Official DTCM contracted rates. Instant digital mobile voucher delivered to your WhatsApp.
            </p>
          </Section>

          <Section id="inclusions" title="Inclusions &amp; exclusions">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-6 border border-slate-200">
                <h3 className="text-base font-bold text-[#00365F]">What's included</h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {a.inclusions.map((i) => (
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
                  {a.exclusions.map((i) => (
                    <li key={i} className="flex gap-2.5 text-slate-500">
                      <X className="mt-0.5 size-4 shrink-0 text-rose-500" aria-hidden />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          <Section id="transport" title="Transportation">
            <ul className="space-y-2.5 text-sm">
              {a.transportation.map((t) => (
                <li key={t} className="flex gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-200 text-slate-700">
                  <Bus className="mt-0.5 size-4 shrink-0 text-[#CAA42D]" aria-hidden />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="info" title="Important information">
            <div className="grid gap-4 sm:grid-cols-2">
              {a.importantInfo.map((n) => (
                <div key={n.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="flex items-center gap-2 font-bold text-[#00365F]">
                    <Info className="size-4 shrink-0 text-[#CAA42D]" aria-hidden />
                    {n.title}
                  </p>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">{n.body}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="faqs" title="Frequently asked questions">
            <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {a.faqs.map((f, i) => {
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
        </div>

        {/* Interactive Booking & Price Calculator Sidebar */}
        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Calculation</p>
                <p className="text-2xl font-extrabold text-[#00365F] mt-1">
                  AED {totalPrice > 0 ? totalPrice.toLocaleString() : (a.fromPrice ? a.fromPrice.toLocaleString() : "On Request")}
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#8F7420]">
                Official Price
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {/* Option Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Select Option
                </label>
                <select
                  value={selectedOptionIndex}
                  onChange={(e) => setSelectedOptionIndex(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-[#00365F] outline-none focus:border-[#00365F]"
                >
                  {a.options.map((opt, idx) => (
                    <option key={opt.label} value={idx}>
                      {opt.label} — AED {opt.adult || a.fromPrice || "On Request"}
                    </option>
                  ))}
                </select>
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
                    <span className="text-xs font-semibold text-slate-400">3-11 yrs</span>
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
              className="mt-3 block w-full rounded-xl border border-slate-200 py-2.5 text-center text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Custom Request / Group Rates
            </Link>

            <ul className="mt-6 space-y-2.5 border-t border-slate-100 pt-5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <BadgeCheck className="size-4 text-[#CAA42D] shrink-0" />
                <span>IATA &amp; DTCM Official Agency in Dubai</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-[#CAA42D] shrink-0" />
                <span>Direct Gate Barcode (No Queueing)</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="size-4 text-[#CAA42D] shrink-0" />
                <span>24/7 WhatsApp Support throughout trip</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {related.length > 0 ? (
        <section className="mx-auto mt-24 max-w-[1400px] px-5 sm:px-8">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold text-[#00365F] sm:text-3xl">
              More {a.category} experiences
            </h2>
            <Link
              to="/activities"
              className="text-xs font-bold text-[#00365F] hover:text-[#CAA42D]"
            >
              View All Tours &rarr;
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <ActivityCard key={r.slug} a={r} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Mobile Sticky Bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-slate-200 bg-white/95 px-5 py-3.5 backdrop-blur-md lg:hidden shadow-2xl">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-[#00365F]">{a.title}</p>
          <p className="text-sm font-extrabold text-[#CAA42D]">
            AED {totalPrice > 0 ? totalPrice.toLocaleString() : (a.fromPrice || "On Request")}
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
