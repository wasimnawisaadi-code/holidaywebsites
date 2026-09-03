/**
 * Types and small helpers for the catalogue, with none of the catalogue.
 *
 * These lived in catalogue.ts alongside 250KB of package data. Because
 * __root.tsx, SiteHeader, SiteFooter and WhatsAppFab all reach into that module
 * for a helper or a type, the bundler had to place the whole thing in the chunk
 * that every route loads — so a visitor reading /privacy downloaded every
 * itinerary on the site.
 *
 * Anything that needs a price format or a TravelStyle imports from here.
 * Anything that needs the actual packages imports @/data/catalogue, which now
 * lands only in the chunks that genuinely use it.
 */

export type TravelStyle =
  | "Family"
  | "Honeymoon"
  | "Romantic"
  | "Luxury"
  | "Adventure"
  | "Beach"
  | "City Escape"
  | "Cultural"
  | "Historical"
  | "Nature"
  | "Mountain"
  | "Safari"
  | "Theme Park"
  | "Shopping"
  | "Northern Lights"
  | "Cruises"
  | "Weekend Escape"
  | "Budget Friendly";

export type PriceStatus = "from" | "on-request";

export type ItineraryDay = {
  day: number;
  title: string;
  summary: string;
  activities: string[];
  meals: string;
  transport: string;
};

export type HolidayPackage = {
  slug: string;
  title: string;
  destination: string;
  country: string;
  region: "International" | "UAE";
  days: number;
  nights: number;
  styles: TravelStyle[];
  priceStatus: PriceStatus;
  priceFrom?: number;
  image: string;
  intro: string;
  story: string;
  highlights: string[];
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  route: string[];
  featured?: boolean;
  seasonal?: string;
  isNew?: boolean;
};
export type ExperienceCategory =
  | "Adventure"
  | "Family"
  | "Luxury"
  | "Cruise"
  | "Attraction"
  | "Theme Park"
  | "Water Park"
  | "Water Sports"
  | "Culture"
  | "Desert"
  | "Sightseeing"
  | "Combo Deal"
  | "Dining"
  | "Shows"
  | "Wellness"
  | "Shopping";

export type Experience = {
  slug: string;
  title: string;
  emirate:
    | "Dubai"
    | "Abu Dhabi"
    | "Sharjah"
    | "Ras Al Khaimah"
    | "Fujairah"
    | "Ajman"
    | "Al Ain"
    | "Hatta";
  category: ExperienceCategory;
  duration: "<1 Hour" | "1–2 Hours" | "2–4 Hours" | "Half Day" | "Full Day";
  audience: ("Adults" | "Children" | "Families" | "Couples" | "Groups")[];
  priceStatus: PriceStatus;
  priceFrom?: number;
  wasPrice?: number;
  badge?: "Must Try" | "Popular" | "Best Value" | "New";
  instantConfirm?: boolean;
  image: string;
  overview: string;
  featured?: boolean;
};

export const emirates = [
  { name: "Dubai", blurb: "Skyline, desert and everything between.", top: "34%", left: "40%" },
  {
    name: "Abu Dhabi",
    blurb: "Culture, capital icons and island resorts.",
    top: "62%",
    left: "22%",
  },
  { name: "Sharjah", blurb: "Museums, heritage and the Blue Souk.", top: "27%", left: "47%" },
  { name: "Ajman", blurb: "Quiet beaches minutes from the city.", top: "22%", left: "52%" },
  { name: "Ras Al Khaimah", blurb: "Mountains, ziplines and coastline.", top: "10%", left: "63%" },
  { name: "Fujairah", blurb: "East-coast diving and Hajar peaks.", top: "26%", left: "76%" },
  { name: "Al Ain", blurb: "Oasis city and Jebel Hafeet.", top: "70%", left: "50%" },
  { name: "Hatta", blurb: "Dam kayaking and mountain trails.", top: "46%", left: "62%" },
] as const;

export const travelStyles: TravelStyle[] = [
  "Honeymoon",
  "Romantic",
  "Family",
  "Luxury",
  "Adventure",
  "Beach",
  "City Escape",
  "Shopping",
  "Cultural",
  "Historical",
  "Nature",
  "Mountain",
  "Safari",
  "Theme Park",
  "Northern Lights",
  "Cruises",
  "Weekend Escape",
  "Budget Friendly",
];

export function priceLabel(p: { priceStatus: PriceStatus; priceFrom?: number }) {
  return p.priceStatus === "from" && p.priceFrom
    ? "From AED " + p.priceFrom.toLocaleString()
    : "Price on Request";
}

export const experienceCategories: ExperienceCategory[] = [
  "Attraction",
  "Theme Park",
  "Water Park",
  "Desert",
  "Adventure",
  "Cruise",
  "Water Sports",
  "Sightseeing",
  "Culture",
  "Combo Deal",
  "Family",
  "Luxury",
  "Dining",
  "Shows",
  "Wellness",
  "Shopping",
];

export function discountPct(e: { priceFrom?: number; wasPrice?: number }) {
  if (!e.priceFrom || !e.wasPrice || e.wasPrice <= e.priceFrom) return null;
  return Math.round(((e.wasPrice - e.priceFrom) / e.wasPrice) * 100);
}

export function priceParts(p: { priceStatus: PriceStatus; priceFrom?: number }): {
  eyebrow: string;
  amount: string;
} {
  return p.priceStatus === "from" && p.priceFrom
    ? { eyebrow: "Per person from", amount: "AED " + p.priceFrom.toLocaleString() }
    : { eyebrow: "Tailored quote", amount: "Price on request" };
}
