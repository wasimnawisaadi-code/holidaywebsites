/**
 * Turning whatever the office pastes into a hotel search.
 *
 * Staff copy hotels from wherever they found them: a Google Maps share link,
 * a Booking.com or Agoda page, a TripAdvisor review, the hotel's own website,
 * or just "Atlantis The Palm Dubai". This reads each of those into words
 * Google Places can search for. Pure functions, no network.
 *
 * Booking sites are not fetched. They block automated requests, and fetching
 * an arbitrary pasted URL from the server is how internal addresses get
 * reached. Their links almost always carry the hotel's name in the path,
 * which is all the search needs.
 */

export type HotelInput =
  | { kind: "maps"; name: string | null }
  | { kind: "text"; text: string }
  | { kind: "unreadable"; reason: string };

/** Booking and review sites: their own name says nothing about the hotel. */
const OTA_HOSTS = [
  "booking",
  "agoda",
  "expedia",
  "tripadvisor",
  "hotels",
  "trip",
  "kayak",
  "trivago",
  "airbnb",
  "makemytrip",
  "goibibo",
  "almosafer",
  "wego",
  "hotelscombined",
  "priceline",
  "hostelworld",
  "skyscanner",
  "cleartrip",
  "yatra",
  "travelocity",
  "orbitz",
  "momondo",
  "rehlat",
  "tajawal",
  "google",
];

/** Words that appear in hotel URLs but are never part of a hotel's name. */
const NOISE = new Set([
  "www",
  "com",
  "net",
  "org",
  "co",
  "html",
  "htm",
  "php",
  "aspx",
  "asp",
  "jsp",
  "en",
  "gb",
  "us",
  "ar",
  "fr",
  "de",
  "es",
  "it",
  "ru",
  "tr",
  "ae",
  "uk",
  "sa",
  "index",
  "default",
  "hotel",
  "hotels",
  "review",
  "reviews",
  "information",
  "info",
  "details",
  "detail",
  "rooms",
  "room",
  "book",
  "booking",
  "bookings",
  "reservation",
  "reservations",
  "stay",
  "stays",
  "property",
  "properties",
  "accommodation",
  "accommodations",
  "lodging",
  "overview",
  "home",
  "homepage",
  "travel",
  "search",
  "entity",
  "place",
  "places",
  "maps",
  "the",
  "and",
  "of",
  "at",
  "in",
  "by",
  "page",
  "offers",
  "deals",
  "hoteldetail",
  "hoteldetails",
  "hotelinfo",
  "propertydetails",
  "rates",
  "stays",
  "brands",
  "brand",
  "resorts",
]);

const decode = (s: string) => {
  try {
    return decodeURIComponent(s.replace(/\+/g, " "));
  } catch {
    return s.replace(/\+/g, " ");
  }
};

/** Is this a Google Maps link, short or long? */
function isMapsUrl(url: URL): boolean {
  const host = url.hostname.toLowerCase();
  if (host === "maps.app.goo.gl" || host === "g.co" || host === "goo.gl") return true;
  if (/^maps\.google\./.test(host)) return true;
  return /(^|\.)google\.[a-z.]+$/.test(host) && url.pathname.startsWith("/maps");
}

/** A text query parameter that is a name, not a pair of coordinates. */
function nameParam(url: URL): string | null {
  for (const key of ["q", "query", "destination", "ss"]) {
    const v = url.searchParams.get(key)?.trim();
    if (v && !/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(v)) return v.slice(0, 160);
  }
  return null;
}

/** The hotel name words in a booking-site or hotel-website link. */
export function wordsFromLink(url: URL): string {
  const hostParts = url.hostname
    .toLowerCase()
    .replace(/^www\./, "")
    .split(".");
  // The site's own name counts only when it is the hotel's website, e.g.
  // atlantis.com, not booking.com.
  const site = hostParts.length > 1 ? hostParts[hostParts.length - 2]! : hostParts[0]!;
  const fromHost = OTA_HOSTS.includes(site) ? [] : [site];

  const path = decode(url.pathname);
  const tokens = path
    .split(/[\s\-_./+,]+/)
    .map((t) => t.toLowerCase().normalize("NFKC"))
    .filter(
      (t) =>
        t.length > 1 &&
        !NOISE.has(t) &&
        !/^\d+$/.test(t) &&
        // Site ids: h1234 (Expedia), d302458 / g295424 (TripAdvisor), ho123 (Hotels.com).
        !/^[a-z]{1,2}\d{2,}$/.test(t) &&
        !/\d{5,}/.test(t),
    );

  const out: string[] = [];
  for (const t of [...fromHost, ...tokens]) if (!out.includes(t)) out.push(t);
  return out.slice(0, 10).join(" ");
}

/** What did the office paste? */
export function readHotelInput(raw: string): HotelInput {
  const text = raw.trim().slice(0, 2000);
  if (!/^https?:\/\//i.test(text)) {
    return text.length >= 3
      ? { kind: "text", text: text.slice(0, 160) }
      : { kind: "unreadable", reason: "Type at least three letters of the hotel's name." };
  }

  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return { kind: "unreadable", reason: "That link is incomplete. Copy the whole link again." };
  }

  if (isMapsUrl(url)) {
    const named = nameParam(url);
    if (named) return { kind: "text", text: named };
    const place = /\/place\/([^/@?]+)/.exec(url.pathname)?.[1];
    return { kind: "maps", name: place ? decode(place).trim() || null : null };
  }

  // A Google search or Google Travel link carries the hotel in its query.
  const named = nameParam(url);
  if (named && /(^|\.)google\./.test(url.hostname)) return { kind: "text", text: named };

  const words = wordsFromLink(url);
  if (words.length < 3) {
    return {
      kind: "unreadable",
      reason:
        "This link does not include the hotel's name. Type the hotel's name and city instead.",
    };
  }
  return { kind: "text", text: words };
}
