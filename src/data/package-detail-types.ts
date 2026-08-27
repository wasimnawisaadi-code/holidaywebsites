import type { Accommodation, FAQ, InfoNote } from "./detail-types";

/** Time-of-day breakdown for one itinerary day of a holiday package. */
export type DayBlocks = {
  day: number;
  morning: string;
  afternoon: string;
  evening: string;
  overnight: string;
};

/** Production-level detail content layered on top of a HolidayPackage. */
export type PackageDetail = {
  /** 100-150 words, one paragraph */
  overview: string;
  /** exactly 4 images */
  gallery: string[];
  dayBlocks: DayBlocks[];
  accommodation: Accommodation;
  transportation: string[];
  importantInfo: InfoNote[];
  /** exactly 5 */
  faqs: FAQ[];
};
