import { InvoiceCard } from "./InvoiceCard";
import type { Block, Driver, Invoice, TripDocument } from "@/lib/types";

/**
 * Renders the content the office built in the admin.
 *
 * One switch over `kind`, and each branch reads only the two or three payload
 * fields it needs. An unknown kind renders nothing rather than throwing: a block
 * created by a newer admin build must not take down the itinerary of a customer
 * standing in an airport, and a silently missing paragraph is a far better
 * failure than a blank page.
 *
 * Every image and video URL arriving here is already signed — see `signBlock`
 * in lib/trips.ts. This component never touches storage.
 */

type Ctx = {
  drivers: Driver[];
  documents: TripDocument[];
  invoices?: Invoice[];
  /** Fired when a customer plays a video or opens a document. */
  onEngage?: (event: string, detail: string) => void;
};

export function BlockList({ blocks, ctx }: { blocks: Block[]; ctx: Ctx }) {
  if (!blocks.length) return null;
  return (
    <div className="flex flex-col gap-4">
      {blocks.map((b) => (
        <BlockView key={b.id} block={b} ctx={ctx} />
      ))}
    </div>
  );
}

function BlockView({ block, ctx }: { block: Block; ctx: Ctx }) {
  const p = block.payload ?? {};

  switch (block.kind) {
    case "heading":
      return (
        <h4 className="font-sans text-sm font-bold tracking-tight text-navy">
          {p.heading ?? p.text}
        </h4>
      );

    case "text":
      return p.text ? (
        <p className="text-[15px] leading-relaxed whitespace-pre-line text-ink">{p.text}</p>
      ) : null;

    case "image":
      return p.url ? (
        <figure className="overflow-hidden rounded-xl border border-hair bg-white">
          <img
            src={p.url}
            alt={p.caption ?? ""}
            // Explicit dimensions are unknown (the office uploads any size), so
            // aspect-ratio holds the space instead. Without it the page jumps as
            // each photo lands, which on a slow airport connection means the
            // customer loses their place three times while reading.
            className="block w-full bg-paper object-cover"
            style={{ aspectRatio: "4 / 3" }}
            loading="lazy"
          />
          {p.caption ? (
            <figcaption className="px-3 py-2 text-xs leading-relaxed text-muted">
              {p.caption}
            </figcaption>
          ) : null}
        </figure>
      ) : null;

    case "gallery": {
      const urls = (p.urls ?? []).filter(Boolean) as string[];
      if (!urls.length) return null;
      return (
        <div className="grid grid-cols-2 gap-2">
          {urls.map((u, i) => (
            <img
              key={u + i}
              src={u}
              alt={p.caption ? `${p.caption} ${i + 1}` : ""}
              className="w-full rounded-lg border border-hair bg-paper object-cover"
              style={{ aspectRatio: "1 / 1" }}
              loading="lazy"
            />
          ))}
        </div>
      );
    }

    case "video":
      // The reason this whole system exists, per the brief: a 15-second clip of
      // which exit to walk out of. `playsInline` matters — without it iOS takes
      // the video fullscreen, which loses the written instructions beside it.
      return p.url ? (
        <div className="overflow-hidden rounded-xl border border-hair bg-black">
          <video
            src={p.url}
            poster={p.posterUrl ?? undefined}
            controls
            playsInline
            preload="metadata"
            className="block w-full"
            style={{ aspectRatio: "16 / 9" }}
            onPlay={() => ctx.onEngage?.("video", p.label ?? p.caption ?? "video")}
          />
          {p.caption || p.label ? (
            <p className="bg-white px-3 py-2 text-xs leading-relaxed text-muted">
              {p.label ?? p.caption}
            </p>
          ) : null}
        </div>
      ) : null;

    case "map": {
      const { latitude: lat, longitude: lng, locationName } = p;
      if (lat == null || lng == null) {
        return locationName ? <LocationLine name={locationName} /> : null;
      }
      // A link to the customer's own maps app, not an embedded iframe. An embed
      // needs a Google Maps API key, costs money per load, and is useless to the
      // person who actually wants turn-by-turn directions from where they are
      // standing. The link opens whichever app they already have.
      return (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => ctx.onEngage?.("map", locationName ?? `${lat},${lng}`)}
          className="flex items-center gap-3 rounded-xl border border-hair bg-white p-3.5 transition-colors hover:border-gold"
        >
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-lg bg-navy/8 text-lg"
          >
            📍
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-navy">
              {locationName ?? "Open location"}
            </span>
            <span className="block text-xs text-muted">Tap to open in Maps</span>
          </span>
        </a>
      );
    }

    case "driver": {
      const driver = ctx.drivers.find((d) => d.id === p.driverId);
      return driver ? <DriverCard driver={driver} onEngage={ctx.onEngage} /> : null;
    }

    case "hotel":
      return (
        <DetailCard
          icon="🏨"
          title={p.name ?? "Hotel"}
          rows={[
            ["Check in", p.checkIn],
            ["Check out", p.checkOut],
            ["Reference", p.reference],
            ["Phone", p.phone],
          ]}
          note={p.text}
        />
      );

    case "flight":
      return (
        <DetailCard
          icon="✈️"
          title={p.flightNumber ? `Flight ${p.flightNumber}` : "Flight"}
          rows={[
            ["Departure", p.departure],
            ["Arrival", p.arrival],
            ["Reference", p.reference],
          ]}
          note={p.text}
        />
      );

    case "ticket":
      return (
        <DetailCard
          icon="🎟️"
          title={p.name ?? "Ticket"}
          rows={[
            ["Reference", p.reference],
            ["Time", p.label],
          ]}
          note={p.text}
        />
      );

    case "document": {
      const doc = ctx.documents.find((d) => d.id === p.documentId);
      if (!doc?.url) return null;
      return <DocumentLink doc={doc} onEngage={ctx.onEngage} />;
    }

    case "contact":
      return (
        <div className="rounded-xl border border-hair bg-white p-3.5">
          <p className="text-sm font-semibold text-navy">{p.name ?? "Contact"}</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {p.phone ? <CallButton href={`tel:${p.phone}`} label="Call" /> : null}
            {p.whatsapp ? (
              <CallButton
                href={`https://wa.me/${p.whatsapp.replace(/[^\d]/g, "")}`}
                label="WhatsApp"
                tone="gold"
              />
            ) : null}
          </div>
          {p.text ? <p className="mt-2.5 text-xs leading-relaxed text-muted">{p.text}</p> : null}
        </div>
      );

    case "notice": {
      // Three tones, because "be ready 10 minutes early" and "do not leave the
      // terminal" are not the same message and must not look the same.
      const tone = p.tone ?? "info";
      const style =
        tone === "critical"
          ? "border-alert/35 bg-alert/8 text-alert"
          : tone === "warning"
            ? "border-gold/45 bg-gold/10 text-gold-deep"
            : "border-navy/20 bg-navy/5 text-navy";
      return (
        <div className={`rounded-xl border p-3.5 ${style}`}>
          {p.heading ? <p className="text-sm font-bold">{p.heading}</p> : null}
          {p.text ? (
            <p className="mt-1 text-sm leading-relaxed whitespace-pre-line">{p.text}</p>
          ) : null}
        </div>
      );
    }

    case "emergency":
      return (
        <div className="rounded-xl border border-alert/35 bg-alert/8 p-3.5">
          <p className="text-sm font-bold text-alert">{p.heading ?? "In an emergency"}</p>
          {p.text ? <p className="mt-1 text-sm leading-relaxed text-ink">{p.text}</p> : null}
          <div className="mt-2.5 flex flex-wrap gap-2">
            {p.phone ? (
              <CallButton href={`tel:${p.phone}`} label={`Call ${p.name ?? "us"}`} />
            ) : null}
          </div>
        </div>
      );

    case "link":
      return p.href ? (
        <a
          href={p.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => ctx.onEngage?.("link", p.label ?? p.href ?? "")}
          className="flex items-center justify-between gap-3 rounded-xl border border-hair bg-white p-3.5 text-sm font-semibold text-navy transition-colors hover:border-gold"
        >
          <span className="min-w-0 truncate">{p.label ?? p.href}</span>
          <span aria-hidden="true" className="shrink-0 text-muted">
            ↗
          </span>
        </a>
      ) : null;

    case "invoice": {
      // Looked up by id rather than embedded in the payload, so that editing an
      // invoice updates every place it appears. A copy stored in the block would
      // keep showing the old balance after a payment was recorded.
      const invoice = ctx.invoices?.find((i) => i.id === p.invoiceId);
      return invoice ? <InvoiceCard invoice={invoice} onEngage={ctx.onEngage} /> : null;
    }

    case "checklist": {
      const items = p.items ?? [];
      if (!items.length) return null;
      return (
        <div className="rounded-xl border border-hair bg-white p-3.5">
          {p.heading ? <p className="mb-2 text-sm font-bold text-navy">{p.heading}</p> : null}
          <ul className="flex flex-col gap-1.5">
            {items.map((item, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-ink">
                <span aria-hidden="true" className="mt-0.5 shrink-0 text-gold-deep">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    default:
      return null;
  }
}

/* ---------------------------------------------------------------------- */

function LocationLine({ name }: { name: string }) {
  return (
    <p className="flex items-center gap-2 text-sm text-muted">
      <span aria-hidden="true">📍</span>
      <span>{name}</span>
    </p>
  );
}

function CallButton({
  href,
  label,
  tone = "navy",
}: {
  href: string;
  label: string;
  tone?: "navy" | "gold";
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className={`inline-flex items-center rounded-lg px-4 py-2 text-xs font-bold ${
        tone === "gold" ? "bg-gold text-navy" : "bg-navy text-white"
      }`}
    >
      {label}
    </a>
  );
}

function DetailCard({
  icon,
  title,
  rows,
  note,
}: {
  icon: string;
  title: string;
  rows: [string, string | undefined][];
  note?: string | undefined;
}) {
  const present = rows.filter(([, v]) => Boolean(v));
  return (
    <div className="rounded-xl border border-hair bg-white p-3.5">
      <p className="flex items-center gap-2 text-sm font-semibold text-navy">
        <span aria-hidden="true">{icon}</span>
        <span>{title}</span>
      </p>
      {present.length ? (
        <dl className="mt-2.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
          {present.map(([k, v]) => (
            <div key={k} className="col-span-2 grid grid-cols-subgrid">
              <dt className="text-muted">{k}</dt>
              <dd className="font-semibold text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {note ? <p className="mt-2.5 text-xs leading-relaxed text-muted">{note}</p> : null}
    </div>
  );
}

/**
 * The driver card.
 *
 * Photograph, name, vehicle and plate, then call and WhatsApp as the two
 * largest things on it. This is read while standing on a kerb looking for a
 * car, so the plate number is set large and in tabular figures — at a glance,
 * from a distance, against a moving background.
 */
export function DriverCard({
  driver,
  onEngage,
}: {
  driver: Driver;
  onEngage?: ((event: string, detail: string) => void) | undefined;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-hair bg-white">
      <div className="flex gap-3.5 p-3.5">
        {driver.photoUrl ? (
          <img
            src={driver.photoUrl}
            alt={driver.full_name}
            className="size-16 shrink-0 rounded-xl border border-hair object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="grid size-16 shrink-0 place-items-center rounded-xl bg-navy/8 text-2xl"
          >
            🚗
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-gold-deep uppercase">
            Your driver
          </p>
          <p className="mt-0.5 truncate text-base font-bold text-navy">{driver.full_name}</p>
          {driver.vehicle ? <p className="truncate text-xs text-muted">{driver.vehicle}</p> : null}
          {driver.languages ? (
            <p className="truncate text-xs text-muted">Speaks {driver.languages}</p>
          ) : null}
        </div>
      </div>

      {driver.plate_number ? (
        <div className="mx-3.5 rounded-lg bg-paper px-3 py-2.5 text-center">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">
            Vehicle plate
          </p>
          <p className="font-mono text-xl font-bold tracking-wider tabular-nums text-navy">
            {driver.plate_number}
          </p>
        </div>
      ) : null}

      <div className="flex gap-2 p-3.5">
        {driver.phone ? (
          <a
            href={`tel:${driver.phone}`}
            onClick={() => onEngage?.("driver_call", driver.full_name)}
            className="flex-1 rounded-lg bg-navy py-2.5 text-center text-xs font-bold text-white"
          >
            Call driver
          </a>
        ) : null}
        {driver.whatsapp ? (
          <a
            href={`https://wa.me/${driver.whatsapp.replace(/[^\d]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onEngage?.("driver_whatsapp", driver.full_name)}
            className="flex-1 rounded-lg bg-gold py-2.5 text-center text-xs font-bold text-navy"
          >
            WhatsApp
          </a>
        ) : null}
      </div>
    </div>
  );
}

export function DocumentLink({
  doc,
  onEngage,
}: {
  doc: TripDocument;
  onEngage?: ((event: string, detail: string) => void) | undefined;
}) {
  if (!doc.url) return null;
  return (
    <a
      href={doc.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onEngage?.("document_open", doc.name)}
      className="flex items-center gap-3 rounded-xl border border-hair bg-white p-3.5 transition-colors hover:border-gold"
    >
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center rounded-lg bg-navy/8 text-lg"
      >
        📄
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-navy">{doc.name}</span>
        {doc.doc_type ? <span className="block text-xs text-muted">{doc.doc_type}</span> : null}
      </span>
      <span aria-hidden="true" className="shrink-0 text-muted">
        ↓
      </span>
    </a>
  );
}
