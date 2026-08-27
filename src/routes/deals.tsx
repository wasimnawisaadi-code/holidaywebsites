import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, Flame, Clock, Sparkles, CheckCircle2, ShieldCheck, Tag, Star, Percent } from "lucide-react";
import { useEffect, useState } from "react";
import { BRAND, packages, waLink } from "@/data/catalogue";
import { inboundActivities, inboundUnder100 } from "@/data/inbound";
import { Reveal } from "@/components/site/Reveal";
import { ActivityCard } from "@/components/site/ActivityCard";
import { PackageCard } from "@/components/site/PackageCard";

const under100 = [...inboundUnder100].sort((a, b) => (a.fromPrice ?? 0) - (b.fromPrice ?? 0));
const cheapest = under100[0]?.fromPrice ?? 25;

const valueHolidays = packages
  .filter((p) => typeof p.priceFrom === "number")
  .sort((a, b) => (a.priceFrom ?? 0) - (b.priceFrom ?? 0))
  .slice(0, 6);
const cheapestHoliday = valueHolidays[0]?.priceFrom ?? 1299;

const COMBO_DEALS = [
  {
    title: "Burj Khalifa 124th + VIP Desert Safari",
    subtitle: "At The Top sunset access + Red Dunes 4x4, BBQ Buffet & Live Shows",
    original: 430,
    price: 310,
    save: "Save 28%",
    slug: "evening-desert-safari-with-bbq-dinner",
    badge: "Most Popular Combo",
    image: "/images/dst/view-at-the-top-burj-khalifa-at-the-top-1.webp",
  },
  {
    title: "Atlantis Aquaventure + Lost Chambers",
    subtitle: "105 water slides, private beach + 65,000 marine animals aquarium",
    original: 520,
    price: 385,
    save: "Save 26%",
    slug: "atlantis-aquaventure-waterpark",
    badge: "Family Pass",
    image: "/images/dst/atlantis-aqua-water-park-aquaventure-waterpark-at-atlantis-the-palm.webp",
  },
  {
    title: "Lotus 240ft Mega Yacht + Dinner Buffet",
    subtitle: "3-hour Dubai Marina luxury cruise, live cooking stations & DJ",
    original: 350,
    price: 249,
    save: "Save 29%",
    slug: "lotus-mega-yacht-cruise",
    badge: "VIP Luxury",
    image: "/images/dst/lotus-royale-dhow-cruise-lotusroyalenewyearsevemegayachttripindubai.jpg",
  },
  {
    title: "Abu Dhabi Full Day + Ferrari World",
    subtitle: "Sheikh Zayed Grand Mosque, Emirates Palace + Ferrari World Entry",
    original: 480,
    price: 340,
    save: "Save 30%",
    slug: "abu-dhabi-city-tour-with-ferrari-world",
    badge: "Full Day Tour",
    image: "/images/dst/abu-dhabi-city-tour-ferrariworld-ferrari-world-abu-dhabi-aerial-view.webp",
  },
];

export const Route = createFileRoute("/deals")({
  head: () => ({
    meta: [
      { title: `Dubai Flash Deals & Combo Passes — from AED ${cheapest} | Nawi Saadi Travel` },
      {
        name: "description",
        content: `Exclusive UAE contracted rates, Dubai attraction combo passes, and worldwide holiday packages from AED ${cheapestHoliday}. Official DTCM barcode tickets dispatched on WhatsApp.`,
      },
      { property: "og:title", content: "Holiday Deals & Dubai Attraction Passes | Nawi Saadi Travel" },
    ],
  }),
  component: DealsPage,
});

function DealsPage() {
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#FFFFFF] pt-24 pb-24 text-[#353844]">
      {/* Luxury Hero Banner */}
      <section className="border-b border-amber-400/30 bg-[#00365F] py-16 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#CAA42D_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />

        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-center lg:text-left">
              {/* Was a red "limited time" pill and a gradient-clipped headline.
                  Both are house-rejected treatments: the red sits outside the
                  brand palette and reads as a discount-site urgency badge, and
                  clipped gradient text is the single clearest "template" tell.
                  Same message, brand gold, flat fill. */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#CAA42D]/40 bg-[#CAA42D]/15 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#DDBE5E]">
                <Flame className="size-4 text-[#CAA42D]" />
                <span>Contracted fares</span>
              </div>

              <h1 className="mt-4 font-display leading-[1.06] text-white [font-size:clamp(2rem,4.6vw,3.6rem)]">
                Dubai deals &amp; <span className="italic text-[#DDBE5E]">combo passes</span>
              </h1>

              <p className="mt-4 text-base text-slate-200 max-w-xl leading-relaxed">
                Save up to 35% with pre-negotiated wholesale rates. Official barcodes with DTCM accreditation delivered straight to your WhatsApp in 15 minutes.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <a
                  href={waLink("Hi Nawi Saadi, I would like to book a special deal package on WhatsApp.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3.5 text-xs font-extrabold text-[#00365F] shadow-xl transition-all hover:from-amber-300 hover:to-amber-400"
                >
                  <MessageCircle className="size-4" />
                  <span>Claim Flash Deal on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Countdown Box Card */}
            <div className="rounded-3xl border border-amber-400/40 bg-white/10 p-7 backdrop-blur-xl shadow-2xl text-center min-w-[280px]">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
                <Clock className="size-4 text-amber-400" />
                <span>Flash Rates Reset In</span>
              </div>

              <div className="mt-3 flex items-center justify-center gap-2 font-mono text-3xl sm:text-4xl font-black text-amber-400">
                <div className="rounded-xl bg-black/40 px-3 py-2 border border-amber-400/30">
                  {String(timeLeft.hours).padStart(2, "0")}
                </div>
                <span>:</span>
                <div className="rounded-xl bg-black/40 px-3 py-2 border border-amber-400/30">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </div>
                <span>:</span>
                <div className="rounded-xl bg-black/40 px-3 py-2 border border-amber-400/30">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-emerald-400 font-semibold">
                <ShieldCheck className="size-4" />
                <span>Best Price Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1. Best UAE Combo Passes */}
      <section className="mx-auto mt-16 max-w-[1400px] px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#e2dcd0] pb-5">
          <div>
            <span className="font-sans text-xs font-black tracking-[0.24em] text-[#CAA42D] uppercase">
              Bestseller Combos
            </span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-[#00365F]">
              Dubai Experience Combo Passes
            </h2>
            <p className="mt-1 text-slate-600 text-sm">
              Combine two signature attractions into one discounted ticket.
            </p>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
            ⚡ Save up to 30%
          </span>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {COMBO_DEALS.map((combo, i) => (
            <Reveal key={combo.title} delay={i * 60}>
              <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition-all hover:shadow-2xl hover:border-amber-400">
                <div className="relative aspect-[16/11] overflow-hidden bg-slate-100">
                  <img
                    src={combo.image}
                    alt={combo.title}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-108"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-black text-white uppercase shadow-md">
                      {combo.save}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="rounded bg-black/60 px-2 py-0.5 text-[10px] font-bold text-amber-300 backdrop-blur-sm">
                      {combo.badge}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-base font-bold text-[#00365F] group-hover:text-[#CAA42D] transition-colors leading-snug">
                    {combo.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed flex-1">
                    {combo.subtitle}
                  </p>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 line-through">
                        AED {combo.original}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs text-[#00365F] font-bold">AED</span>
                        <span className="font-display text-xl font-black text-[#CAA42D]">
                          {combo.price}
                        </span>
                      </div>
                    </div>

                    <a
                      href={waLink(`Hi Nawi Saadi, I want to book the Combo Deal: ${combo.title} at AED ${combo.price}.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-xl bg-[#00365F] px-3.5 py-2 text-xs font-bold text-white transition-all hover:bg-[#CAA42D] hover:text-[#00365F]"
                    >
                      <MessageCircle className="size-3.5" />
                      <span>Book</span>
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 2. Tickets Under AED 100 */}
      <section className="mx-auto mt-24 max-w-[1400px] px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#e2dcd0] pb-5">
          <div>
            <span className="font-sans text-xs font-black tracking-[0.24em] text-[#CAA42D] uppercase">
              Budget Friendly
            </span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-[#00365F]">
              Dubai Tickets Under AED 100
            </h2>
            <p className="mt-1 text-slate-600 text-sm">
              Direct barcodes from AED {cheapest} per person.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {under100.length} Tickets Available
          </span>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {under100.map((e, i) => (
            <Reveal key={e.slug} delay={Math.min(i, 8) * 40}>
              <ActivityCard a={e} eager={i < 4} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* 3. Worldwide Holiday Package Steals */}
      <section className="mx-auto mt-24 max-w-[1400px] px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#e2dcd0] pb-5">
          <div>
            <span className="font-sans text-xs font-black tracking-[0.24em] text-[#CAA42D] uppercase">
              Best Value Escapes
            </span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-[#00365F]">
              Complete Holiday Packages from AED {cheapestHoliday}
            </h2>
            <p className="mt-1 text-slate-600 text-sm">
              Flights, hotels, transfers, and excursions arranged by our IATA desk.
            </p>
          </div>

          <Link
            to="/holidays"
            className="group inline-flex shrink-0 items-center gap-2 font-sans text-xs font-bold text-[#00365F] hover:text-[#CAA42D]"
          >
            <span>Explore All 30+ Holiday Packages</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {valueHolidays.map((pkg, i) => (
            <Reveal key={pkg.slug} delay={Math.min(i, 6) * 40}>
              <PackageCard pkg={pkg} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Bottom WhatsApp Help Banner */}
      <section className="mx-auto mt-20 max-w-[1400px] px-5 sm:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-3xl bg-[#00365F] p-8 text-white">
          <div>
            <h3 className="font-display text-2xl font-bold text-white">
              Looking for Custom Group or Corporate Deals?
            </h3>
            <p className="mt-1 text-xs text-slate-300">
              We offer wholesale group discounts for 6+ travelers, company offsites, and private yacht charters.
            </p>
          </div>
          <a
            href={waLink("Hi Nawi Saadi, I would like to inquire about group discounts and corporate packages.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#CAA42D] px-6 py-3.5 text-xs font-extrabold text-[#00365F] shadow-lg hover:bg-amber-300 transition-colors"
          >
            <MessageCircle className="size-4" />
            <span>Chat with Group Specialist</span>
          </a>
        </div>
      </section>
    </div>
  );
}
