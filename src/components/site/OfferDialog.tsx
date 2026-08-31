import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, X, Clock, MapPin } from "lucide-react";
import { packages, priceParts, waLink } from "@/data/catalogue";
import { cn } from "@/lib/utils";

/**
 * Offer dialog.
 *
 * Shows one genuinely-priced short-haul package to a first-time visitor. The
 * price, duration and photograph all come from the catalogue, so what the
 * dialog promises is what the package page charges — there is no invented
 * discount, no fake countdown and no "only 2 seats left", because none of that
 * is true and a licensed agency should not imply it.
 *
 * Behaviour is deliberately restrained:
 *   - never on the first paint; it waits for a delay or an exit-intent move
 *   - once per visitor, remembered in localStorage
 *   - never while the viewer is mid-form on the enquiry or contact pages
 *   - Escape closes it, focus is trapped while open and restored on close
 *
 * `localStorage` is wrapped because it throws outright in some privacy modes,
 * and a storage failure must not stop the page rendering.
 */

const STORAGE_KEY = "ns-offer-seen";
/** Slug of the package to feature. Real, and among the lowest-priced. */
const FEATURED_SLUG = "georgia-mountain-weekender";
const DELAY_MS = 22000;

function alreadySeen(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    // Private mode or blocked storage: treat as seen so we never nag on repeat.
    return true;
  }
}

function markSeen() {
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* nothing to do — the dialog simply may show again next visit */
  }
}

export function OfferDialog() {
  const pathname = useRouterState({ select: (s) => s?.location?.pathname ?? "" });
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreTo = useRef<Element | null>(null);

  // Every hook below must run on every render. Returning early here (as this
  // did) changes the hook count when a visitor moves between /admin and a
  // public page, which crashes the tree. The check is applied at the render
  // guard further down instead.
  const onAdmin = pathname.startsWith("/admin");

  const pkg = packages.find((p) => p.slug === FEATURED_SLUG);

  const dismiss = useCallback(() => {
    setOpen(false);
    markSeen();
    if (restoreTo.current instanceof HTMLElement) restoreTo.current.focus();
  }, []);

  // ---- when to show ------------------------------------------------------
  useEffect(() => {
    if (!pkg) return;
    if (onAdmin) return;
    if (alreadySeen()) return;
    // The planner and contact pages are where someone is already typing to us;
    // interrupting that is the one place a promo is actively unhelpful.
    if (/^\/(plan|contact)/.test(window.location.pathname)) return;

    let done = false;
    const show = () => {
      if (done) return;
      done = true;
      setOpen(true);
    };

    const timer = window.setTimeout(show, DELAY_MS);

    // Exit intent: the pointer leaving through the top of the window.
    const onLeave = (e: PointerEvent) => {
      if (e.clientY <= 0) show();
    };
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (fine) document.addEventListener("pointerout", onLeave);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("pointerout", onLeave);
    };
  }, [pkg, onAdmin]);

  // ---- focus + escape + scroll lock while open ---------------------------
  useEffect(() => {
    if (!open) return;
    restoreTo.current = document.activeElement;
    closeRef.current?.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dismiss();
        return;
      }
      if (e.key !== "Tab") return;
      // Trap: cycle within the panel so focus cannot land on the page behind.
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, dismiss]);

  if (onAdmin || !pkg || !open) return null;

  const price = priceParts(pkg);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ns-offer-title"
    >
      {/* Backdrop. Clicking it dismisses, same as Escape. */}
      <button
        type="button"
        aria-label="Close offer"
        onClick={dismiss}
        className="absolute inset-0 cursor-default bg-[#00365F]/70 backdrop-blur-sm"
      />

      <div
        ref={panelRef}
        className={cn(
          "relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl",
          "grid sm:grid-cols-2",
          "rise-in",
        )}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-white/90 text-[#00365F] shadow-sm transition-colors hover:bg-[#CAA42D] hover:text-white"
        >
          <X className="size-4" />
        </button>

        <div className="relative min-h-[200px] sm:min-h-[340px]">
          <img
            src={pkg.image}
            alt={pkg.title}
            width={1600}
            height={1000}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#00365F]/50 to-transparent" />
        </div>

        <div className="flex flex-col justify-center p-7 sm:p-9">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#CAA42D]" />
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#8F7420]">
              Short-haul from Dubai
            </p>
          </div>

          <h2
            id="ns-offer-title"
            className="mt-3 font-display text-2xl leading-tight text-[#00365F] sm:text-3xl"
          >
            {pkg.country} in {pkg.nights} nights
          </h2>

          <p className="mt-3 line-clamp-3 font-sans text-sm leading-relaxed text-[#666666]">
            {pkg.intro}
          </p>

          <dl className="mt-5 flex flex-wrap gap-x-7 gap-y-2 border-t border-[#E5E5E5] pt-4">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-[#CAA42D]" />
              <dd className="font-sans text-xs font-semibold text-[#00365F]">
                {pkg.days} days · {pkg.nights} nights
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-[#CAA42D]" />
              <dd className="font-sans text-xs font-semibold text-[#00365F]">{pkg.country}</dd>
            </div>
          </dl>

          <p className="mt-5">
            <span className="block font-sans text-[10px] font-semibold uppercase tracking-wider text-[#666666]">
              {price.eyebrow}
            </span>
            <span className="font-display text-3xl font-bold text-[#00365F]">{price.amount}</span>
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <Link
              to="/holidays/$slug"
              params={{ slug: pkg.slug }}
              onClick={dismiss}
              className="group inline-flex items-center gap-2 rounded-xl bg-[#00365F] px-5 py-3 font-sans text-sm font-bold text-white transition-colors hover:bg-[#CAA42D] hover:text-[#00365F]"
            >
              <span>See the itinerary</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href={waLink(`Hi Nawi Saadi, I'd like a quote for the ${pkg.title}.`)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={dismiss}
              className="inline-flex items-center gap-2 rounded-xl border border-[#E5E5E5] px-5 py-3 font-sans text-sm font-semibold text-[#00365F] transition-colors hover:border-[#CAA42D] hover:bg-[#CAA42D]/10"
            >
              <MessageCircle className="size-4 text-[#CAA42D]" />
              <span>Ask on WhatsApp</span>
            </a>
          </div>

          <button
            type="button"
            onClick={dismiss}
            className="mt-4 self-start font-sans text-xs text-[#666666] underline underline-offset-4 transition-colors hover:text-[#00365F]"
          >
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}
