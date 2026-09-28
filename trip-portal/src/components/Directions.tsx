import { Icon } from "./Icon";
import { directionsLinks } from "@/lib/geo";

/**
 * "Take me there", in the app the customer — or their driver — already uses.
 *
 * Google Maps first because it works on every phone. Apple Maps because it is
 * what an iPhone opens without asking. Waze because it is what most Dubai
 * drivers navigate with: a customer handing their phone to a taxi driver wants
 * the pin already in the driver's app.
 */
export function Directions({
  lat,
  lng,
  label,
  onEngage,
  compact = false,
}: {
  lat: number;
  lng: number;
  label?: string | null | undefined;
  onEngage?: ((event: string, detail: string) => void) | undefined;
  compact?: boolean;
}) {
  const links = directionsLinks({ lat, lng }, label);
  // Short names when the buttons sit in a narrow column, so "Google Maps"
  // doesn't truncate to "Google M…"; the full name is still what is announced.
  const apps = [
    { key: "google", name: "Google Maps", short: "Google", href: links.google },
    { key: "apple", name: "Apple Maps", short: "Apple", href: links.apple },
    { key: "waze", name: "Waze", short: "Waze", href: links.waze },
  ] as const;

  return (
    <div className={`grid grid-cols-3 ${compact ? "gap-1.5" : "gap-2"}`}>
      {apps.map((app, i) => (
        <a
          key={app.key}
          href={app.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Directions in ${app.name}`}
          onClick={() => onEngage?.("directions", `${app.name}: ${label ?? `${lat},${lng}`}`)}
          className={`flex items-center justify-center gap-1.5 rounded-xl font-semibold transition active:scale-[0.98] ${
            compact ? "px-2 py-2 text-[11px]" : "px-2 py-2.5 text-xs"
          } ${
            i === 0
              ? "bg-navy text-white hover:bg-navy-deep"
              : "border border-hair bg-white text-navy hover:border-gold"
          }`}
        >
          <Icon name="navigation" className="size-3.5 shrink-0" />
          <span className="truncate">{compact ? app.short : app.name}</span>
        </a>
      ))}
    </div>
  );
}
