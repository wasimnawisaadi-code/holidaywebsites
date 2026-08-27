/**
 * Repairs the broken output of the earlier normalize-surfaces.mjs pass.
 *
 * `rule-paper` was only ever defined with `border-color`, so `border-b rule-paper`
 * never worked as two Tailwind classes — the class list needs a real border-width
 * utility (border/border-t/border-b/border-y) PLUS an explicit border colour.
 * `surface-paper`/`surface-raised` are background-only, so `surface-paper/95`
 * (opacity suffix) is meaningless and was silently dropped by Tailwind.
 *
 * This pass replaces the custom utilities with the plain, always-valid classes
 * they were meant to shorthand, so every className stays valid Tailwind.
 */
import fs from "node:fs";

const files = [
  "src/routes/activities.index.tsx",
  "src/routes/customized-tours.tsx",
  "src/routes/deals.tsx",
  "src/routes/holidays.index.tsx",
  "src/routes/index.tsx",
  "src/routes/plan.tsx",
  "src/components/site/DestinationRail.tsx",
  "src/components/site/JourneyHero.tsx",
  "src/components/site/ScrollJourney.tsx",
  "src/components/site/SiteFooter.tsx",
  "src/components/site/SiteHeader.tsx",
  "src/components/3d/HolidayArc.tsx",
];

let total = 0;
for (const file of files) {
  let s = fs.readFileSync(file, "utf8");
  const before = s;

  // rule-paper -> border-[#e6ded0] (keeps whatever border-width utility precedes it)
  s = s.split("rule-paper").join("border-[#e6ded0]");

  // surface-paper/95 (opacity suffix on a background utility isn't valid — the
  // header wanted a translucent paper background) -> bg-[#f7f5f1]/95
  s = s.split("surface-paper/95").join("bg-[#f7f5f1]/95");
  // Remaining bare occurrences -> plain background utilities.
  s = s.split("surface-paper").join("bg-[#f7f5f1]");
  s = s.split("surface-raised").join("bg-[#FCFDFE]");
  s = s.split("surface-navy").join("bg-[#003058] text-white");

  if (s !== before) {
    fs.writeFileSync(file, s);
    total++;
    console.log("fixed", file);
  }
}
console.log("total files fixed:", total);
