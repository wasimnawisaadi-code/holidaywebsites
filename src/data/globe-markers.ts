/**
 * Latitude/longitude for every destination that has a country page.
 *
 * These are the coordinates of the city a traveller actually flies into for
 * that package — Interlaken rather than the centroid of Switzerland — because
 * the marker is a place you can go, not a political average. Slugs are checked
 * against `countries.ts`; a marker whose slug has no country page is dropped at
 * build of the marker list rather than routing to a 404.
 */

import { countries } from "./countries";

export type GlobeMarker = {
  slug: string;
  name: string;
  /** Degrees, north positive. */
  lat: number;
  /** Degrees, east positive. */
  lon: number;
  region: string;
  fromAed?: number;
  image: string;
  tagline: string;
};

/** Anchor city per destination, in degrees. */
const COORDS: Record<string, [number, number]> = {
  // Europe
  switzerland: [46.6863, 7.8632], // Interlaken
  france: [48.8566, 2.3522], // Paris
  italy: [41.9028, 12.4964], // Rome
  "united-kingdom": [51.5072, -0.1276], // London
  finland: [66.5039, 25.7294], // Rovaniemi
  "czech-republic": [50.0755, 14.4378], // Prague
  austria: [47.8095, 13.055], // Salzburg
  hungary: [47.4979, 19.0402], // Budapest
  greece: [37.9838, 23.7275], // Athens
  serbia: [44.7866, 20.4489], // Belgrade

  // Asia
  japan: [35.6762, 139.6503], // Tokyo
  indonesia: [-8.4095, 115.1889], // Bali
  singapore: [1.3521, 103.8198],
  malaysia: [3.139, 101.6869], // Kuala Lumpur
  thailand: [13.7563, 100.5018], // Bangkok
  maldives: [4.1755, 73.5093], // Malé
  "sri-lanka": [6.9271, 79.8612], // Colombo
  vietnam: [21.0278, 105.8342], // Hanoi
  nepal: [27.7172, 85.324], // Kathmandu
  china: [39.9042, 116.4074], // Beijing
  "south-korea": [37.5665, 126.978], // Seoul
  kyrgyzstan: [42.8746, 74.5698], // Bishkek
  "hong-kong": [22.3193, 114.1694],

  // Africa
  morocco: [31.6295, -7.9811], // Marrakech
  kenya: [-1.2921, 36.8219], // Nairobi
  egypt: [30.0444, 31.2357], // Cairo
  tanzania: [-3.3869, 36.683], // Arusha
  "south-africa": [-33.9249, 18.4241], // Cape Town
  seychelles: [-4.6796, 55.492], // Victoria

  // Eurasia
  turkey: [38.6431, 34.8289], // Cappadocia
  georgia: [41.7151, 44.8271], // Tbilisi
  azerbaijan: [40.4093, 49.8671], // Baku
  armenia: [40.1792, 44.4991], // Yerevan
  kazakhstan: [43.222, 76.8512], // Almaty
  jordan: [30.3285, 35.4444], // Petra
  uzbekistan: [39.6542, 66.9597], // Samarkand

  // Australia & Americas
  australia: [-33.8688, 151.2093], // Sydney
  "united-states": [40.7128, -74.006], // New York
  argentina: [-34.6037, -58.3816], // Buenos Aires
  brazil: [-22.9068, -43.1729], // Rio de Janeiro
};

/** Home base — always drawn, always gold, never a link away from the site. */
export const HOME: { name: string; lat: number; lon: number } = {
  name: "Dubai",
  lat: 25.2048,
  lon: 55.2708,
};

/**
 * Markers, built from the country catalogue so the globe can never advertise a
 * destination the site does not sell.
 */
export const globeMarkers: GlobeMarker[] = countries
  .filter((country) => COORDS[country.slug])
  .map((country) => {
    const [lat, lon] = COORDS[country.slug]!;
    return {
      slug: country.slug,
      name: country.name,
      lat,
      lon,
      region: country.region,
      // Spread rather than assign: under exactOptionalPropertyTypes an
      // explicit `undefined` is not the same as an absent optional field.
      ...(country.fromAed !== undefined ? { fromAed: country.fromAed } : {}),
      image: country.image,
      tagline: country.tagline,
    };
  });

/** Convert degrees lat/lon to a point on a sphere of the given radius. */
export function latLonToVec3(
  lat: number,
  lon: number,
  radius: number,
): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return [
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}
