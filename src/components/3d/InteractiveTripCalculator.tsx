import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Calculator,
  Sparkles,
  Plane,
  Building2,
  Calendar,
  Users,
  ShieldCheck,
  Award,
  ArrowRight,
  MessageCircle,
  CheckCircle2,
  Sliders,
  DollarSign,
  Compass,
} from "lucide-react";
import { BRAND, waLink } from "@/data/catalogue";
import { cn } from "@/lib/utils";

const DESTINATION_OPTIONS = [
  { id: "switzerland", name: "Switzerland Alps & Jungfrau", basePerNight: 850, baseFlight: 1800, visaFee: 450, region: "Europe" },
  { id: "baku", name: "Baku & Gabala Mountains", basePerNight: 350, baseFlight: 950, visaFee: 150, region: "Caucasus" },
  { id: "georgia", name: "Georgia (Tbilisi & Kazbegi)", basePerNight: 320, baseFlight: 900, visaFee: 0, region: "Caucasus" },
  { id: "maldives", name: "Maldives Overwater Resort", basePerNight: 950, baseFlight: 1400, visaFee: 0, region: "Island" },
  { id: "bali", name: "Bali (Ubud & Seminyak)", basePerNight: 450, baseFlight: 1600, visaFee: 180, region: "Asia" },
  { id: "turkey", name: "Turkey (Istanbul & Cappadocia)", basePerNight: 420, baseFlight: 1100, visaFee: 250, region: "Middle East" },
  { id: "japan", name: "Japan Golden Route", basePerNight: 750, baseFlight: 2400, visaFee: 350, region: "Asia" },
  { id: "umrah", name: "VIP Umrah Makkah & Madinah", basePerNight: 380, baseFlight: 1200, visaFee: 400, region: "Religious" },
  { id: "salalah", name: "Salalah Khareef Monsoon", basePerNight: 280, baseFlight: 650, visaFee: 0, region: "GCC" },
  { id: "kenya", name: "Kenya Masai Mara Safari", basePerNight: 800, baseFlight: 1900, visaFee: 200, region: "Africa" },
];

const LUXURY_TIERS = [
  { id: "comfort", name: "4★ Premium Executive", multiplier: 1.0, hotelType: "4-Star Superior City Center", transfer: "Private Sedan Transfer" },
  { id: "luxury", name: "5★ Royal Grand", multiplier: 1.45, hotelType: "5-Star Luxury Landmark Resort", transfer: "Mercedes V-Class VIP Van" },
  { id: "ultra", name: "Ultra-VIP Presidential", multiplier: 2.1, hotelType: "5-Star Signature Suite / Villa", transfer: "Private Chauffeur & Lounge Access" },
];

export function InteractiveTripCalculator() {
  const [selectedDestId, setSelectedDestId] = useState<string>("switzerland");
  const [nights, setNights] = useState<number>(6);
  const [travelers, setTravelers] = useState<number>(2);
  const [tierId, setTierId] = useState<string>("luxury");
  const [includeFlights, setIncludeFlights] = useState<boolean>(true);
  const [includeVisa, setIncludeVisa] = useState<boolean>(true);

  const dest = DESTINATION_OPTIONS.find((d) => d.id === selectedDestId) || DESTINATION_OPTIONS[0];
  const tier = LUXURY_TIERS.find((t) => t.id === tierId) || LUXURY_TIERS[1];

  // Calculate estimated total package cost
  const hotelCost = dest.basePerNight * nights * tier.multiplier * Math.ceil(travelers / 2);
  const flightCost = includeFlights ? dest.baseFlight * travelers : 0;
  const visaCost = includeVisa ? dest.visaFee * travelers : 0;
  const toursAndTransfersCost = 450 * nights * (tierId === "ultra" ? 1.8 : tierId === "luxury" ? 1.3 : 1.0);

  const totalEstimate = Math.round(hotelCost + flightCost + visaCost + toursAndTransfersCost);
  const perPersonEstimate = Math.round(totalEstimate / travelers);

  const bookingSummary = `Hello Nawi Saadi Travel! I used your Interactive Trip Calculator to build a custom package:
- Destination: ${dest.name} (${dest.region})
- Duration: ${nights} Nights / ${nights + 1} Days
- Travelers: ${travelers} Adults
- Luxury Tier: ${tier.name} (${tier.hotelType})
- Includes Flights: ${includeFlights ? "Yes (from DXB)" : "No (Land Only)"}
- Includes Visa Service: ${includeVisa ? "Yes" : "No"}
- Estimated Budget: ~AED ${totalEstimate.toLocaleString()} (AED ${perPersonEstimate.toLocaleString()} per person).
Please send me a detailed bespoke quotation.`;

  return (
    <section className="relative overflow-hidden bg-[#04121f] py-24 text-white">
      {/* Background Lighting & Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/4 size-96 -translate-y-1/2 rounded-full bg-[#CAA42D]/10 blur-[130px]" />
        <div className="absolute bottom-10 right-10 size-80 rounded-full bg-[#00365F]/30 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#CAA42D]/40 bg-[#CAA42D]/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-[#DDBE5E] uppercase backdrop-blur-md">
            <Calculator className="size-4 text-[#CAA42D]" />
            <span>Interactive Custom Trip Builder</span>
          </div>
          <h2 className="mt-4 font-display text-3xl font-medium tracking-tight sm:text-5xl text-white">
            Calculate Your <span className="italic text-[#DDBE5E]">Dream Itinerary</span>
          </h2>
          <p className="mt-4 text-base font-normal text-white/70 sm:text-lg">
            Configure your bespoke holiday in real-time. Adjust destination, nights, luxury tier, and travelers to get an instant estimate with zero hidden fees.
          </p>
        </div>

        {/* Interactive Builder Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Controls */}
          <div className="lg:col-span-7 space-y-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl shadow-2xl sm:p-8">
            {/* 1. Destination Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-3">
                1. Select Worldwide Destination
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {DESTINATION_OPTIONS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDestId(d.id)}
                    className={cn(
                      "rounded-xl p-3 text-left transition-all border text-xs",
                      selectedDestId === d.id
                        ? "border-[#CAA42D] bg-[#CAA42D]/20 text-white font-bold shadow-lg shadow-[#CAA42D]/10 ring-1 ring-[#CAA42D]/50"
                        : "border-white/10 bg-white/[0.02] text-white/70 hover:border-white/25 hover:bg-white/[0.06] hover:text-white"
                    )}
                  >
                    <div className="text-[10px] text-[#DDBE5E] uppercase font-bold tracking-wider">{d.region}</div>
                    <div className="font-semibold text-white truncate mt-0.5">{d.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Duration & Travelers Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-5 border-t border-white/10">
              {/* Duration */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold uppercase text-white/80 mb-2">
                  <span>2. Duration</span>
                  <span className="text-[#DDBE5E] font-mono text-sm font-semibold">{nights} Nights / {nights + 1} Days</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={14}
                  value={nights}
                  onChange={(e) => setNights(Number(e.target.value))}
                  className="w-full accent-[#CAA42D] h-2 bg-white/10 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-white/40 mt-1.5 font-medium">
                  <span>3 Nights (Short Stay)</span>
                  <span>14 Nights (Grand Tour)</span>
                </div>
              </div>

              {/* Travelers */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold uppercase text-white/80 mb-2">
                  <span>3. Travelers</span>
                  <span className="text-[#DDBE5E] font-mono text-sm font-semibold">{travelers} {travelers === 1 ? "Guest" : "Guests"}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={travelers}
                  onChange={(e) => setTravelers(Number(e.target.value))}
                  className="w-full accent-[#CAA42D] h-2 bg-white/10 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-white/40 mt-1.5 font-medium">
                  <span>1 Solo</span>
                  <span>10 Group/Family</span>
                </div>
              </div>
            </div>

            {/* 3. Luxury Tier Selector */}
            <div className="pt-5 border-t border-white/10">
              <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-3">
                4. Select Luxury Class
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {LUXURY_TIERS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTierId(t.id)}
                    className={cn(
                      "rounded-xl p-3.5 text-left transition-all border",
                      tierId === t.id
                        ? "border-[#CAA42D] bg-[#CAA42D]/20 text-white shadow-lg shadow-[#CAA42D]/10 ring-1 ring-[#CAA42D]/50"
                        : "border-white/10 bg-white/[0.02] text-white/70 hover:border-white/25 hover:bg-white/[0.06] hover:text-white"
                    )}
                  >
                    <div className="text-xs font-bold text-white">{t.name}</div>
                    <div className="text-[11px] text-white/60 mt-1 line-clamp-1">{t.hotelType}</div>
                    <div className="text-[10px] text-[#DDBE5E] mt-1 font-medium">{t.transfer}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Inclusions Toggles */}
            <div className="flex flex-wrap gap-5 pt-5 border-t border-white/10">
              <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer text-white/80 hover:text-white">
                <input
                  type="checkbox"
                  checked={includeFlights}
                  onChange={(e) => setIncludeFlights(e.target.checked)}
                  className="size-4 accent-[#CAA42D] rounded"
                />
                <span>Include Return Flights from DXB</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer text-white/80 hover:text-white">
                <input
                  type="checkbox"
                  checked={includeVisa}
                  onChange={(e) => setIncludeVisa(e.target.checked)}
                  className="size-4 accent-[#CAA42D] rounded"
                />
                <span>Include Visa Assistance & Travel Insurance</span>
              </label>
            </div>
          </div>

          {/* Right Column: Live Estimate & Instant Quote Breakdown */}
          <div className="lg:col-span-5 relative">
            <div className="rounded-2xl border border-[#CAA42D]/30 bg-gradient-to-b from-[#061e38] to-[#03101d] p-6 backdrop-blur-xl shadow-2xl sm:p-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-white/60">
                  Instant Budget Estimate
                </span>
                <span className="rounded-full bg-[#CAA42D]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#DDBE5E] uppercase tracking-wider">
                  Live Dynamic Pricing
                </span>
              </div>

              {/* Price Display */}
              <div className="mt-6 text-center">
                <div className="text-xs text-white/60 font-medium">Estimated Total Package Investment</div>
                <div className="mt-2 font-display text-4xl sm:text-5xl font-bold text-[#DDBE5E] tracking-tight">
                  AED {totalEstimate.toLocaleString()}
                </div>
                <div className="mt-1.5 text-xs text-white/50">
                  ≈ AED {perPersonEstimate.toLocaleString()} per traveler ({travelers} {travelers === 1 ? "guest" : "guests"} total)
                </div>
              </div>

              {/* Package Composition Checklist */}
              <div className="mt-8 space-y-3 border-t border-white/10 pt-6">
                <div className="flex items-center justify-between text-xs text-white/80">
                  <span className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 text-[#CAA42D]" />
                    <span>{nights} Nights {tier.hotelType}</span>
                  </span>
                  <span className="font-mono text-white/50">Included</span>
                </div>
                <div className="flex items-center justify-between text-xs text-white/80">
                  <span className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 text-[#CAA42D]" />
                    <span>Daily 5★ Breakfast & City Tours</span>
                  </span>
                  <span className="font-mono text-white/50">Included</span>
                </div>
                <div className="flex items-center justify-between text-xs text-white/80">
                  <span className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 text-[#CAA42D]" />
                    <span>{tier.transfer}</span>
                  </span>
                  <span className="font-mono text-white/50">Included</span>
                </div>
                {includeFlights && (
                  <div className="flex items-center justify-between text-xs text-white/80">
                    <span className="flex items-center gap-2.5">
                      <CheckCircle2 className="size-4 text-[#CAA42D]" />
                      <span>Return Flights DXB & Baggage</span>
                    </span>
                    <span className="font-mono text-white/50">Included</span>
                  </div>
                )}
                {includeVisa && (
                  <div className="flex items-center justify-between text-xs text-white/80">
                    <span className="flex items-center gap-2.5">
                      <CheckCircle2 className="size-4 text-[#CAA42D]" />
                      <span>Visa Assistance & Insurance</span>
                    </span>
                    <span className="font-mono text-white/50">Included</span>
                  </div>
                )}
              </div>

              {/* Instant WhatsApp Concierge Button */}
              <div className="mt-8 space-y-3">
                <a
                  href={waLink(bookingSummary)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#CAA42D] to-[#DDBE5E] px-6 py-4 font-sans text-sm font-bold text-[#04121f] shadow-lg shadow-[#CAA42D]/25 transition-all hover:scale-[1.02] hover:from-[#DDBE5E] hover:to-[#edd57a]"
                >
                  <MessageCircle className="size-5" />
                  <span>Get Official Quotation on WhatsApp</span>
                  <ArrowRight className="size-4" />
                </a>

                <Link
                  to="/plan"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-4 py-3 text-xs font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <span>Open Full Custom Holiday Form</span>
                </Link>
              </div>

              {/* Trust Badge */}
              <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-white/50">
                <ShieldCheck className="size-3.5 text-[#CAA42D]" />
                <span>Estimate only &middot; IATA #2009 &middot; flydubai GSA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
