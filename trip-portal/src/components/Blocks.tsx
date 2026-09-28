import { useRef, useState } from "react";

import { Directions } from "./Directions";
import { Icon, type IconName } from "./Icon";
import { InvoiceCard } from "./InvoiceCard";
import { Lightbox, type LightboxPhoto } from "./Lightbox";
import { MapView } from "./MapView";
import { isLatLng, searchLink } from "@/lib/geo";
import type { Block, BlockPayload, Driver, Invoice, TripDocument } from "@/lib/types";

/**
 * Renders the content the office built in the admin.
 *
 * One switch over `kind`, and each branch reads only the fields it needs. An
 * unknown kind renders nothing rather than throwing: a block created by a newer
 * admin build must not take down the itinerary of a customer standing in an
 * airport, and a silently missing paragraph is a far better failure than a
 * blank page.
 *
 * Photographs lead. In an itinerary a photo is usually an instruction — this is
 * the exit, this is the kiosk your driver waits beside — so every photo is shown
 * wide and opens full-screen on tap, where the customer can actually read it.
 *
 * Every image and video URL arriving here is already signed — see `signBlock`
 * in lib/trips.ts. This component never touches storage.
 */

export type BlockCtx = {
  drivers: Driver[];
  documents: TripDocument[];
  invoices?: Invoice[];
  /** Where an invoice's PDF downloads from, or undefined to hide the button. */
  invoicePdfHref?: ((invoiceId: string) => string) | undefined;
  /** Fired when a customer plays a video, opens a photo or a document. */
  onEngage?: ((event: string, detail: string) => void) | undefined;
};

export function BlockList({ blocks, ctx }: { blocks: Block[]; ctx: BlockCtx }) {
  const [viewer, setViewer] = useState<{ photos: LightboxPhoto[]; start: number } | null>(null);
  if (!blocks.length) return null;

  const open = (photos: LightboxPhoto[], start: number, label: string) => {
    setViewer({ photos, start });
    ctx.onEngage?.("photo", label);
  };

  return (
    <div className="flex flex-col gap-4">
      {blocks.map((b) => (
        <BlockView key={b.id} block={b} ctx={ctx} openPhotos={open} />
      ))}
      {viewer ? (
        <Lightbox photos={viewer.photos} start={viewer.start} onClose={() => setViewer(null)} />
      ) : null}
    </div>
  );
}

type OpenPhotos = (photos: LightboxPhoto[], start: number, label: string) => void;

function BlockView({
  block,
  ctx,
  openPhotos,
}: {
  block: Block;
  ctx: BlockCtx;
  openPhotos: OpenPhotos;
}) {
  const p = block.payload ?? {};

  switch (block.kind) {
    case "heading":
      return <h4 className="font-display text-lg text-navy">{p.heading ?? p.text}</h4>;

    case "text":
      return p.text ? (
        <p className="text-[15px] leading-relaxed whitespace-pre-line text-ink">{p.text}</p>
      ) : null;

    case "image":
      return p.url ? (
        <figure>
          <PhotoButton
            url={p.url}
            alt={p.caption ?? ""}
            ratio="4 / 3"
            onOpen={() =>
              openPhotos([{ url: p.url!, caption: p.caption }], 0, p.caption ?? "photo")
            }
          />
          {p.caption ? (
            <figcaption className="mt-2 flex items-start gap-1.5 text-[13px] leading-relaxed text-muted">
              <Icon name="camera" className="mt-0.5 size-3.5 shrink-0 text-gold-deep" />
              <span>{p.caption}</span>
            </figcaption>
          ) : null}
        </figure>
      ) : null;

    case "gallery":
      return <Gallery urls={p.urls ?? []} caption={p.caption} openPhotos={openPhotos} />;

    case "video":
      // The reason this system exists, per the brief: a short clip of which exit
      // to walk out of. `playsInline` matters — without it iOS takes the video
      // fullscreen and the written instructions beside it disappear.
      return p.url ? (
        <figure className="overflow-hidden rounded-2xl border border-hair bg-black shadow-sm">
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
          {p.label || p.caption ? (
            <figcaption className="flex items-center gap-2 bg-white px-4 py-3">
              <Icon name="video" className="size-4 shrink-0 text-gold-deep" />
              <span className="text-sm font-semibold text-navy">{p.label ?? p.caption}</span>
            </figcaption>
          ) : null}
        </figure>
      ) : null;

    case "map": {
      const { latitude: lat, longitude: lng, locationName } = p;
      if (!isLatLng(lat, lng)) {
        return locationName ? (
          <p className="flex items-center gap-2 text-sm text-muted">
            <Icon name="pin" className="size-4 text-gold-deep" />
            <span>{locationName}</span>
          </p>
        ) : null;
      }
      // The map shows where; the buttons hand the "how do I get there" to the
      // customer's own maps app, which knows where they are standing.
      return (
        <div className="overflow-hidden rounded-2xl border border-hair bg-white shadow-sm">
          <MapView
            framed={false}
            className="h-44"
            label={locationName ? `Map: ${locationName}` : "Map"}
            points={[{ lat: lat!, lng: lng!, label: locationName }]}
          />
          <div className="p-3.5">
            <div className="flex items-center gap-3">
              <IconBadge name="pin" />
              <p className="min-w-0 flex-1 text-sm font-semibold text-navy">
                {locationName ?? "Meeting point"}
              </p>
            </div>
            <div className="mt-3">
              <Directions lat={lat!} lng={lng!} label={locationName} onEngage={ctx.onEngage} />
            </div>
          </div>
        </div>
      );
    }

    case "guide":
      return <PhotoGuide p={p} ctx={ctx} openPhotos={openPhotos} />;

    case "driver": {
      const driver = ctx.drivers.find((d) => d.id === p.driverId);
      return driver ? <DriverCard driver={driver} onEngage={ctx.onEngage} /> : null;
    }

    case "hotel":
      return (
        <DetailCard
          icon="hotel"
          eyebrow="Hotel"
          title={p.name ?? "Your hotel"}
          rows={[
            ["Check in", p.checkIn],
            ["Check out", p.checkOut],
            ["Booking ref.", p.reference],
            ["Phone", p.phone],
          ]}
          note={p.text}
          action={
            p.name
              ? {
                  href: searchLink(p.name),
                  label: "Directions to the hotel",
                  onClick: () => ctx.onEngage?.("directions", `Hotel: ${p.name}`),
                }
              : undefined
          }
        />
      );

    case "flight":
      return (
        <DetailCard
          icon="plane"
          eyebrow="Flight"
          title={p.flightNumber ? p.flightNumber : "Your flight"}
          rows={[
            ["Departs", p.departure],
            ["Arrives", p.arrival],
            ["Booking ref.", p.reference],
          ]}
          note={p.text}
        />
      );

    case "ticket":
      return (
        <DetailCard
          icon="ticket"
          eyebrow="Ticket"
          title={p.name ?? "Your ticket"}
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
        <div className="rounded-2xl border border-hair bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <IconBadge name="phone" />
            <p className="text-sm font-semibold text-navy">{p.name ?? "Contact"}</p>
          </div>
          {p.text ? <p className="mt-2.5 text-sm leading-relaxed text-muted">{p.text}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {p.phone ? <ActionLink href={`tel:${p.phone}`} icon="phone" label="Call" /> : null}
            {p.whatsapp ? (
              <ActionLink
                href={`https://wa.me/${p.whatsapp.replace(/[^\d]/g, "")}`}
                icon="chat"
                label="WhatsApp"
                tone="gold"
              />
            ) : null}
          </div>
        </div>
      );

    case "notice": {
      // Three tones, because "be ready 10 minutes early" and "do not leave the
      // terminal" are not the same message and must not look the same.
      const tone = p.tone ?? "info";
      const style =
        tone === "critical"
          ? "border-l-alert bg-alert/6 text-alert"
          : tone === "warning"
            ? "border-l-gold bg-sand text-gold-deep"
            : "border-l-navy bg-paper text-navy";
      return (
        <div className={`rounded-r-2xl border-l-4 px-4 py-3.5 ${style}`}>
          <div className="flex items-start gap-2.5">
            <Icon name={tone === "info" ? "shield" : "alert"} className="mt-0.5 size-4 shrink-0" />
            <div className="min-w-0">
              {p.heading ? <p className="text-sm font-bold">{p.heading}</p> : null}
              {p.text ? (
                <p className="mt-0.5 text-sm leading-relaxed whitespace-pre-line text-ink">
                  {p.text}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      );
    }

    case "emergency":
      return (
        <div className="rounded-2xl border border-alert/30 bg-alert/6 p-4">
          <div className="flex items-center gap-2.5">
            <Icon name="alert" className="size-4 text-alert" />
            <p className="text-sm font-bold text-alert">{p.heading ?? "In an emergency"}</p>
          </div>
          {p.text ? <p className="mt-2 text-sm leading-relaxed text-ink">{p.text}</p> : null}
          {p.phone ? (
            <div className="mt-3">
              <ActionLink
                href={`tel:${p.phone}`}
                icon="phone"
                label={`Call ${p.name ?? "now"}`}
                tone="alert"
              />
            </div>
          ) : null}
        </div>
      );

    case "link":
      return p.href ? (
        <a
          href={p.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => ctx.onEngage?.("link", p.label ?? p.href ?? "")}
          className="group flex items-center gap-3.5 rounded-2xl border border-hair bg-white p-3.5 shadow-sm transition hover:border-gold hover:shadow-md"
        >
          <IconBadge name="link" />
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-navy">
            {p.label ?? p.href}
          </span>
          <Icon name="arrowRight" className="size-4 shrink-0 text-gold-deep" />
        </a>
      ) : null;

    case "invoice": {
      // Looked up by id rather than embedded in the payload, so that editing an
      // invoice updates every place it appears. A copy stored in the block would
      // keep showing the old balance after a payment was recorded.
      const invoice = ctx.invoices?.find((i) => i.id === p.invoiceId);
      return invoice ? (
        <InvoiceCard
          invoice={invoice}
          pdfHref={ctx.invoicePdfHref?.(invoice.id)}
          onEngage={ctx.onEngage}
        />
      ) : null;
    }

    case "checklist": {
      const items = p.items ?? [];
      if (!items.length) return null;
      return (
        <div className="rounded-2xl border border-hair bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <IconBadge name="list" />
            <p className="text-sm font-semibold text-navy">{p.heading ?? "Checklist"}</p>
          </div>
          <ul className="mt-3 flex flex-col gap-2">
            {items.map((item, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-ink">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-gold/15 text-gold-deep">
                  <Icon name="check" className="size-3" strokeWidth={2.5} />
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

/** A photo that opens the viewer. A real button, so it is reachable by keyboard. */
function PhotoButton({
  url,
  alt,
  ratio,
  onOpen,
  overlay,
}: {
  url: string;
  alt: string;
  ratio: string;
  onOpen: () => void;
  overlay?: string | undefined;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={alt ? `View photo: ${alt}` : "View photo"}
      className="group relative block w-full overflow-hidden rounded-2xl bg-paper shadow-sm"
      style={{ aspectRatio: ratio }}
    >
      <img
        src={url}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.02]"
      />
      {overlay ? (
        <span className="absolute inset-0 grid place-items-center bg-navy-deep/55 text-lg font-semibold text-white">
          {overlay}
        </span>
      ) : null}
    </button>
  );
}

/**
 * Several photos. One large lead image and the rest as tiles, because the first
 * photo the office chose is almost always the one that matters most, and five
 * equal squares make the customer study all of them to find it.
 */
function Gallery({
  urls,
  caption,
  openPhotos,
}: {
  urls: (string | null)[];
  caption?: string | undefined;
  openPhotos: OpenPhotos;
}) {
  const list = urls.filter((u): u is string => Boolean(u));
  if (!list.length) return null;

  const photos: LightboxPhoto[] = list.map((url, i) => ({
    url,
    caption: caption ? `${caption} (${i + 1} of ${list.length})` : undefined,
  }));
  const open = (i: number) => openPhotos(photos, i, caption ?? "gallery");

  const [lead, ...rest] = list;
  const tiles = rest.slice(0, 3);
  const hidden = list.length - 1 - tiles.length;

  return (
    <figure>
      <PhotoButton url={lead!} alt={caption ?? ""} ratio="16 / 10" onOpen={() => open(0)} />
      {tiles.length ? (
        <div
          className={`mt-2 grid gap-2 ${tiles.length === 1 ? "grid-cols-1" : tiles.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}
        >
          {tiles.map((u, i) => (
            <PhotoButton
              key={u + i}
              url={u}
              alt={caption ? `${caption} ${i + 2}` : ""}
              ratio="1 / 1"
              onOpen={() => open(i + 1)}
              overlay={i === tiles.length - 1 && hidden > 0 ? `+${hidden}` : undefined}
            />
          ))}
        </div>
      ) : null}
      {caption ? (
        <figcaption className="mt-2 flex items-start gap-1.5 text-[13px] leading-relaxed text-muted">
          <Icon name="images" className="mt-0.5 size-3.5 shrink-0 text-gold-deep" />
          <span>
            {caption} · {list.length} photos
          </span>
        </figcaption>
      ) : null}
    </figure>
  );
}

/**
 * The photo guide: "walk out of here, turn left at this, your driver waits
 * by that".
 *
 * Built for the one moment the whole portal exists for — a customer who has
 * never been to Dubai, standing in arrivals, looking for a person they have
 * never met. So it reads like the walk itself: one photograph per decision,
 * swiped through in order, with the step's instruction under the photo rather
 * than beside it, where a thumb would cover it. It ends at the meeting point,
 * with the pin, the directions and the driver who will be standing there.
 */
function PhotoGuide({
  p,
  ctx,
  openPhotos,
}: {
  p: BlockPayload;
  ctx: BlockCtx;
  openPhotos: OpenPhotos;
}) {
  const steps = (p.steps ?? []).filter((s) => s.url || s.text?.trim());
  const rail = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  if (!steps.length) return null;

  const driver = p.driverId ? ctx.drivers.find((d) => d.id === p.driverId) : undefined;
  const pinned = isLatLng(p.latitude, p.longitude);
  const finish = pinned || Boolean(driver) || Boolean(p.locationName);
  const total = steps.length + (finish ? 1 : 0);
  const title = p.heading?.trim() || "Your step-by-step guide";

  // The viewer shows only the steps that have a photo; this maps a step to its
  // place in that list so "open" lands on the photo that was tapped.
  const withPhotos = steps.flatMap((s, i) => (s.url ? [{ url: s.url, text: s.text, i }] : []));
  const photos: LightboxPhoto[] = withPhotos.map(({ url, text, i }) => ({
    url,
    caption: `Step ${i + 1} of ${steps.length}${text ? ` — ${text}` : ""}`,
  }));
  const openAt = (stepIndex: number) => {
    const at = withPhotos.findIndex((x) => x.i === stepIndex);
    if (at >= 0) openPhotos(photos, at, `guide: ${title}`);
  };

  // The rail is positioned, so a slide's offsetLeft is measured from the rail
  // itself; less the rail's 16px padding, that is the scroll position at which
  // the slide snaps into place.
  const slides = () => Array.from(rail.current?.children ?? []) as HTMLElement[];
  const offsetOf = (child: HTMLElement) => child.offsetLeft - 16;
  const go = (i: number) => {
    const el = rail.current;
    const target = slides()[Math.max(0, Math.min(total - 1, i))];
    if (el && target) el.scrollTo({ left: offsetOf(target), behavior: "smooth" });
  };
  const onScroll = () => {
    const el = rail.current;
    if (!el) return;
    // At the far end the last slide may never reach the left edge, so the end
    // of the scroll counts as being on it.
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) {
      if (current !== total - 1) setCurrent(total - 1);
      return;
    }
    let best = 0;
    let bestGap = Infinity;
    slides().forEach((child, i) => {
      const gap = Math.abs(offsetOf(child) - el.scrollLeft);
      if (gap < bestGap) {
        bestGap = gap;
        best = i;
      }
    });
    if (best !== current) setCurrent(best);
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label={title}
      className="overflow-hidden rounded-3xl border border-hair bg-white shadow-[0_18px_44px_-26px_rgba(0,35,64,0.45)]"
    >
      <header className="px-4 pt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="flex min-w-0 items-center gap-2 text-[10px] font-bold tracking-[0.16em] whitespace-nowrap text-gold-deep uppercase">
            <Icon name="images" className="size-3.5 shrink-0" /> Photo guide · {steps.length}{" "}
            {steps.length === 1 ? "step" : "steps"}
          </p>
          {photos.length ? (
            <button
              type="button"
              onClick={() => openAt(Math.min(current, steps.length - 1))}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-hair px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap text-navy transition hover:border-gold"
            >
              <Icon name="expand" className="size-3.5" /> Full screen
            </button>
          ) : null}
        </div>
        <h4 className="mt-2 font-display text-xl leading-snug text-navy">{title}</h4>
        {p.text ? (
          <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line text-muted">{p.text}</p>
        ) : null}

        {/* Story-style segments: how far through the walk, at a glance. */}
        <div className="mt-3.5 flex gap-1" aria-hidden="true">
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i <= current ? "bg-gold" : "bg-hair"
              }`}
            />
          ))}
        </div>
      </header>

      <div
        ref={rail}
        onScroll={onScroll}
        className="no-scrollbar relative flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 py-4"
      >
        {steps.map((s, i) => (
          <figure
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`Step ${i + 1} of ${steps.length}`}
            className="w-[84%] shrink-0 snap-start sm:w-[68%]"
          >
            {s.url ? (
              <button
                type="button"
                onClick={() => openAt(i)}
                aria-label={`View step ${i + 1} full screen`}
                className="group relative block w-full overflow-hidden rounded-2xl bg-paper"
                style={{ aspectRatio: "4 / 5" }}
              >
                <img
                  src={s.url}
                  alt={s.text ? `Step ${i + 1}: ${s.text}` : `Step ${i + 1}`}
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-[1.03]"
                />
                <span className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-navy-deep/55 to-transparent" />
                <span className="absolute top-3 left-3 grid size-10 place-items-center rounded-full bg-white font-sans text-base font-bold text-navy shadow-lg">
                  {i + 1}
                </span>
                <span className="absolute top-3.5 right-3 rounded-full bg-navy-deep/55 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-white uppercase backdrop-blur">
                  Step {i + 1} of {steps.length}
                </span>
              </button>
            ) : (
              <div
                className="grid place-items-center rounded-2xl bg-sand"
                style={{ aspectRatio: "4 / 5" }}
              >
                <span className="grid size-14 place-items-center rounded-full bg-white font-sans text-xl font-bold text-navy shadow">
                  {i + 1}
                </span>
              </div>
            )}
            {s.text ? (
              <figcaption className="mt-3 text-[15px] leading-relaxed whitespace-pre-line text-ink">
                {s.text}
              </figcaption>
            ) : null}
          </figure>
        ))}

        {finish ? (
          <div
            role="group"
            aria-roledescription="slide"
            aria-label="Meeting point"
            className="flex w-[84%] shrink-0 snap-start flex-col gap-3 sm:w-[68%]"
          >
            <div className="rounded-2xl bg-sand p-4">
              <p className="flex items-center gap-2 text-[10px] font-bold tracking-[0.18em] text-live uppercase">
                <Icon name="flag" className="size-3.5" /> You have arrived
              </p>
              <p className="mt-1.5 font-display text-lg leading-snug text-navy">
                {p.locationName ?? "The meeting point"}
              </p>
            </div>
            {pinned ? (
              <>
                <MapView
                  className="h-44"
                  label={`Map: ${p.locationName ?? "meeting point"}`}
                  points={[{ lat: p.latitude!, lng: p.longitude!, label: p.locationName }]}
                />
                <Directions
                  lat={p.latitude!}
                  lng={p.longitude!}
                  label={p.locationName}
                  onEngage={ctx.onEngage}
                  compact
                />
              </>
            ) : null}
            {driver ? <DriverCard driver={driver} onEngage={ctx.onEngage} /> : null}
          </div>
        ) : null}
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-hair px-4 py-3">
        <button
          type="button"
          onClick={() => go(current - 1)}
          disabled={current === 0}
          aria-label="Previous step"
          className="grid size-10 place-items-center rounded-full border border-hair text-navy transition hover:border-gold disabled:opacity-35"
        >
          <Icon name="chevronLeft" className="size-4" />
        </button>
        <p className="text-xs font-semibold text-navy tabular-nums" aria-live="polite">
          {current < steps.length ? `Step ${current + 1} of ${steps.length}` : "Meeting point"}
        </p>
        <button
          type="button"
          onClick={() => go(current + 1)}
          disabled={current >= total - 1}
          aria-label="Next step"
          className="grid size-10 place-items-center rounded-full bg-navy text-white transition hover:bg-navy-deep disabled:opacity-35"
        >
          <Icon name="chevronRight" className="size-4" />
        </button>
      </footer>
    </section>
  );
}

function IconBadge({ name }: { name: IconName }) {
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sand text-gold-deep">
      <Icon name={name} className="size-5" />
    </span>
  );
}

function ActionLink({
  href,
  icon,
  label,
  tone = "navy",
}: {
  href: string;
  icon: IconName;
  label: string;
  tone?: "navy" | "gold" | "alert";
}) {
  const external = href.startsWith("http");
  const style =
    tone === "gold"
      ? "bg-gold text-navy hover:bg-gold-light"
      : tone === "alert"
        ? "bg-alert text-white"
        : "bg-navy text-white hover:bg-navy-deep";
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${style}`}
    >
      <Icon name={icon} className="size-4" />
      {label}
    </a>
  );
}

function DetailCard({
  icon,
  eyebrow,
  title,
  rows,
  note,
  action,
}: {
  icon: IconName;
  eyebrow: string;
  title: string;
  rows: [string, string | undefined][];
  note?: string | undefined;
  action?: { href: string; label: string; onClick: () => void } | undefined;
}) {
  const present = rows.filter(([, v]) => Boolean(v));
  return (
    <div className="rounded-2xl border border-hair bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <IconBadge name={icon} />
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-gold-deep uppercase">
            {eyebrow}
          </p>
          <p className="truncate text-base font-semibold text-navy">{title}</p>
        </div>
      </div>
      {present.length ? (
        <dl className="mt-3.5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-hair pt-3.5">
          {present.map(([k, v]) => (
            <div key={k} className="min-w-0">
              <dt className="text-[11px] tracking-wide text-muted uppercase">{k}</dt>
              <dd className="mt-0.5 text-sm font-semibold break-words text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {note ? <p className="mt-3 text-sm leading-relaxed text-muted">{note}</p> : null}
      {action ? (
        <a
          href={action.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={action.onClick}
          className="mt-3.5 flex items-center justify-center gap-2 rounded-xl border border-hair py-2.5 text-xs font-semibold text-navy transition hover:border-gold"
        >
          <Icon name="navigation" className="size-3.5 text-gold-deep" /> {action.label}
        </a>
      ) : null}
    </div>
  );
}

/**
 * The driver card.
 *
 * Photograph, name, vehicle and plate, then call and WhatsApp as the two
 * largest things on it. This is read on a kerb looking for a car, so the plate
 * is set large, in tabular figures, on a plate-like tile — readable at a glance
 * against a moving background.
 */
export function DriverCard({
  driver,
  onEngage,
}: {
  driver: Driver;
  onEngage?: ((event: string, detail: string) => void) | undefined;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-hair bg-white shadow-sm">
      <div className="flex items-center gap-4 p-4">
        {driver.photoUrl ? (
          <img
            src={driver.photoUrl}
            alt={driver.full_name}
            className="size-16 shrink-0 rounded-2xl object-cover ring-2 ring-gold/40"
          />
        ) : (
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-sand text-gold-deep">
            <Icon name="car" className="size-7" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-gold-deep uppercase">
            Your driver
          </p>
          <p className="mt-0.5 truncate font-display text-xl text-navy">{driver.full_name}</p>
          {driver.vehicle ? <p className="truncate text-sm text-muted">{driver.vehicle}</p> : null}
          {driver.languages ? (
            <p className="truncate text-xs text-muted">Speaks {driver.languages}</p>
          ) : null}
        </div>
      </div>

      {driver.plate_number ? (
        <div className="mx-4 flex items-center justify-between rounded-xl border-2 border-ink/80 bg-white px-4 py-2">
          <span className="text-[10px] font-semibold tracking-[0.18em] text-muted uppercase">
            Plate
          </span>
          <span className="font-mono text-2xl font-bold tracking-wider text-ink tabular-nums">
            {driver.plate_number}
          </span>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2 p-4">
        {driver.phone ? (
          <a
            href={`tel:${driver.phone}`}
            onClick={() => onEngage?.("driver_call", driver.full_name)}
            className="flex items-center justify-center gap-2 rounded-xl bg-navy py-3 text-sm font-semibold text-white hover:bg-navy-deep"
          >
            <Icon name="phone" className="size-4" /> Call
          </a>
        ) : null}
        {driver.whatsapp ? (
          <a
            href={`https://wa.me/${driver.whatsapp.replace(/[^\d]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onEngage?.("driver_whatsapp", driver.full_name)}
            className="flex items-center justify-center gap-2 rounded-xl bg-gold py-3 text-sm font-semibold text-navy hover:bg-gold-light"
          >
            <Icon name="chat" className="size-4" /> WhatsApp
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
      className="group flex items-center gap-3.5 rounded-2xl border border-hair bg-white p-3.5 shadow-sm transition hover:border-gold hover:shadow-md"
    >
      <IconBadge name="file" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-navy">{doc.name}</span>
        {doc.doc_type ? <span className="block text-xs text-muted">{doc.doc_type}</span> : null}
      </span>
      <Icon name="download" className="size-4 shrink-0 text-gold-deep" />
    </a>
  );
}
