/** Shared content types for production-level package & activity detail pages. */

export type FAQ = { q: string; a: string };

export type InfoNote = { title: string; body: string };

export type Accommodation = {
  category: string;
  roomType: string;
  mealPlan: string;
  note?: string;
};

/** A single bookable price option (adult/child, per person unless stated). */
export type PriceOption = {
  label: string;
  adult?: number;
  child?: number;
  note?: string;
  /**
   * How the price is charged, shown verbatim beside the amount.
   *
   * Free text rather than a union: the tickets data legitimately says things
   * like "per jet ski (1 or 2 pax)" and "for 2 hours", which no fixed list
   * survives contact with. Eleven of those were already in the data and were
   * failing to type-check.
   */
  unit?: string;
};

export type TimeBlock = {
  time: "Morning" | "Afternoon" | "Evening" | "Overnight";
  detail: string;
};
