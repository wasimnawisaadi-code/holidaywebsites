/**
 * Country types, separated from the country data.
 *
 * A card that needs CountryRegion should not have to import 43KB of visa notes
 * and highlight lists to name the type.
 */
export type CountryRegion = "Europe" | "Asia" | "Africa" | "Eurasia" | "Australia" | "America";

/** Display order for the region tabs. */
export const countryRegions: CountryRegion[] = [
  "Europe",
  "Asia",
  "Africa",
  "Eurasia",
  "Australia",
  "America",
];
