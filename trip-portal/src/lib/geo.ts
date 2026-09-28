/**
 * Coordinates and directions. Client-safe, no server imports.
 */

export type LatLng = { lat: number; lng: number };

export function isLatLng(lat: unknown, lng: unknown): boolean {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180 &&
    // 0,0 is a point in the Gulf of Guinea, and in practice it only ever means
    // "the field was left empty and coerced to a number".
    !(lat === 0 && lng === 0)
  );
}

/**
 * Directions from wherever the customer is standing, in the app they use.
 *
 * Three, not one: Google Maps is universal, Apple Maps is what an iPhone opens
 * without asking, and Waze is what most Dubai drivers — including the ones the
 * office hires — actually navigate with. A customer showing their driver a pin
 * wants it in the driver's app.
 */
export function directionsLinks(p: LatLng, label?: string | null) {
  const ll = `${p.lat},${p.lng}`;
  const name = label?.trim() ? encodeURIComponent(label.trim()) : ll;
  return {
    google: `https://www.google.com/maps/dir/?api=1&destination=${ll}`,
    apple: `https://maps.apple.com/?daddr=${ll}&q=${name}`,
    waze: `https://waze.com/ul?ll=${ll}&navigate=yes`,
  };
}

/** Directions to a place known only by name — the hotel card, for instance. */
export function searchLink(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * Reads coordinates out of a full Google Maps URL.
 *
 * In order of trust:
 *   1. `!3d<lat>!4d<lng>` — the place's own coordinates, present on any link
 *      copied from a place page.
 *   2. `?q=`, `query=`, `destination=`, `ll=` carrying "lat,lng".
 *   3. `@<lat>,<lng>,<zoom>` — where the map was centred. Last, because it is the
 *      viewport, not the pin: someone who panned before copying the link gets
 *      the middle of their screen, which can be streets away from the place.
 *
 * Short links (maps.app.goo.gl) carry none of this; they are resolved on the
 * server first, see lib/places.ts.
 */
export function coordsFromMapsUrl(url: string): (LatLng & { name?: string }) | null {
  let text = url;
  try {
    text = decodeURIComponent(url);
  } catch {
    /* keep it raw */
  }
  const num = "(-?\\d{1,3}(?:\\.\\d+)?)";

  let found: LatLng | null = null;
  const place = new RegExp(`!3d${num}!4d${num}`).exec(text);
  if (place) found = { lat: Number(place[1]), lng: Number(place[2]) };

  if (!found) {
    const q = new RegExp(`[?&](?:q|query|destination|daddr|ll|center)=${num},\\s*${num}`).exec(
      text,
    );
    if (q) found = { lat: Number(q[1]), lng: Number(q[2]) };
  }
  if (!found) {
    const at = new RegExp(`@${num},${num}`).exec(text);
    if (at) found = { lat: Number(at[1]), lng: Number(at[2]) };
  }
  if (!found || !isLatLng(found.lat, found.lng)) return null;

  // "/place/Dubai+Mall/@25.19..." — the name the office would have typed anyway.
  const nameMatch = /\/place\/([^/@?]+)/.exec(text);
  const name = nameMatch?.[1]?.replace(/\+/g, " ").trim();
  return name ? { ...found, name } : found;
}
