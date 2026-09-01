import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Menu, X, MessageCircle, ChevronDown, Phone } from "lucide-react";
// Whitespace-trimmed marks. The originals carry ~35% baked-in padding, which
// made the wordmark render illegibly small at header height.
import logoOnLight from "@/assets/logo-ink.png";
import logoOnDark from "@/assets/logo-white.png";
import { BRAND, packages, priceLabel, waLink } from "@/data/catalogue";
import { countries } from "@/data/countries";
import { cn } from "@/lib/utils";

/**
 * Site header.
 *
 * Light-first and deliberately quiet: the previous version stacked a dark
 * telemetry strip, a live clock, three accreditation badges and five icon-laden
 * mega-menus above every page, which buried the navigation itself. Here the nav
 * is the nav, holiday packages lead, and the phone number stays reachable.
 */

const REGION_ORDER = ["Europe", "Asia", "Eurasia", "Africa", "Australia", "America"] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<null | "holidays" | "destinations">(null);
  const closeTimer = useRef<number | undefined>(undefined);

  // Pages that open on a full-bleed dark hero get a transparent header with
  // light type *while that hero is still under it*. Once scrolled past, the
  // header lands on paper like everywhere else — the landing page body is
  // light, so keeping the header dark for the whole route (as it did before)
  // left a black bar floating over cream sections.
  const pathname = useRouterState({ select: (s) => s?.location?.pathname ?? "" });
  // The admin panel renders its own chrome. The early return that hides the
  // header there MUST come after every hook below — returning before them
  // changes the hook count between renders, and React aborts the whole tree
  // with "rendered fewer hooks than expected" the moment a visitor navigates
  // between /admin and any public page. That crash is what the admin portal
  // was previously being patched around.
  const onAdmin = pathname.startsWith("/admin");
  const hasVideoHero = pathname === "/";
  const transparent = hasVideoHero && !scrolled && !openMenu && !mobileOpen;
  const isLightText = transparent;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpenMenu(null);
      setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // A short close delay keeps the panel usable while the pointer crosses the gap
  // between the trigger and the panel itself.
  const open = (menu: "holidays" | "destinations") => {
    window.clearTimeout(closeTimer.current);
    setOpenMenu(menu);
  };
  const scheduleClose = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenMenu(null), 140);
  };

  const featured = packages.slice(0, 6);

  if (onAdmin) return null;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 font-sans transition-all duration-300",
        transparent
          ? "border-b border-white/10 bg-gradient-to-b from-black/60 to-transparent"
          : "border-b border-[#E5E5E5] bg-[#FFFFFF]/95 backdrop-blur-md",
      )}
      onMouseLeave={scheduleClose}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-5 py-3 sm:px-8">
        <Link to="/" className="shrink-0" aria-label={`${BRAND.name} home`}>
          <img
            src={isLightText ? logoOnDark : logoOnLight}
            alt={BRAND.name}
            width={437}
            height={315}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="h-16 w-auto sm:h-[4.75rem]"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          <MenuTrigger
            label="Holiday packages"
            isOpen={openMenu === "holidays"}
            onOpen={() => open("holidays")}
            light={isLightText}
          />
          <MenuTrigger
            label="Destinations"
            isOpen={openMenu === "destinations"}
            onOpen={() => open("destinations")}
            light={isLightText}
          />
          <NavLink to="/activities" onHover={scheduleClose} light={isLightText}>
            Dubai & UAE
          </NavLink>
          <NavLink to="/customized-tours" onHover={scheduleClose} light={isLightText}>
            Tailor-made
          </NavLink>
          <NavLink to="/about" onHover={scheduleClose} light={isLightText}>
            About
          </NavLink>
          <NavLink to="/contact" onHover={scheduleClose} light={isLightText}>
            Contact
          </NavLink>
        </nav>

        {/* Desktop actions */}
        <div className="hidden shrink-0 items-center gap-4 lg:flex">
          <a
            href={`tel:${BRAND.phone.replace(/\s/g, "")}`}
            className={cn(
              "flex items-center gap-2 text-sm font-semibold transition-colors",
              isLightText
                ? "text-white hover:text-[#DDBE5E]"
                : "text-[#00365F] hover:text-[#8F7420]",
            )}
          >
            <Phone className="size-4 text-[#CAA42D]" />
            {BRAND.phone}
          </a>
          <a
            href={waLink("Hi Nawi Saadi, I'd like to enquire about a holiday package.")}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all shadow-md",
              isLightText
                ? "bg-gradient-to-r from-[#CAA42D] to-[#DDBE5E] text-[#04121f] hover:scale-105 shadow-[#CAA42D]/20"
                : "bg-[#00365F] text-white hover:bg-[#00365F]",
            )}
          >
            <MessageCircle className="size-4" />
            Enquire
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className={cn(
            "flex size-11 items-center justify-center rounded-xl border lg:hidden transition-colors",
            isLightText
              ? "border-white/20 bg-white/5 text-white"
              : "border-[#00365F]/20 text-[#00365F]",
          )}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Holiday packages panel */}
      {openMenu === "holidays" ? (
        <Panel onEnter={() => open("holidays")} onLeave={scheduleClose}>
          <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,17rem)]">
            <ul className="grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <li key={p.slug}>
                  <Link
                    to="/holidays/$slug"
                    params={{ slug: p.slug }}
                    onClick={() => setOpenMenu(null)}
                    className="group flex items-baseline justify-between gap-4 rounded-sm px-3 py-2.5 transition-colors hover:bg-white"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-sans text-sm font-semibold text-[#00365F]">
                        {p.country}
                      </span>
                      <span className="block truncate font-sans text-xs text-slate-500">
                        {p.nights} nights · {p.destination.split("·")[0]?.trim()}
                      </span>
                    </span>
                    <span className="shrink-0 font-sans text-xs text-[#8F7420]">
                      {priceLabel(p)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="rounded-sm border border-[#E5E5E5] bg-white p-6">
              <p className="font-display text-lg text-[#00365F]">Nothing quite right?</p>
              <p className="mt-2 font-sans text-sm leading-relaxed text-slate-600">
                Every itinerary can be rebuilt around your dates, budget and pace.
              </p>
              <Link
                to="/customized-tours"
                onClick={() => setOpenMenu(null)}
                className="mt-4 inline-block font-sans text-sm font-semibold text-[#00365F] underline underline-offset-4 hover:text-[#8F7420]"
              >
                Build a tailor-made trip
              </Link>
            </div>
          </div>
          <div className="mt-6 border-t border-[#E5E5E5] pt-4">
            <Link
              to="/holidays"
              onClick={() => setOpenMenu(null)}
              className="font-sans text-sm font-semibold text-[#00365F] hover:text-[#8F7420]"
            >
              View all {packages.length} holiday packages →
            </Link>
          </div>
        </Panel>
      ) : null}

      {/* Destinations panel */}
      {openMenu === "destinations" ? (
        <Panel onEnter={() => open("destinations")} onLeave={scheduleClose}>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {REGION_ORDER.map((region) => {
              const list = countries.filter((c) => c.region === region);
              if (!list.length) return null;
              return (
                <div key={region} className="min-w-0">
                  <p className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#8F7420]">
                    {region}
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    {list.slice(0, 8).map((c) => (
                      <li key={c.slug}>
                        <Link
                          to="/countries/$slug"
                          params={{ slug: c.slug }}
                          onClick={() => setOpenMenu(null)}
                          className="font-sans text-sm text-slate-600 transition-colors hover:text-[#00365F]"
                        >
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <div className="mt-6 border-t border-[#E5E5E5] pt-4">
            <Link
              to="/countries"
              onClick={() => setOpenMenu(null)}
              className="font-sans text-sm font-semibold text-[#00365F] hover:text-[#8F7420]"
            >
              Browse all {countries.length} destinations →
            </Link>
          </div>
        </Panel>
      ) : null}

      {/* Mobile sheet */}
      {mobileOpen ? (
        <div className="max-h-[calc(100vh-4.75rem)] overflow-y-auto border-t border-[#E5E5E5] bg-[#FFFFFF] px-5 py-6 lg:hidden">
          <nav className="flex flex-col" aria-label="Mobile">
            {[
              { to: "/holidays", label: "Holiday packages" },
              { to: "/countries", label: "Destinations" },
              { to: "/activities", label: "Dubai & UAE" },
              { to: "/customized-tours", label: "Tailor-made" },
              { to: "/deals", label: "Deals" },
              { to: "/about", label: "About" },
              { to: "/contact", label: "Contact" },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className="border-b border-[#E5E5E5] py-3.5 font-display text-lg text-[#00365F]"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="mt-6 space-y-3">
            <a
              href={`tel:${BRAND.phone.replace(/\s/g, "")}`}
              className="flex items-center justify-center gap-2 rounded-sm border border-[#00365F]/25 py-3.5 text-sm font-semibold text-[#00365F]"
            >
              <Phone className="size-4 text-[#CAA42D]" />
              {BRAND.phone}
            </a>
            <a
              href={waLink("Hi Nawi Saadi, I'd like to enquire about a holiday package.")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-sm bg-[#00365F] py-3.5 text-sm font-semibold text-white"
            >
              <MessageCircle className="size-4" />
              Enquire on WhatsApp
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function NavLink({
  to,
  children,
  onHover,
  light = false,
}: {
  to: string;
  children: React.ReactNode;
  onHover: () => void;
  light?: boolean;
}) {
  return (
    <Link
      to={to}
      onMouseEnter={onHover}
      className={cn(
        "rounded-sm px-3.5 py-2 text-sm font-medium transition-colors",
        light ? "text-white/90 hover:text-[#DDBE5E]" : "text-[#353844] hover:text-[#8F7420]",
      )}
    >
      {children}
    </Link>
  );
}

function MenuTrigger({
  label,
  isOpen,
  onOpen,
  light = false,
}: {
  label: string;
  isOpen: boolean;
  onOpen: () => void;
  light?: boolean;
}) {
  return (
    <button
      type="button"
      onMouseEnter={onOpen}
      onFocus={onOpen}
      onClick={onOpen}
      aria-expanded={isOpen}
      className={cn(
        "flex items-center gap-1.5 rounded-sm px-3.5 py-2 text-sm font-medium transition-colors",
        isOpen
          ? "text-[#8F7420]"
          : light
            ? "text-white/90 hover:text-[#DDBE5E]"
            : "text-[#353844] hover:text-[#8F7420]",
      )}
    >
      {label}
      <ChevronDown
        className={cn("size-3.5 transition-transform duration-200", isOpen && "rotate-180")}
      />
    </button>
  );
}

function Panel({
  children,
  onEnter,
  onLeave,
}: {
  children: React.ReactNode;
  onEnter: () => void;
  onLeave: () => void;
}) {
  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="hidden border-t border-[#E5E5E5] bg-[#FFFFFF] shadow-[0_20px_40px_-32px_rgba(0,48,88,0.45)] lg:block"
    >
      <div className="mx-auto max-w-[1400px] px-8 py-8">{children}</div>
    </div>
  );
}
