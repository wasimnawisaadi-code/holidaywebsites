import { useId, useState, type KeyboardEvent } from "react";

import { Icon } from "./Icon";
import { MapView } from "./MapView";
import { isLatLng } from "@/lib/geo";
import { resolveMapsLink, searchPlaces, type PlaceHit } from "@/lib/places";

/**
 * Putting a pin on a step, the way the office actually knows places.
 *
 * Three ways in, in the order they get used: search a name, paste the Google
 * Maps link a colleague sent, or drag the pin. The drag is the one that matters
 * at an airport — a search for "DXB Terminal 3" lands in the middle of a
 * building a kilometre long, and the customer needs Exit 2, not the terminal.
 *
 * Typing coordinates is still possible, folded away, for the one colleague who
 * has them written down.
 */

export type PickedLocation = {
  name: string;
  lat?: number | undefined;
  lng?: number | undefined;
};

export function LocationPicker({
  value,
  onChange,
  nameLabel = "Location name",
  namePlaceholder = "DXB Terminal 3, Exit 2",
  inputName,
}: {
  value: PickedLocation;
  onChange: (v: PickedLocation) => void;
  nameLabel?: string;
  namePlaceholder?: string;
  /** The name input's form name, for a form that is read with FormData. */
  inputName?: string;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [link, setLink] = useState("");
  const [hits, setHits] = useState<PlaceHit[]>([]);
  const [busy, setBusy] = useState<"search" | "link" | null>(null);
  const [message, setMessage] = useState("");

  const pinned = isLatLng(value.lat, value.lng);

  const search = async () => {
    const q = (query || value.name).trim();
    if (!q || busy) return;
    setBusy("search");
    setMessage("");
    setHits([]);
    try {
      const result = await searchPlaces({ data: q });
      if (result.ok) setHits(result.hits);
      else setMessage(result.reason);
    } catch {
      setMessage("The map search is not answering right now.");
    } finally {
      setBusy(null);
    }
  };

  const readLink = async () => {
    const url = link.trim();
    if (!url || busy) return;
    setBusy("link");
    setMessage("");
    try {
      const result = await resolveMapsLink({ data: url });
      if (result.ok) {
        onChange({ name: value.name || result.name || "", lat: result.lat, lng: result.lng });
        setLink("");
        setMessage("Pin placed from the link. Drag it if it needs to be more exact.");
      } else setMessage(result.reason);
    } catch {
      setMessage("Couldn't open that link.");
    } finally {
      setBusy(null);
    }
  };

  // Enter inside these boxes runs the lookup. Without this it submits the step
  // form around them, saving a half-finished step.
  const onEnter = (run: () => void) => (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      run();
    }
  };

  return (
    <div className="rounded-xl border border-hair bg-white p-3">
      <label htmlFor={`${id}-name`} className="block text-xs font-semibold text-navy">
        {nameLabel}
      </label>
      <input
        id={`${id}-name`}
        name={inputName}
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
        onKeyDown={onEnter(() => {})}
        placeholder={namePlaceholder}
        className="mt-1.5 w-full rounded-lg border border-hair px-3 py-2 text-sm outline-none focus:border-gold"
      />

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="flex gap-1.5">
          <label htmlFor={`${id}-q`} className="sr-only">
            Search the map
          </label>
          <input
            id={`${id}-q`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onEnter(() => void search())}
            placeholder="Search a place…"
            className="min-w-0 flex-1 rounded-lg border border-hair px-3 py-2 text-xs outline-none focus:border-gold"
          />
          <button
            type="button"
            onClick={() => void search()}
            disabled={busy !== null}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-navy px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
          >
            <Icon name="search" className="size-3.5" />
            {busy === "search" ? "Searching…" : "Search"}
          </button>
        </div>
        <div className="flex gap-1.5">
          <label htmlFor={`${id}-link`} className="sr-only">
            Paste a Google Maps link
          </label>
          <input
            id={`${id}-link`}
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={onEnter(() => void readLink())}
            placeholder="…or paste a Google Maps link"
            className="min-w-0 flex-1 rounded-lg border border-hair px-3 py-2 text-xs outline-none focus:border-gold"
          />
          <button
            type="button"
            onClick={() => void readLink()}
            disabled={busy !== null}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-hair bg-white px-3 py-2 text-xs font-bold text-navy disabled:opacity-60"
          >
            <Icon name="link" className="size-3.5" />
            {busy === "link" ? "Reading…" : "Use link"}
          </button>
        </div>
      </div>

      {hits.length ? (
        <ul
          className="mt-2 overflow-hidden rounded-lg border border-hair"
          aria-label="Search results"
        >
          {hits.map((h) => (
            <li key={`${h.lat},${h.lng}`} className="border-b border-hair last:border-0">
              <button
                type="button"
                onClick={() => {
                  onChange({ name: value.name || h.name, lat: h.lat, lng: h.lng });
                  setHits([]);
                  setMessage("Pin placed. Drag it to the exact door, exit or kiosk.");
                }}
                className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-sand"
              >
                <Icon name="pin" className="mt-0.5 size-3.5 shrink-0 text-gold-deep" />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-navy">{h.name}</span>
                  <span className="block truncate text-[11px] text-muted">{h.detail}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {message ? (
        <p role="status" className="mt-2 text-[11px] text-gold-deep">
          {message}
        </p>
      ) : null}

      <div className="mt-3">
        <MapView
          label="Choose the location"
          className="h-60"
          editable
          points={
            pinned ? [{ lat: value.lat!, lng: value.lng!, label: value.name || undefined }] : []
          }
          onPick={(p) => onChange({ ...value, lat: p.lat, lng: p.lng })}
        />
        <p className="mt-1.5 text-[11px] text-muted">
          {pinned
            ? "Drag the pin, or tap the map, to put it on the exact spot."
            : "Search, paste a link, or tap the map to drop a pin."}
        </p>
      </div>

      <details className="mt-2 text-[11px]">
        <summary className="cursor-pointer font-semibold text-navy">
          {pinned ? (
            <span className="font-mono text-live">
              <Icon name="check" className="mr-1 inline size-3" strokeWidth={2.5} />
              {value.lat!.toFixed(5)}, {value.lng!.toFixed(5)}
            </span>
          ) : (
            "Type coordinates instead"
          )}
        </summary>
        <div className="mt-2 grid grid-cols-[1fr_1fr_auto] items-end gap-2">
          <Coordinate
            label="Latitude"
            value={value.lat}
            onChange={(lat) => onChange({ ...value, lat })}
            placeholder="25.2532"
          />
          <Coordinate
            label="Longitude"
            value={value.lng}
            onChange={(lng) => onChange({ ...value, lng })}
            placeholder="55.3657"
          />
          <button
            type="button"
            onClick={() => onChange({ name: value.name, lat: undefined, lng: undefined })}
            disabled={value.lat === undefined && value.lng === undefined}
            className="rounded-lg border border-alert/40 px-3 py-2 font-semibold text-alert disabled:opacity-40"
          >
            Clear pin
          </button>
        </div>
      </details>
    </div>
  );
}

function Coordinate({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  placeholder: string;
}) {
  const id = useId();
  // Local text, so "25." can be typed on the way to "25.25" without the field
  // snapping back to "25" on every keystroke.
  const [text, setText] = useState(value?.toString() ?? "");
  const [seen, setSeen] = useState(value);
  if (value !== seen) {
    setSeen(value);
    setText(value?.toString() ?? "");
  }
  return (
    <div>
      <label htmlFor={id} className="block font-semibold text-navy">
        {label}
      </label>
      <input
        id={id}
        inputMode="decimal"
        value={text}
        placeholder={placeholder}
        onChange={(e) => {
          const t = e.target.value;
          setText(t);
          const n = t.trim() ? Number(t) : undefined;
          if (n !== undefined && !Number.isFinite(n)) return;
          // Recorded as seen before it goes up, so the value coming back down
          // is recognised as this field's own and does not overwrite "25.".
          setSeen(n);
          onChange(n);
        }}
        className="mt-1 w-full rounded-lg border border-hair px-2.5 py-1.5 font-mono text-xs outline-none focus:border-gold"
      />
    </div>
  );
}
