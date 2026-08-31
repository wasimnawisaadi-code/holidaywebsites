import type { Accommodation, FAQ, InfoNote } from "./detail-types";

/** Time-of-day breakdown for one itinerary day of a holiday package. */
export type DayBlocks = {
  day: number;
  morning: string;
  afternoon: string;
  evening: string;
  overnight: string;
  /**
   * What is included that day — "Breakfast and dinner", "No meals (flight
   * arrival)". Present on all 80 day blocks in the details files but missing
   * from this type, so it failed to type-check and the detail page rendered
   * the coarser `itinerary[].meals` instead. The page now prefers this value
   * where it exists.
   */
  meals?: string;
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
  /**
   * Package-specific inclusion and exclusion lists, written per itinerary and
   * more precise than the summary versions on HolidayPackage ("Full-day guided
   * Gabala mountain excursion with Tufandag cable car tickets" rather than
   * "Guided tours"). Fourteen packages carry them. They were absent from this
   * type, so they failed to type-check and the detail page fell back to the
   * shorter catalogue lists; it now prefers these where present.
   */
  inclusions?: string[];
  exclusions?: string[];
  importantInfo: InfoNote[];
  /** exactly 5 */
  faqs: FAQ[];
};
