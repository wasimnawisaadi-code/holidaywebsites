/**
 * Shared helpers for page metadata.
 *
 * Titles and descriptions were being assembled inline in each route by string
 * concatenation, and the package and activity routes built theirs from content
 * fields that are themselves long. The result was titles of 88 to 144
 * characters — Google renders roughly the first 60, so
 *
 *   "USA New York & East Coast Discovery: Times Square, Statue of Liberty,
 *    Niagara Falls & Washington DC — 9 Days United States Package from Dubai
 *    | Nawi Saadi"
 *
 * reached a searcher as a truncated fragment with the useful words cut off.
 * The most valuable line in the search result was being spent on detail that
 * belongs in the description.
 */

/** Google renders roughly this much of a title before truncating. */
const TITLE_LIMIT = 60;

/**
 * The distinctive opening of a long content title.
 *
 * Package titles are written as "Short Name: the descriptive part" — for
 * example "Portugal Coastal Charms: Lisbon Tram 28, Sintra Pena Palace &
 * Porto Douro River". The part before the colon is the name a person would
 * actually search or recognise; the rest is itinerary detail.
 */
export function titleLead(fullTitle: string): string {
  const [lead] = fullTitle.split(/\s*[:\u2014–]\s*/);
  return (lead ?? fullTitle).trim();
}

/**
 * Picks the longest candidate that still fits, in order of preference.
 *
 * Every candidate is a complete, readable title rather than a truncation, so
 * the fallback degrades by dropping qualifiers instead of cutting words in
 * half. Truncation is the last resort and only happens if a single lead is
 * itself over the limit.
 */
export function fitTitle(candidates: string[], limit = TITLE_LIMIT): string {
  for (const c of candidates) {
    const t = c.trim();
    if (t && t.length <= limit) return t;
  }
  const last = candidates[candidates.length - 1] ?? "";
  if (last.length <= limit) return last;
  // Cut on a word boundary; a title ending mid-word reads as a bug.
  return last.slice(0, limit - 1).replace(/\s+\S*$/, "") + "…";
}

/** Title for a holiday package detail page. */
export function packageTitle(fullTitle: string, days: number, country: string): string {
  const lead = titleLead(fullTitle);
  return fitTitle([
    `${lead} | ${days}-Day ${country} Package from Dubai`,
    `${lead} | ${days}-Day ${country} from Dubai`,
    `${lead} | ${days} Days from Dubai`,
    `${lead} | Nawi Saadi`,
    lead,
  ]);
}

/** Title for a Dubai/UAE tour or attraction detail page. */
export function activityTitle(fullTitle: string, emirate?: string): string {
  const lead = titleLead(fullTitle);
  const where = emirate && emirate !== "Dubai" ? emirate : "Dubai";
  return fitTitle([
    `${lead} | Book Online in ${where}`,
    `${lead} | ${where} Tickets & Tours`,
    `${lead} | Nawi Saadi`,
    lead,
  ]);
}

/**
 * Trims a description to a length that survives the SERP, on a word boundary.
 *
 * The routes were using `.slice(0, 155)`, which cuts mid-word and produced
 * descriptions ending like "…the Heydar Aliyev Cent". Google will rewrite a
 * description it dislikes, and a visibly broken one invites exactly that.
 */
export function metaDescription(text: string, limit = 158): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= limit) return clean;
  return (
    clean
      .slice(0, limit - 1)
      .replace(/\s+\S*$/, "")
      .replace(/[,;:—–-]$/, "") + "…"
  );
}
