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
  unit?: "per person" | "per vehicle" | "per hour" | "per group";
};

export type TimeBlock = {
  time: "Morning" | "Afternoon" | "Evening" | "Overnight";
  detail: string;
};
