import { Building2, Globe2, ShieldCheck, MessageCircle } from "lucide-react";
import { BRAND } from "@/data/catalogue";

/**
 * Every figure here has to be one the agency can evidence on request.
 *
 * The first card used to read "4.9 / 5.0 — Rated by 1,400+ UAE Travelers".
 * Nothing in the business data supports either number, there is no review
 * platform behind it, and an unevidenced rating is both a Meta/Google ads
 * policy breach and the kind of claim a UAE consumer authority can act on.
 * It has been replaced with the three-office footprint, which is real and is
 * a stronger differentiator than a rating no competitor believes anyway.
 *
 * If a genuine aggregate rating exists — a Google Business Profile score, say
 * — put it back here AND add an aggregateRating to the TravelAgency schema in
 * __root.tsx, citing the platform it came from. Do not restore one without
 * the other.
 */
const METRICS = [
  {
    icon: Building2,
    value: "3 Country Offices",
    label: "Dubai · Kabul · Jeddah",
    badge: "Since 2009",
  },
  {
    icon: Globe2,
    value: "50+ Destinations",
    label: "Hand-crafted worldwide tours",
    badge: "Direct Flights",
  },
  {
    icon: ShieldCheck,
    value: "IATA & DTCM Licensed",
    label: "Official flydubai GSA Partner",
    badge: "Accredited",
  },
  {
    icon: MessageCircle,
    value: "1-on-1 Concierge",
    label: "WhatsApp support until you return",
    badge: "24/7 Live",
  },
];

export function TrustMetricsBar() {
  // Positive top margin, deliberately. This was -mt-6, which tucked the white
  // card 24px behind the search bar above it — and because that bar is a
  // translucent glass panel with no colour of its own, the card bled straight
  // up through it as a white wash over the "Anywhere" and "Flexible" fields.
  return (
    <div className="relative z-20 mx-auto mt-6 max-w-[1400px] px-5 sm:px-8">
      <div className="grid grid-cols-2 gap-3 rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-xl backdrop-blur-md sm:p-6 lg:grid-cols-4 lg:gap-6">
        {METRICS.map((m, i) => {
          const Icon = m.icon;
          return (
            <div
              key={m.value}
              className="flex flex-col items-start rounded-2xl bg-slate-50/80 p-4 transition-all duration-300 hover:bg-white hover:shadow-md hover:scale-[1.02] border border-slate-100"
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex size-9 items-center justify-center rounded-xl bg-[#00365F]/10 text-[#00365F]">
                  <Icon className="size-4 text-[#CAA42D]" />
                </div>
                <span className="rounded-full bg-[#CAA42D]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#7A641B]">
                  {m.badge}
                </span>
              </div>
              <p className="mt-3 font-display text-lg font-bold text-[#00365F] sm:text-xl">
                {m.value}
              </p>
              <p className="mt-0.5 font-sans text-xs text-slate-500 line-clamp-1">{m.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
