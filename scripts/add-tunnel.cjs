const fs = require("fs");
const f = "src/routes/index.tsx";
let t = fs.readFileSync(f, "utf8");

t = t.replace(
  'import { DestinationRail, type RailItem } from "@/components/site/DestinationRail";',
  'import { JourneyTunnel, type TunnelStop } from "@/components/3d/JourneyTunnel";'
);

// Replace the DestinationsRail component body.
const old = t.match(/function DestinationsRail\(\) \{[\s\S]*?\n\}\n/);
if (!old) { console.log("!! DestinationsRail not found"); process.exit(1); }
t = t.replace(old[0], `function DestinationsTunnel() {
  const stops = useMemo<TunnelStop[]>(
    () =>
      countries
        .filter((c) => typeof c.fromAed === "number")
        .sort((a, b) => (a.fromAed ?? 0) - (b.fromAed ?? 0))
        .slice(0, 12)
        .map((c) => ({
          slug: c.slug,
          name: c.name,
          tagline: c.tagline,
          image: c.image,
          price:
            typeof c.fromAed === "number"
              ? \`From AED \${c.fromAed.toLocaleString()}\`
              : "Price on request",
        })),
    [],
  );

  return <JourneyTunnel stops={stops} />;
}
`);
t = t.replace("<DestinationsRail />", "<DestinationsTunnel />");
fs.writeFileSync(f, t);
console.log("ok; RailItem refs left: " + (t.match(/RailItem|DestinationRail/g) || []).length);
