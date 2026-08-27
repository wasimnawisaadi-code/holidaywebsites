import type { FAQ, InfoNote, PriceOption } from "./detail-types";

export type InboundCategory =
  | "Desert Safari"
  | "Dhow Cruise"
  | "City Tour"
  | "Luxury Yacht"
  | "Attraction Ticket"
  | "Theme Park"
  | "Water Sports"
  | "Adventure";

export type InboundEmirate =
  "Dubai" | "Abu Dhabi" | "Sharjah" | "Ras Al Khaimah" | "Fujairah" | "Ajman" | "Al Ain" | "Hatta";

export type InboundActivity = {
  /** kebab-case, unique */
  slug: string;
  title: string;
  category: InboundCategory;
  emirate: InboundEmirate;
  /** e.g. "6 Hours", "Full Day" */
  duration: string;
  image: string;
  /** exactly 4 images */
  gallery: string[];
  badge?: "Must Try" | "Popular" | "Best Value" | "New";
  instantConfirm?: boolean;
  /** lowest ADULT price in AED; omit when price on request */
  fromPrice?: number;
  /** 100-150 words */
  overview: string;
  /** 5-7 bullets */
  highlights: string[];
  timeline: { time: string; detail: string }[];
  options: PriceOption[];
  inclusions: string[];
  exclusions: string[];
  transportation: string[];
  importantInfo: InfoNote[];
  faqs: FAQ[];
};

export const inboundCategories: InboundCategory[] = [
  "Desert Safari",
  "Dhow Cruise",
  "City Tour",
  "Luxury Yacht",
  "Attraction Ticket",
  "Theme Park",
  "Water Sports",
  "Adventure",
];
