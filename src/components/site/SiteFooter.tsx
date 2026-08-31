import { Link, useRouterState } from "@tanstack/react-router";
import { Phone, Mail, MapPin, MessageCircle, ArrowRight } from "lucide-react";
import logoImg from "@/assets/logo-ink.png";
import { HorizonSilhouette } from "@/components/site/HorizonSilhouette";
import { SubscribeForm } from "@/components/site/SubscribeForm";
import { BRAND, waLink } from "@/data/catalogue";
import { offices, BRAND as BRAND_INFO } from "@/data/catalogue-brand";

/**
 * Site footer.
 *
 * Two earlier versions missed in opposite directions: a black slab carrying
 * ~30 links, all three addresses and a service list; then a six-link strip that
 * left the page ending on nothing. This sits between them — a real sitemap and
 * the office addresses, on paper rather than black, without restating the
 * accreditation copy that the page above already carries.
 */

const COLUMNS = [
  {
    heading: "Holidays",
    links: [
      { label: "All packages", to: "/holidays" },
      { label: "Country directory", to: "/countries" },
      { label: "Tailor-made trips", to: "/customized-tours" },
      { label: "Special deals", to: "/deals" },
      { label: "Plan a trip", to: "/plan" },
    ],
  },
  {
    heading: "Dubai & UAE",
    links: [
      { label: "Tours & attractions", to: "/activities" },
      // Deep links to two activity detail pages. Written in the router's
      // param form rather than as a literal path, which is what the typed
      // `Link` accepts — the literal versions type-checked as errors and would
      // have broken silently if either slug were ever renamed.
      {
        label: "Desert safari",
        to: "/activities/$slug",
        params: { slug: "evening-desert-safari-with-bbq-dinner" },
      },
      {
        label: "Burj Khalifa",
        to: "/activities/$slug",
        params: { slug: "burj-khalifa-at-the-top" },
      },
      { label: "Dubai guide", to: "/dubai" },
      { label: "United Arab Emirates", to: "/uae" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About us", to: "/about" },
      { label: "Contact", to: "/contact" },
    ],
  },
] as const;

export function SiteFooter() {
  const pathname = useRouterState({ select: (s) => s?.location?.pathname ?? "" });
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-[#F8F8F8]">
      {/* Horizon band. Sits on the page background above the footer and reads as
          the ground the footer stands on, so the two do not need a rule between
          them. */}
      <HorizonSilhouette className="-mb-px bg-[#FFFFFF] pt-10" />
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        {/* CTA band */}
        <div className="grid gap-8 border-b border-[#E5E5E5] py-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="min-w-0">
            <p className="max-w-xl font-display text-2xl leading-snug text-[#00365F] sm:text-3xl">
              Planning something? Tell us the country and the dates.
            </p>
            {/* Two routes out of the same band: WhatsApp for someone ready to
                talk now, email for someone still deciding. */}
            <SubscribeForm source="footer" className="mt-6 max-w-md" />
          </div>
          <div className="lg:justify-self-end">
            <a
              href={waLink("Hi Nawi Saadi, I'd like help planning a holiday.")}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#00365F] px-7 py-3.5 font-sans text-sm font-bold text-white transition-colors hover:bg-[#CAA42D] hover:text-[#00365F]"
            >
              <MessageCircle className="size-4" />
              <span>Chat on WhatsApp</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        {/* Brand + sitemap */}
        <div className="grid gap-10 py-14 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
          <div className="min-w-0">
            <img
              src={logoImg}
              alt={BRAND.name}
              width={437}
              height={315}
              loading="lazy"
              decoding="async"
              className="h-14 w-auto"
            />
            <p className="mt-5 max-w-xs font-sans text-xs leading-relaxed text-[#666666]">
              Worldwide holidays, flights, visas and Umrah arranged end to end from our Deira office
              since {BRAND.founded}.
            </p>
            <div className="mt-6 flex flex-col gap-2.5 font-sans text-sm">
              <a
                href={`tel:${BRAND.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2.5 font-semibold text-[#00365F] transition-colors hover:text-[#8F7420]"
              >
                <Phone className="size-4 text-[#CAA42D]" />
                {BRAND.phone}
              </a>
              <a
                href={`mailto:${BRAND.email}`}
                className="flex items-center gap-2.5 text-[#666666] transition-colors hover:text-[#8F7420]"
              >
                <Mail className="size-4 text-[#CAA42D]" />
                {BRAND.email}
              </a>
            </div>
          </div>

          <div className="grid min-w-0 gap-8 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.heading} className="min-w-0">
                <p className="font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-[#00365F]">
                  {col.heading}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        to={l.to}
                        {...("params" in l ? { params: l.params } : {})}
                        className="font-sans text-sm text-[#666666] transition-colors hover:text-[#8F7420]"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Offices */}
        <div className="grid gap-6 border-t border-[#E5E5E5] py-10 sm:grid-cols-3">
          {offices.map((o) => (
            <div key={o.city} className="flex min-w-0 gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-[#CAA42D]" />
              <div className="min-w-0">
                <p className="font-sans text-sm font-semibold text-[#00365F]">
                  {o.city}
                  <span className="ml-2 font-normal text-[#666666]">{o.country}</span>
                </p>
                <p className="mt-1 font-sans text-xs leading-relaxed text-[#666666]">{o.address}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Legal line */}
        <div className="flex flex-col items-start justify-between gap-3 border-t border-[#E5E5E5] py-7 font-sans text-xs text-[#666666] sm:flex-row sm:items-center">
          <div className="space-y-1">
            <p>
              © {new Date().getFullYear()} {BRAND.legal}
            </p>
            <p className="text-[10px] tracking-wide text-[#888888]">
              Designed &amp; Developed by Mhd Wasim
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {/* Build credit. Links to the developer's own WhatsApp, kept
                separate from the agency line so a customer enquiry never
                lands there by mistake. */}
            <a
              href={`https://wa.me/${BRAND_INFO.developer.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[#8F7420]"
            >
              Designed &amp; developed by {BRAND_INFO.developer.name}
            </a>
            <Link to="/privacy" className="transition-colors hover:text-[#8F7420]">
              Privacy policy
            </Link>
            <Link to="/terms" className="transition-colors hover:text-[#8F7420]">
              Terms &amp; booking
            </Link>
            <span>IATA accredited · flydubai GSA · DTCM approved</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
