import { createFileRoute } from "@tanstack/react-router";
import { BRAND } from "@/data/catalogue";
import { absoluteUrl } from "@/lib/site";
import { PageHero } from "@/components/site/PageHero";
import { LegalPage, LegalSection } from "@/components/site/LegalPage";

/**
 * Privacy policy.
 *
 * Describes only what this site actually does. It has no accounts, no payment
 * processing, no advertising pixels and no third-party analytics unless one is
 * configured, so the policy says that rather than reciting boilerplate about
 * cookies and profiling that would not be true here.
 */
export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: `Privacy Policy | ${BRAND.short} Travel & Tourism` },
      {
        name: "description",
        content:
          "How Nawi Saadi Travel & Tourism collects, uses and stores the information you share when you request a holiday quote or contact our Deira office.",
      },
      { property: "og:title", content: `Privacy Policy | ${BRAND.short}` },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/privacy") }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="bg-[#FFFFFF] pb-24 text-[#353844]">
      <PageHero
        crumbs={[{ label: "Home", to: "/" }, { label: "Privacy policy" }]}
        eyebrow="Legal"
        title="Privacy policy"
        intro="What we collect when you enquire, why we hold it, and how to have it removed."
        image="/images/destinations/hero-switzerland.jpg"
        imageAlt="Alpine valley"
      />

      <LegalPage updated="27 August 2026">
        <LegalSection title="Who we are">
          <p>
            {BRAND.legal}, {BRAND.city}. You can reach us on{" "}
            <a className="underline" href={`tel:${BRAND.phone.replace(/\s/g, "")}`}>
              {BRAND.phone}
            </a>{" "}
            or at{" "}
            <a className="underline" href={`mailto:${BRAND.email}`}>
              {BRAND.email}
            </a>
            . We are the controller of any personal information described below.
          </p>
        </LegalSection>

        <LegalSection title="What we collect">
          <p>
            Only what you send us. When you submit an enquiry, use the trip planner, or start a
            WhatsApp conversation from this site, we receive the details you choose to provide —
            typically your name, a contact number or email address, and the destinations, dates and
            traveller numbers you are asking about.
          </p>
          <p>
            This website has no user accounts and takes no payments. We do not ask for passport
            numbers, card details or identity documents through the site. Where a booking later
            requires those for ticketing or a visa application, they are collected directly by a
            consultant through a separate channel and are used only for that purpose.
          </p>
        </LegalSection>

        <LegalSection title="Why we hold it">
          <p>
            To answer your enquiry, prepare a quotation, and — if you go ahead — arrange the
            flights, hotels, transfers and visas that make up your trip. We also keep a record of
            correspondence so that a consultant picking up your file can see what was already
            discussed.
          </p>
        </LegalSection>

        <LegalSection title="Who else sees it">
          <p>
            Only the suppliers a booking genuinely requires: airlines and global distribution
            systems for ticketing, hotels and ground operators for reservations, and the relevant
            embassy or visa processing centre for a visa application. Each receives the minimum
            needed to fulfil that part of the trip.
          </p>
          <p>
            We do not sell personal information, and we do not share it with advertisers or data
            brokers.
          </p>
        </LegalSection>

        <LegalSection title="Cookies and analytics">
          <p>
            This site sets no advertising or tracking cookies. Some pages remember small
            preferences in your own browser&apos;s local storage; that data never leaves your
            device. If a privacy-respecting analytics service is enabled, it records aggregate page
            views only and does not build a profile of you.
          </p>
        </LegalSection>

        <LegalSection title="WhatsApp">
          <p>
            The WhatsApp buttons on this site open a conversation in WhatsApp itself. Anything you
            send there is handled under WhatsApp&apos;s own privacy terms in addition to ours.
          </p>
        </LegalSection>

        <LegalSection title="How long we keep it">
          <p>
            Enquiries that do not lead to a booking are kept while they may still be useful to you
            and then deleted. Booking records are kept for as long as UAE commercial and tax rules
            require us to retain them.
          </p>
        </LegalSection>

        <LegalSection title="Your choices">
          <p>
            You can ask us what we hold about you, ask for it to be corrected, or ask for it to be
            deleted, by emailing{" "}
            <a className="underline" href={`mailto:${BRAND.email}`}>
              {BRAND.email}
            </a>
            . Where we are required to retain a booking record we will tell you which parts we
            cannot remove, and why.
          </p>
        </LegalSection>
      </LegalPage>
    </div>
  );
}
