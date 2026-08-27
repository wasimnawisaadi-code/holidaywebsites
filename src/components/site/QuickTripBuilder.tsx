import { useState, useMemo } from "react";
import { MessageCircle, Sparkles, Send, Calendar, Users, MapPin } from "lucide-react";
import { BRAND, waLink } from "@/data/catalogue";

const DESTINATIONS = [
  "Switzerland & Alps",
  "Japan (Tokyo & Kyoto)",
  "Maldives Overwater",
  "Spain (Barcelona & Madrid)",
  "Georgia & Caucasus",
  "Turkey & Cappadocia",
  "Baku & Gabala",
  "Salalah & Oman",
  "Kenya & Tanzania Safari",
  "Mauritius Paradise",
  "Umrah (Makkah & Madinah)",
  "Other Worldwide Destination",
];

const STYLES = ["Family Holiday", "Honeymoon & Luxury", "Adventure & Nature", "Cultural Discovery", "Quick 4-Day Break"];

const MONTHS = ["Next 30 Days", "Eid Holidays", "Autumn (Sep-Nov)", "Winter / Festive", "Spring 2027", "Flexible Dates"];

export function QuickTripBuilder() {
  const [destination, setDestination] = useState(DESTINATIONS[0]);
  const [style, setStyle] = useState(STYLES[0]);
  const [month, setMonth] = useState(MONTHS[0]);
  const [guests, setGuests] = useState("2 Adults");

  const whatsappUrl = useMemo(() => {
    const msg = `Hi ${BRAND.short}, I'd like to plan a trip via your Quick Trip Planner:\n- Destination: ${destination}\n- Travel Style: ${style}\n- Target Travel Period: ${month}\n- Travellers: ${guests}\nPlease share customized itinerary options, hotel categories, and best price from Dubai.`;
    return waLink(msg);
  }, [destination, style, month, guests]);

  return (
    <section className="bg-gradient-to-b from-slate-50 to-slate-100 py-20 sm:py-24 border-t border-slate-200">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <div className="grid lg:grid-cols-[1.1fr_1.4fr]">
            {/* Left promo banner */}
            <div className="relative flex flex-col justify-between overflow-hidden bg-[#00365F] p-8 text-white sm:p-12">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#CAA42D] backdrop-blur-md">
                  <Sparkles className="size-3.5" />
                  <span>Custom Trip Planner</span>
                </div>
                <h3 className="mt-5 font-display text-3xl font-bold leading-tight sm:text-4xl text-white">
                  Build Your Dream Itinerary in <span className="italic text-[#CAA42D]">30 Seconds</span>
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">
                  Select your preferences below to receive a bespoke itinerary and transparent all-inclusive quote from our senior Dubai travel specialists.
                </p>
              </div>

              <div className="relative z-10 mt-10 space-y-3 border-t border-white/15 pt-6 text-xs text-slate-300">
                <p className="flex items-center gap-2.5">
                  <span className="flex size-5 items-center justify-center rounded-full bg-[#CAA42D]/20 text-[#CAA42D] font-bold">✓</span>
                  Official IATA Ticket Issuance &amp; Visa Processing
                </p>
                <p className="flex items-center gap-2.5">
                  <span className="flex size-5 items-center justify-center rounded-full bg-[#CAA42D]/20 text-[#CAA42D] font-bold">✓</span>
                  Direct flydubai &amp; Emirates Partner Fares
                </p>
                <p className="flex items-center gap-2.5">
                  <span className="flex size-5 items-center justify-center rounded-full bg-[#CAA42D]/20 text-[#CAA42D] font-bold">✓</span>
                  100% Free Custom Quotation with Zero Obligation
                </p>
              </div>
            </div>

            {/* Right form controls */}
            <div className="p-8 sm:p-12">
              <div className="space-y-6">
                {/* 1. Destination */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <MapPin className="size-3.5 text-[#CAA42D]" />
                    <span>1. Select Destination</span>
                  </label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-sm font-semibold text-[#00365F] focus:border-[#00365F] focus:bg-white focus:outline-none"
                  >
                    {DESTINATIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Style & Month */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <Sparkles className="size-3.5 text-[#CAA42D]" />
                      <span>2. Travel Style</span>
                    </label>
                    <select
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-sm font-semibold text-[#00365F] focus:border-[#00365F] focus:bg-white focus:outline-none"
                    >
                      {STYLES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <Calendar className="size-3.5 text-[#CAA42D]" />
                      <span>3. When to Travel</span>
                    </label>
                    <select
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-sm font-semibold text-[#00365F] focus:border-[#00365F] focus:bg-white focus:outline-none"
                    >
                      {MONTHS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. Guests */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <Users className="size-3.5 text-[#CAA42D]" />
                    <span>4. Travellers</span>
                  </label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {["1 Adult", "2 Adults", "Family (2A + Kids)"].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGuests(g)}
                        className={`rounded-xl border p-2.5 text-xs font-bold transition-all cursor-pointer ${
                          guests === g
                            ? "border-[#00365F] bg-[#00365F] text-white shadow-xs"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#00365F] p-4 text-sm font-bold text-white shadow-xl transition-all duration-300 hover:bg-[#CAA42D] hover:text-[#00365F] hover:shadow-2xl cursor-pointer"
                  >
                    <MessageCircle className="size-5" />
                    <span>Get Instant WhatsApp Quote &amp; Itinerary</span>
                    <Send className="size-4" />
                  </a>
                  <p className="mt-2.5 text-center text-xs text-slate-400">
                    Direct chat with Nawi Saadi Travel Consultants in Deira, Dubai
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
