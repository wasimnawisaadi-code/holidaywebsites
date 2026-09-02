import { BRAND, discountPct, priceLabel, waLink, type Experience } from "@/data/catalogue";
import { tileImage } from "@/lib/img";

export function TourCard({ e, eager = false }: { e: Experience; eager?: boolean }) {
  const off = discountPct(e);

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-3xl bg-surface lift">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={e.image}
          {...tileImage(e.image, "(min-width: 1024px) 380px, (min-width: 640px) 50vw, 92vw")}
          alt={`${e.title}, ${e.emirate}`}
          decoding="async"
          loading={eager ? "eager" : "lazy"}
          width={1280}
          height={800}
          className="size-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.06]"
        />
        <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-2">
          <span className="rounded-full bg-background/55 px-3 py-1 text-[11px] uppercase tracking-widest backdrop-blur-sm">
            {e.emirate}
          </span>
          {off ? (
            <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary-foreground">
              {off}% off
            </span>
          ) : e.badge ? (
            <span className="rounded-full border border-primary/50 bg-background/55 px-3 py-1 text-[11px] uppercase tracking-widest text-accent backdrop-blur-sm">
              {e.badge}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl leading-snug">{e.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{e.overview}</p>
        <p className="mt-4 text-xs text-foreground/60">
          {e.category} · {e.duration}
          {e.instantConfirm ? " · Instant confirmation" : ""}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            {e.wasPrice ? (
              <span className="mr-2 text-sm text-muted-foreground line-through">
                AED {e.wasPrice}
              </span>
            ) : null}
            <span className="text-sm text-accent">{priceLabel(e)}</span>
            {e.priceStatus === "from" ? (
              <span className="block text-[11px] text-foreground/50">per person</span>
            ) : null}
          </div>
          <a
            href={waLink(
              `Hi ${BRAND.short}, I'd like to book ${e.title}. Please share availability and the best price.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-full border border-primary/40 px-4 py-2 text-sm text-accent transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Book on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
