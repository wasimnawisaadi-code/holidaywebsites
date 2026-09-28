import { createServerFn } from "@tanstack/react-start";

import { coordsFromMapsUrl, isLatLng } from "./geo";
import { requireSession } from "./session";

/**
 * Finding a place without typing coordinates. Staff only.
 *
 * The office used to have to type "25.2532" and "55.3657" into two boxes to put
 * a pin on a step, which nobody does, so steps went out with a name and no map.
 * Two ways in instead:
 *
 *   - search by name, through OpenStreetMap's Nominatim geocoder — free, no API
 *     key, and no monthly bill. Its usage policy allows one request a second and
 *     forbids search-as-you-type, so the admin searches on a button press, and
 *     every request identifies this application as the policy requires.
 *   - paste a Google Maps link, which is how a consultant actually shares a
 *     place. Short `maps.app.goo.gl` links are followed server-side to the full
 *     URL, whose coordinates are then read locally.
 */

const USER_AGENT =
  "NawiSaadiTripPortal/1.0 (+https://nawi-saadi-trip-portal.vercel.app; nawisaadiholidays@gmail.com)";

export type PlaceHit = { name: string; detail: string; lat: number; lng: number };

export const searchPlaces = createServerFn({ method: "POST" })
  .validator((query: string) => query)
  .handler(
    async ({
      data: query,
    }): Promise<{ ok: true; hits: PlaceHit[] } | { ok: false; reason: string }> => {
      await requireSession();
      const q = query.trim().slice(0, 200);
      if (q.length < 2) return { ok: false, reason: "Type at least two letters." };

      try {
        const url =
          "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&accept-language=en&q=" +
          encodeURIComponent(q);
        const res = await fetch(url, {
          headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
        });
        if (res.status === 429)
          return { ok: false, reason: "Too many searches at once — wait a second and try again." };
        if (!res.ok) return { ok: false, reason: "The map search is not answering right now." };
        const rows = (await res.json()) as { display_name?: string; lat?: string; lon?: string }[];
        const hits: PlaceHit[] = rows
          .map((r) => {
            const parts = (r.display_name ?? "").split(",").map((s) => s.trim());
            return {
              name: parts[0] ?? "",
              detail: parts.slice(1, 4).join(", "),
              lat: Number(r.lat),
              lng: Number(r.lon),
            };
          })
          .filter((h) => h.name && isLatLng(h.lat, h.lng));
        return hits.length
          ? { ok: true, hits }
          : {
              ok: false,
              reason: `Nothing found for "${q}". Try the English name, or paste a Google Maps link.`,
            };
      } catch {
        return { ok: false, reason: "The map search is not answering right now." };
      }
    },
  );

/**
 * Hosts a short link may be followed through. Checked on every hop, not just
 * the first: an old goo.gl link can redirect anywhere, and following arbitrary
 * redirects from a server is how an internal address gets fetched on someone
 * else's behalf.
 */
const FOLLOWABLE = new Set([
  "maps.app.goo.gl",
  "goo.gl",
  "g.co",
  "maps.google.com",
  "www.google.com",
  "google.com",
  "consent.google.com",
]);
const followable = (u: URL) => u.protocol === "https:" && FOLLOWABLE.has(u.hostname);
const UNREADABLE =
  "Couldn't read a location from that link. Open it, tap Share → Copy link, and paste again.";

export const resolveMapsLink = createServerFn({ method: "POST" })
  .validator((url: string) => url)
  .handler(
    async ({
      data: raw,
    }): Promise<
      { ok: true; lat: number; lng: number; name: string | null } | { ok: false; reason: string }
    > => {
      await requireSession();
      const text = raw.trim().slice(0, 2000);

      // A full link already carries the coordinates.
      const direct = coordsFromMapsUrl(text);
      if (direct) return { ok: true, lat: direct.lat, lng: direct.lng, name: direct.name ?? null };

      let url: URL;
      try {
        url = new URL(text);
      } catch {
        return {
          ok: false,
          reason: "That doesn't look like a link. Paste the whole Google Maps link.",
        };
      }
      if (!followable(url)) {
        return { ok: false, reason: "Only Google Maps links can be read." };
      }

      try {
        // Redirects are followed by hand, a few hops at most, so each one can be
        // checked against the list above before it is requested.
        let current = url;
        for (let hop = 0; hop < 6; hop++) {
          // A hop's own address often carries the place already — the full maps
          // link, or a consent page with that link in its `continue` parameter.
          const here = coordsFromMapsUrl(current.toString());
          if (here) return { ok: true, lat: here.lat, lng: here.lng, name: here.name ?? null };

          const res = await fetch(current, {
            redirect: "manual",
            headers: { "User-Agent": USER_AGENT },
          });
          const next = res.headers.get("location");
          if (res.status >= 300 && res.status < 400 && next) {
            const to = new URL(next, current);
            if (!followable(to)) {
              return { ok: false, reason: "That link leads somewhere other than Google Maps." };
            }
            current = to;
            continue;
          }
          // The end of the chain. Last resort: the page itself. The pin shows on
          // the map straight away, so a wrong guess here is seen, not shipped.
          const inPage = res.ok ? coordsFromMapsUrl((await res.text()).slice(0, 200_000)) : null;
          return inPage
            ? { ok: true, lat: inPage.lat, lng: inPage.lng, name: inPage.name ?? null }
            : { ok: false, reason: UNREADABLE };
        }
        return { ok: false, reason: UNREADABLE };
      } catch {
        return { ok: false, reason: "Couldn't open that link." };
      }
    },
  );
