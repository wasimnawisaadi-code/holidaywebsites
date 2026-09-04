/**
 * Shared reading of a package's itinerary, used by the detail page and by the
 * downloadable PDF so the two can never disagree.
 */

/**
 * The day's title without its own "Day N:" prefix.
 *
 * All 285 day titles in the catalogue begin "Day 1:", "Day 2:" and so on. Both
 * the page and the PDF also print their own day label above the title, so the
 * page read "Day 01 / Day 1: Direct 3-hour flight from Dubai" and the PDF read
 * "Day 1: Day 1: Direct 3-hour flight from Dubai".
 *
 * Stripping it here rather than editing 285 strings keeps the data usable
 * anywhere the prefix is genuinely wanted.
 */
export function dayTitle(title: string): string {
  return title.replace(/^\s*Day\s*\d+\s*[:.–-]\s*/i, "").trim() || title;
}

/**
 * Whether the day's one-line summary is worth showing alongside the detailed
 * morning / afternoon / evening blocks.
 *
 * It usually is not. Where a package carries dayBlocks, the summary is a copy
 * of one of them — and in 38 cases across the catalogue it is a copy that was
 * cut mid-word by some earlier character limit ("...walk along Nizami Stre").
 * Every one of those 38 sits on a package that has the full text in a block, so
 * preferring the blocks loses nothing and removes the broken sentence.
 */
export function showSummary(summary: string | undefined, hasBlocks: boolean): boolean {
  return Boolean(summary) && !hasBlocks;
}

/** True when the package's own inclusions name flights. */
export function flightsIncluded(pkg: { inclusions?: readonly string[] }): boolean {
  return (pkg.inclusions ?? []).some((line) => /\bflight|airfare|air ticket/i.test(line));
}

/**
 * The two lines every package should carry about what is flexible.
 *
 * Flights are a real split in the catalogue — 14 packages price them in, 36
 * quote them separately — so the line is chosen from the package's own
 * inclusions rather than asserted for all of them.
 */
export function flexibilityNotes(pkg: { inclusions?: readonly string[] }): {
  flights: string;
  tailorMade: string;
} {
  return {
    flights: flightsIncluded(pkg)
      ? "Flights are included in this itinerary. Tell us your departure city and we will confirm the fare."
      : "Flights are quoted on request. We hold IATA accreditation and can ticket any airline from Dubai alongside this itinerary.",
    tailorMade:
      "Every itinerary here is a starting point. We rebuild any of it around your own dates, hotels, pace and budget, for couples, families or groups.",
  };
}

/**
 * A day's headline, with the source truncation repaired.
 *
 * 80 of the 285 day titles in the catalogue end in an ellipsis — "Depart on a
 * full-day guided excursion to Gaba..." — because each is the opening of that
 * day's morning block, cut by a character limit somewhere upstream. All 80
 * match their morning block exactly, so the whole sentence is already in the
 * data and only needs reading from the other field.
 *
 * A recovered sentence longer than a headline should be is cut back at a comma
 * or a word, without putting the ellipsis back: a title that trails off is the
 * thing being fixed.
 */
export function dayHeadline(title: string, morning?: string): string {
  const bare = dayTitle(title);
  if (!/(\.\.\.|…)$/.test(bare) || !morning) return bare;

  const stem = bare.replace(/(\.\.\.|…)$/, "").trim();
  if (!morning.startsWith(stem.slice(0, Math.min(stem.length, 30)))) return bare;

  const firstSentence = (morning.match(/^[^.!?]+[.!?]/)?.[0] ?? morning)
    .trim()
    .replace(/[.!?]$/, "");
  if (firstSentence.length <= 96) return firstSentence;

  const clipped = firstSentence.slice(0, 96);
  const comma = clipped.lastIndexOf(",");
  const space = clipped.lastIndexOf(" ");
  return clipped.slice(0, comma > 55 ? comma : space > 0 ? space : 96).trim();
}
