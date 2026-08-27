import { inboundTours } from "./inbound-tours";
import { inboundTickets } from "./inbound-tickets";
import type { InboundActivity } from "./inbound-types";

export type { InboundActivity, InboundCategory, InboundEmirate } from "./inbound-types";
export { inboundCategories } from "./inbound-types";

/** Every bookable Dubai / UAE inbound experience. */
export const inboundActivities: InboundActivity[] = [...inboundTours, ...inboundTickets];

export function inboundBySlug(slug: string): InboundActivity | undefined {
  return inboundActivities.find((a) => a.slug === slug);
}

export function inboundFrom(a: InboundActivity): string {
  return a.fromPrice ? `From AED ${a.fromPrice.toLocaleString()}` : "Price on Request";
}

/** Activities with a lead-in adult rate under AED 100 — powers the deals page. */
export const inboundUnder100: InboundActivity[] = inboundActivities.filter(
  (a) => typeof a.fromPrice === "number" && a.fromPrice < 100,
);
