import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Mail, MapPin, MessageCircle, Phone, Quote } from "lucide-react";
import marina from "@/assets/dubai-marina.jpg";
import { Reveal } from "@/components/site/Reveal";
import { PageHero } from "@/components/site/PageHero";
import { CredentialGrid } from "@/components/site/Credentials";
import { BRAND, offices, serviceLines, waLink } from "@/data/catalogue";
import { absoluteUrl } from "@/lib/site";

const title = "About Nawi Saadi Travel & Tourism | IATA Agency, flydubai GSA, DTCM Approved";
const description =
  "Nawi Saadi Travel & Tourism — established 2009, IATA accredited, flydubai General Sales Agent in Afghanistan and Dubai DTCM approved, with offices in Kabul, Dubai and Jeddah.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/about" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/about") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TravelAgency",
          name: BRAND.name,
          foundingDate: "2009",
          email: BRAND.email,
          telephone: BRAND.phone,
          url: BRAND.mainSite,
          areaServed: ["AE", "AF", "SA"],
          hasCredential: [
            "IATA Accredited Agency",
            "flydubai General Sales Agent — Afghanistan",
            "Dubai Department of Tourism and Commerce Marketing (DTCM) approved",
          ],
          address: offices.map((o) => ({
            "@type": "PostalAddress",
            addressLocality: o.city,
            addressCountry: o.country,
            streetAddress: o.address,
          })),
        }),
      },
    ],
  }),
  component: AboutPage,
});

const principles = [
  {
    title: "Our Mission",
    body: "Excellence in every journey — complete travel solutions tailored to diverse needs, creating memorable experiences through reliable service, professionalism, value and genuine care.",
  },
  {
    title: "Our Vision",
    body: "To be innovators, leaders and pioneers in the travel industry, recognised among the best tourism companies in Afghanistan and abroad for creativity and high-quality travel products.",
  },
  {
    title: "Our Values",
    body: "Integrity, reliability and customer care. Every journey managed with honesty and dedication, keeping our clients' satisfaction, time and money as the top priority.",
  },
];

function AboutPage() {
  return (
    <div className="pb-24">
      <PageHero
        crumbs={[{ label: "Home", to: "/" }, { label: "About" }]}
        eyebrow="About us"
        title={
          <>
            Travel, tourism, aviation and cargo &mdash;{" "}
            <span className="italic text-[#DDBE5E]">trusted since 2009</span>
          </>
        }
        intro="A travel management company connecting the United Arab Emirates, Afghanistan and Saudi Arabia with destinations worldwide. Part of the Saadi Group of Companies, handling flights, visas, hotels, holidays, Hajj & Umrah, corporate travel, aviation support and cargo end to end."
        image="/images/dst/view-at-the-top-burj-khalifa-burjkhalifa-9c1aa166-bef6-4229-9f0c-ac043044e605.webp"
        imageAlt="Dubai skyline at dusk"
        stats={[
          { value: "2009", label: "Established" },
          { value: "IATA", label: "Accredited" },
        ]}
      />

      <section className="mx-auto mt-14 max-w-[1400px] px-5 sm:px-8">
        <div className="relative aspect-[21/9] overflow-hidden rounded-3xl">
          <img
            src={marina}
            alt="Dubai Marina skyline at dusk"
            loading="lazy"
            width={1600}
            height={1000}
            className="size-full object-cover"
          />
          <div className="night-fade absolute inset-0" />
        </div>
      </section>

      {/* Accreditations */}
      <section className="mx-auto mt-20 max-w-[1400px] px-5 sm:px-8">
        <p className="eyebrow">Credentials</p>
        <h2 className="mt-3 text-3xl sm:text-5xl">Our accreditations & approvals</h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          These are the official approvals that let us issue tickets, represent an airline and
          operate tourism services to international standards.
        </p>
        <div className="mt-10">
          <CredentialGrid />
        </div>
      </section>

      {/* Company profile */}
      <section className="mx-auto mt-20 max-w-[1400px] px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="eyebrow">Company profile</p>
            <h2 className="mt-3 text-3xl sm:text-5xl">Who we are</h2>
            <div className="mt-6 space-y-5 text-muted-foreground">
              <p>
                Established in 2009 in Kabul, Nawi Saadi has built a strong reputation as one of the
                most reliable travel companies in the region, offering professional air ticket
                booking, flight reservations, visa assistance, hotel booking, tourism services,
                corporate travel management, Hajj & Umrah packages and global travel solutions.
              </p>
              <p>
                As an <strong className="text-foreground">IATA-approved travel agency</strong>, we
                deliver international-standard travel services. We proudly serve as the{" "}
                <strong className="text-foreground">
                  General Sales Agent (GSA) of flydubai in Afghanistan
                </strong>{" "}
                and are{" "}
                <strong className="text-foreground">
                  approved by the Dubai Department of Tourism and Commerce Marketing (DTCM)
                </strong>{" "}
                — strengthening our position as a trusted partner for international flight booking,
                airline ticketing, tourism solutions, aviation support, ground handling coordination
                and airport assistance.
              </p>
              <p>
                With branch offices in Kabul, Dubai and Jeddah and a team of more than 50
                experienced travel professionals, we provide comprehensive B2B and corporate travel
                solutions with 24/7 customer support.
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-surface p-8">
            <p className="eyebrow">At a glance</p>
            <dl className="mt-5 space-y-4 text-sm">
              {[
                ["Established", "2009, Kabul — Afghanistan"],
                ["Group", "Saadi Group of Companies"],
                ["Chairman", BRAND.chairman],
                ["Team", "50+ travel professionals"],
                ["Offices", "Kabul · Dubai · Jeddah"],
                ["Airlines", "flydubai, Emirates, Turkish, Qatar Airways, Saudia"],
                ["Support", "24/7 traveller assistance"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-6 border-b border-border pb-3">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto mt-20 max-w-[1400px] px-5 sm:px-8">
        <p className="eyebrow">What we do</p>
        <h2 className="mt-3 text-3xl sm:text-5xl">Everything we handle</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {serviceLines.map((s, i) => (
            <Reveal key={s.title} delay={i * 45}>
              <div className="h-full rounded-3xl border border-border p-6">
                <div className="flex items-start gap-3">
                  <Check className="mt-1 size-4 shrink-0 text-accent" aria-hidden />
                  <div>
                    <h3 className="text-lg">{s.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Chairman */}
      <section className="mx-auto mt-20 max-w-[1400px] px-5 sm:px-8">
        <div className="rounded-3xl bg-surface p-8 sm:p-12">
          <Quote className="size-8 text-accent" aria-hidden />
          <p className="eyebrow mt-6">Chairman's message</p>
          <blockquote className="mt-4 max-w-4xl space-y-5 text-lg text-muted-foreground">
            <p>
              "Travel is more than a journey — it is a connection between people, cultures,
              opportunities and unforgettable experiences. Since our establishment in 2009 in Kabul,
              our mission has been to deliver trust, comfort, safety and excellence in every journey
              we manage.
            </p>
            <p>
              As the General Sales Agent of flydubai in Afghanistan and an IATA-accredited travel
              agency, we proudly represent international standards of service, reliability and
              innovation. Our greatest strength is our people — and together, we connect
              destinations, create experiences and build the future of travel."
            </p>
          </blockquote>
          <p className="mt-6 font-medium">{BRAND.chairman}</p>
          <p className="text-sm text-muted-foreground">Chairman, Saadi Group of Companies</p>
        </div>
      </section>

      {/* Principles */}
      <section className="mx-auto mt-20 max-w-[1400px] px-5 sm:px-8">
        <p className="eyebrow">Our guiding principles</p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {principles.map((p, i) => (
            <Reveal key={p.title} delay={i * 80}>
              <div className="h-full rounded-3xl border border-primary/20 p-7">
                <h3 className="text-2xl">{p.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Offices */}
      <section className="mx-auto mt-20 max-w-[1400px] px-5 sm:px-8">
        <p className="eyebrow">Our offices</p>
        <h2 className="mt-3 text-3xl sm:text-5xl">Find us in three countries</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {offices.map((o, i) => (
            <Reveal key={o.city} delay={i * 60}>
              <div className="h-full rounded-3xl bg-surface p-7">
                <h3 className="text-xl">{o.city}</h3>
                <p className="text-sm text-accent">{o.country}</p>
                {o.note ? <p className="mt-2 text-xs text-muted-foreground">{o.note}</p> : null}
                <ul className="mt-5 space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                    <span className="text-muted-foreground">{o.address}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="size-4 shrink-0 text-accent" aria-hidden />
                    <a href={`tel:${o.phone.replace(/\s/g, "")}`} className="hover:text-accent">
                      {o.phone}
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="size-4 shrink-0 text-accent" aria-hidden />
                    <a href={`mailto:${o.email}`} className="hover:text-accent">
                      {o.email}
                    </a>
                  </li>
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-[1400px] px-5 sm:px-8">
        <div className="rounded-3xl border border-primary/25 p-10 text-center">
          <h2 className="text-display text-4xl sm:text-5xl">Let's plan your next journey.</h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Flights, visas, hotels, tours or a full holiday — one team handles all of it.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={waLink(`Hi ${BRAND.short}, I'd like help planning a trip.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
            >
              <MessageCircle className="size-4" aria-hidden /> WhatsApp us
            </a>
            <Link
              to="/contact"
              className="inline-flex rounded-full border border-primary/30 px-6 py-3 text-sm"
            >
              Send an enquiry
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
