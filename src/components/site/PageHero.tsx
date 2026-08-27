import { ParallaxImage } from "@/components/site/ParallaxImage";
import { Breadcrumbs, type Crumb } from "@/components/site/Breadcrumbs";
import { cn } from "@/lib/utils";

/**
 * Shared hero for every page that is not the landing page.
 *
 * Those pages all opened on a bare white text block: eyebrow, headline,
 * paragraph, then content. Against a landing page that opens on full-bleed
 * video, they read as a different, cheaper site — and a headline set in gold on
 * white at display size was barely legible.
 *
 * This gives each one a photographic banner with the same type treatment and
 * entry choreography as the landing hero, at roughly two-thirds the height so
 * it introduces the page rather than competing with it.
 *
 * `stats` is optional and takes verified facts only — it sits on the right of
 * the headline on wide screens and stacks underneath below that.
 */
export function PageHero({
  eyebrow,
  title,
  intro,
  image,
  imageAlt,
  stats,
  crumbs,
  align = "left",
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: string;
  image: string;
  imageAlt: string;
  stats?: { value: string; label: string }[];
  /** Breadcrumb trail. Emits matching BreadcrumbList JSON-LD. */
  crumbs?: Crumb[];
  align?: "left" | "center";
  className?: string;
}) {
  const centered = align === "center";

  return (
    <section
      className={cn(
        "relative flex min-h-[58vh] items-end overflow-hidden bg-[#00365F] pt-28 sm:min-h-[66vh]",
        className,
      )}
    >
      <ParallaxImage
        src={image}
        alt={imageAlt}
        className="absolute inset-0 size-full"
        overscan={14}
        priority
      />

      {/* Scrim. Bottom-weighted so the copy sits on the darkest part of the
          frame while the top of the photograph stays readable. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#00365F] via-[#00365F]/60 to-[#00365F]/25" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#00365F]/70 via-transparent to-transparent" />

      <div className="relative mx-auto w-full max-w-[1400px] px-5 pb-14 sm:px-8 sm:pb-20">
        {crumbs?.length ? (
          <Breadcrumbs
            items={crumbs}
            onDark
            className={cn("mb-6", centered && "flex justify-center")}
          />
        ) : null}

        <div
          className={cn(
            "flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16",
            centered && "items-center text-center lg:flex-col lg:items-center",
          )}
        >
          <div className={cn("min-w-0", centered ? "max-w-3xl" : "max-w-3xl")}>
            <div className={cn("flex items-center gap-3", centered && "justify-center")}>
              <span className="h-px w-10 bg-[#CAA42D]" />
              <p
                className="rise-in font-sans text-[11px] font-semibold uppercase tracking-[0.24em] text-[#DDBE5E]"
                style={{ animationDelay: "0.1s" }}
              >
                {eyebrow}
              </p>
            </div>

            {/* Fluid rather than stepped, so the headline holds its proportion
                of the frame at any width, and masked so it slides up into view. */}
            <h1 className="mt-5 overflow-hidden font-display leading-[1.02] text-white [font-size:clamp(2.1rem,5.4vw,4.4rem)]">
              <span
                className="block rise-in"
                style={{ animationDelay: "0.2s", ["--rise" as string]: "100%" }}
              >
                {title}
              </span>
            </h1>

            {intro ? (
              <p
                className={cn(
                  "rise-in mt-5 max-w-xl font-sans text-sm leading-relaxed text-white/75 sm:text-base",
                  centered && "mx-auto",
                )}
                style={{ animationDelay: "0.42s" }}
              >
                {intro}
              </p>
            ) : null}
          </div>

          {stats?.length ? (
            <dl
              className={cn(
                "flex shrink-0 gap-8 sm:gap-12",
                centered && "justify-center",
              )}
            >
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className="rise-in"
                  style={{ animationDelay: `${0.55 + i * 0.08}s` }}
                >
                  <dt className="font-display text-3xl text-[#DDBE5E] sm:text-4xl">{s.value}</dt>
                  <dd className="mt-1 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </div>
    </section>
  );
}
