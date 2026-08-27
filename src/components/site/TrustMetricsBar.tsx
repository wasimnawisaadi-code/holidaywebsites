import { Star, Globe2, ShieldCheck, MessageCircle } from "lucide-react";
import { BRAND } from "@/data/catalogue";

const METRICS = [
  {
    icon: Star,
    value: "4.9 / 5.0",
    label: "Rated by 1,400+ UAE Travelers",
    badge: "Top Rated",
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
    badge: "Since 2009",
  },
  {
    icon: MessageCircle,
    value: "1-on-1 Concierge",
    label: "WhatsApp support until you return",
    badge: "24/7 Live",
  },
];

export function TrustMetricsBar() {
  return (
    <div className="relative z-20 mx-auto -mt-6 max-w-[1400px] px-5 sm:px-8">
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
                <span className="rounded-full bg-[#CAA42D]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#8F7420]">
                  {m.badge}
                </span>
              </div>
              <p className="mt-3 font-display text-lg font-bold text-[#00365F] sm:text-xl">
                {m.value}
              </p>
              <p className="mt-0.5 font-sans text-xs text-slate-500 line-clamp-1">
                {m.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
