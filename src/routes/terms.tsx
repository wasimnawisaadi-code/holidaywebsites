import { createFileRoute, Link } from "@tanstack/react-router";
import { BRAND } from "@/data/catalogue-brand";
import { absoluteUrl } from "@/lib/site";
import { PageHero } from "@/components/site/PageHero";
import { LegalPage, LegalSection } from "@/components/site/LegalPage";

/**
 * Terms of use and booking terms, including the cancellation position.
 *
 * Deliberately states what is genuinely knowable: that prices are indicative
 * until confirmed, that airline and hotel rules govern cancellations rather
 * than a single blanket policy, and that visa outcomes are not ours to
 * guarantee. Inventing a specific refund schedule would be worse than useless
 * on a page a customer may rely on.
 */
export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: `Terms & Booking Conditions | ${BRAND.short} Travel & Tourism` },
      {
        name: "description",
        content:
          "Booking conditions for Nawi Saadi Travel & Tourism: how quotes and prices work, payment, changes and cancellations, visa responsibilities and travel insurance.",
      },
      { property: "og:title", content: `Terms & Booking Conditions | ${BRAND.short}` },
      {
        property: "og:description",
        content:
          "Booking conditions for Nawi Saadi Travel & Tourism: quotes, payment, changes and cancellations, visas and travel insurance.",
      },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/terms") }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="bg-[#FFFFFF] pb-24 text-[#353844]">
      <PageHero
        crumbs={[{ label: "Home", to: "/" }, { label: "Terms & booking" }]}
        eyebrow="Legal"
        title="Terms &amp; booking conditions"
        intro="How quotes, payment, changes, cancellations and visas work when you book with us."
        image="/images/destinations/maldives-villas.webp"
        imageAlt="Overwater villas"
      />

      <LegalPage updated="27 August 2026">
        <LegalSection title="Who you are contracting with">
          <p>
            {BRAND.legal}, an IATA-accredited travel agency and DTCM-approved tour operator based at{" "}
            {BRAND.city}. Where we book flights, hotels or ground services, we act as an agent for
            those suppliers, and their own conditions of carriage or booking apply alongside these
            terms.
          </p>
        </LegalSection>

        <LegalSection title="Quotes and prices">
          <p>
            Prices shown on this website are per-person &ldquo;from&rdquo; prices in UAE dirhams
            (AED). They indicate the lowest published starting point for a package and are not a
            guaranteed total: the final figure depends on your travel dates, room and cabin class,
            group size and availability at the time of booking.
          </p>
          <p>
            A quotation issued by a consultant sets out exactly what is included and what is not. A
            price is only fixed once it is confirmed in writing and the required payment has been
            received.
          </p>
        </LegalSection>

        <LegalSection title="Payment">
          <p>
            We accept bank transfer, credit and debit card, and cash at our Deira office. Your
            consultant issues a written confirmation and receipt for every payment. Never treat a
            verbal quote as a confirmed booking.
          </p>
        </LegalSection>

        <LegalSection title="Changes and cancellations">
          <p>
            Cancellation and amendment terms are set by the airline, hotel or operator holding your
            reservation, and they vary widely. Some fares are non-refundable from the moment they
            are ticketed, while some hotel rates allow free cancellation up to a stated date. There
            is no single policy that applies to every booking.
          </p>
          <p>
            Your consultant will state the applicable deadlines and penalties in writing before you
            pay, and they form part of your booking confirmation. If you need to change or cancel,
            contact us as early as possible: what is recoverable usually depends on how much notice
            the supplier receives.
          </p>
        </LegalSection>

        <LegalSection title="Visas and travel documents">
          <p>
            We prepare, submit and follow up visa applications, and we issue UAE tourist and transit
            visas directly. The decision itself rests with the issuing embassy or authority, and no
            agency can guarantee an outcome or a processing time.
          </p>
          <p>
            You are responsible for holding a passport with sufficient remaining validity and blank
            pages for your itinerary, and for any transit requirements along your route. A refused
            visa does not automatically release you from supplier cancellation charges already
            incurred.
          </p>
        </LegalSection>

        <LegalSection title="Travel insurance">
          <p>
            We strongly recommend comprehensive travel insurance covering medical treatment,
            repatriation, cancellation and baggage, arranged as soon as you pay a deposit. Some
            destinations require proof of cover as a condition of entry or of a visa.
          </p>
        </LegalSection>

        <LegalSection title="Your responsibilities">
          <p>
            Please check that every name on a quotation matches the passport exactly before
            ticketing. Airlines charge to correct names, and some do not permit it at all. Check
            your confirmed dates, times and airports on receipt and tell us immediately if anything
            is wrong.
          </p>
        </LegalSection>

        <LegalSection title="Website content">
          <p>
            Itineraries, photographs and descriptions on this website are illustrative. Hotels,
            excursions and routings may be substituted for equivalents where a supplier withdraws
            availability, and your consultant will tell you before your booking is confirmed.
          </p>
        </LegalSection>

        <LegalSection title="Complaints">
          <p>
            If something goes wrong, contact your consultant first. Most issues are resolved
            fastest by the person holding your file. You can also write to{" "}
            <a className="underline" href={`mailto:${BRAND.email}`}>
              {BRAND.email}
            </a>{" "}
            or call{" "}
            <a className="underline" href={`tel:${BRAND.phone.replace(/\s/g, "")}`}>
              {BRAND.phone}
            </a>
            .
          </p>
        </LegalSection>

        <LegalSection title="Governing law">
          <p>
            These terms are governed by the laws of the United Arab Emirates and the Emirate of
            Dubai. See also our{" "}
            <Link to="/privacy" className="underline">
              privacy policy
            </Link>
            .
          </p>
        </LegalSection>
      </LegalPage>
    </div>
  );
}
