import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BadgeCheck, Check, Clock, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import heroDubai from "@/assets/hero-dubai.jpg";
import { BRAND, offices, packages, waLink } from "@/data/catalogue";
import { Reveal } from "@/components/site/Reveal";
import { PageHero } from "@/components/site/PageHero";
import { cn } from "@/lib/utils";
import { absoluteUrl, siteUrl } from "@/lib/site";
import { submitLead } from "@/lib/leads";

type Search = { pkg?: string | undefined };

const title = `Contact & Enquire | ${BRAND.name} Dubai`;
const description =
  "Talk to a Dubai-based travel consultant. Send your dates, travellers and trip idea, and we reply on WhatsApp within working hours.";

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): Search => {
    const out: Search = {};
    if (typeof search["pkg"] === "string") out.pkg = search["pkg"];
    return out;
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl("/contact") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/contact") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TravelAgency",
          // Same @id as the root entity — see the note in __root.tsx.
          "@id": `${siteUrl()}/#organization`,
          name: BRAND.name,
          telephone: BRAND.phone,
          email: BRAND.email,
          address: offices.map((o) => ({
            "@type": "PostalAddress",
            streetAddress: o.address,
            addressLocality: o.city,
            addressCountry: o.country,
          })),
        }),
      },
    ],
  }),
  component: ContactPage,
});

const steps = ["Travel dates", "Travellers", "Your trip", "Contact", "Requirements"] as const;

function ContactPage() {
  const search = Route.useSearch();
  const [step, setStep] = useState(0);
  const [ref, setRef] = useState<string | null>(null);
  // Whether the enquiry actually reached the database. The confirmation screen
  // says something different when it did not, because a reference number for a
  // request nobody received is worse than no reference at all.
  const [recorded, setRecorded] = useState(true);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    from: "",
    to: "",
    adults: "2",
    children: "0",
    pkg: search.pkg ?? "",
    budget: "",
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const selectedPkg = packages.find((p) => p.slug === form.pkg);

  const summaryMessage = useMemo(
    () =>
      [
        `Hi ${BRAND.short}, I'd like to enquire about a trip.`,
        selectedPkg ? `Package: ${selectedPkg.title}` : "Package: Custom trip",
        `Dates: ${form.from || "Flexible"}${form.to ? ` to ${form.to}` : ""}`,
        `Travellers: ${form.adults} adults, ${form.children} children`,
        form.budget ? `Budget pp: AED ${form.budget}` : "",
        form.name ? `Name: ${form.name}` : "",
        form.phone ? `Phone: ${form.phone}` : "",
        form.notes ? `Notes: ${form.notes}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    [form, selectedPkg],
  );

  if (ref) {
    // Two different screens, because they are two different situations. When
    // the enquiry reached us, WhatsApp is an optional extra. When the write
    // failed, WhatsApp is the whole recovery path and has to read like it —
    // showing "request received" over a write that never landed is precisely
    // how an enquiry gets lost without anyone noticing.
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center px-5 pt-28 pb-24 text-center">
        <span
          className={cn(
            "mx-auto flex size-14 items-center justify-center rounded-full",
            recorded ? "bg-verde/15" : "bg-amber-100",
          )}
        >
          {recorded ? (
            <Check className="size-7 text-verde" aria-hidden />
          ) : (
            <MessageCircle className="size-7 text-amber-700" aria-hidden />
          )}
        </span>

        {recorded ? (
          <>
            <h1 className="text-display mt-6 text-4xl sm:text-5xl">
              Thank you — request received.
            </h1>
            <p className="mt-4 text-muted-foreground">
              Your reference is <span className="text-accent">{ref}</span>
              {selectedPkg ? (
                <>
                  {" "}
                  for <span className="text-foreground">{selectedPkg.title}</span>
                </>
              ) : null}
              . A travel consultant in Dubai will review availability and come back to you with
              confirmed options and pricing.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-display mt-6 text-4xl sm:text-5xl">Send this to us on WhatsApp</h1>
            <p className="mt-4 text-muted-foreground">
              We couldn&apos;t save your enquiry just now, so please don&apos;t rely on this page.
              The button below opens WhatsApp with every detail you entered already written out, and
              a consultant in Dubai will pick it up from there. You can also call{" "}
              <a href={`tel:${BRAND.phone.replace(/\s/g, "")}`} className="text-accent">
                {BRAND.phone}
              </a>
              .
            </p>
          </>
        )}

        <a
          href={waLink(`${summaryMessage}\nReference: ${ref}`)}
          target="_blank"
          rel="noopener noreferrer"
          className="mx-auto mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
        >
          <MessageCircle className="size-4" aria-hidden />
          {recorded ? "Continue on WhatsApp" : "Send my enquiry on WhatsApp"}
        </a>
        <Link to="/holidays" className="mt-4 text-sm text-muted-foreground hover:text-accent">
          Keep browsing holidays
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <PageHero
        crumbs={[{ label: "Home", to: "/" }, { label: "Contact" }]}
        eyebrow="Contact"
        title={
          <>
            Tell us about <span className="italic text-[#DDBE5E]">the trip</span>
          </>
        }
        intro="Five short steps, no payment and no obligation. Just a real consultant in Dubai building your options."
        image={heroDubai}
        imageAlt="Dubai skyline at dusk"
      />

      {/* Quick channels */}
      <section className="mx-auto -mt-10 max-w-[1400px] px-5 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: MessageCircle,
              label: "WhatsApp",
              value: BRAND.phone,
              note: "Fastest reply, usually minutes",
              href: waLink(
                `Hi ${BRAND.short}, I'd rather message than fill in the form. Can you help me plan a trip?`,
              ),
              external: true,
            },
            {
              icon: Phone,
              label: "Call us",
              value: BRAND.phone,
              note: "Sat–Thu, 9:00–19:00 (GST)",
              href: `tel:${BRAND.phone.replace(/\s/g, "")}`,
              external: false,
            },
            {
              icon: Mail,
              label: "Email",
              value: BRAND.email,
              note: "Detailed quotes within 24 hours",
              href: `mailto:${BRAND.email}`,
              external: false,
            },
          ].map((c, i) => {
            const Icon = c.icon;
            return (
              <Reveal key={c.label} delay={i * 70}>
                <a
                  href={c.href}
                  {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="flex h-full items-start gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-accent">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="eyebrow">{c.label}</span>
                    <span className="mt-1 block truncate font-medium text-accent">{c.value}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{c.note}</span>
                  </span>
                </a>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-14 grid max-w-[1400px] gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_360px]">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (step < steps.length - 1) {
              setStep(step + 1);
              return;
            }
            const generatedRef = `NS-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
            setSending(true);
            let wrote = false;
            if (form.email || form.phone) {
              const result = await submitLead({
                email: form.email || `${generatedRef.toLowerCase()}@lead.nawisaadiholidays.com`,
                name: form.name,
                phone: form.phone,
                source: "contact_enquiry",
                path: window.location.pathname,
                detail: {
                  package: selectedPkg ? selectedPkg.title : "Custom trip",
                  packageSlug: form.pkg || null,
                  dates: `${form.from || "Flexible"}${form.to ? ` to ${form.to}` : ""}`,
                  adults: form.adults,
                  children: form.children,
                  budget: form.budget,
                  reference: generatedRef,
                },
                notes: form.notes || null,
              });
              wrote = result.ok;
            }
            setRecorded(wrote);
            setSending(false);
            setRef(generatedRef);
          }}
          className="glass min-w-0 rounded-3xl p-6 sm:p-8"
        >
          <ol className="no-scrollbar flex gap-2 overflow-x-auto pb-4" aria-label="Progress">
            {steps.map((s, i) => (
              <li
                key={s}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs transition-colors",
                  i === step
                    ? "bg-primary text-primary-foreground"
                    : i < step
                      ? "bg-verde/15 text-verde"
                      : "text-muted-foreground",
                )}
              >
                {i + 1}. {s}
              </li>
            ))}
          </ol>

          <div className="h-1 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>

          <div className="mt-6 grid gap-4">
            {step === 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Departure date">
                  <input
                    type="date"
                    required
                    value={form.from}
                    onChange={(e) => set("from", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Return date">
                  <input
                    type="date"
                    value={form.to}
                    onChange={(e) => set("to", e.target.value)}
                    className={inputCls}
                  />
                </Field>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Adults">
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={form.adults}
                    onChange={(e) => set("adults", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Children">
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={form.children}
                    onChange={(e) => set("children", e.target.value)}
                    className={inputCls}
                  />
                </Field>
              </div>
            ) : null}

            {step === 2 ? (
              <>
                <Field label="Package of interest">
                  <select
                    value={form.pkg}
                    onChange={(e) => set("pkg", e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Not decided / custom trip</option>
                    {packages.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.title} — {p.country}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Approximate budget per person (AED)">
                  <input
                    value={form.budget}
                    onChange={(e) => set("budget", e.target.value)}
                    placeholder="e.g. 6000"
                    className={inputCls}
                  />
                </Field>
                <p className="text-xs text-muted-foreground">
                  Looking for something fully bespoke?{" "}
                  <Link to="/customized-tours" className="text-accent hover:underline">
                    Build a customized tour
                  </Link>
                  .
                </p>
              </>
            ) : null}

            {step === 3 ? (
              <>
                <Field label="Full name">
                  <input
                    required
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Email">
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Phone / WhatsApp">
                    <input
                      required
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                </div>
              </>
            ) : null}

            {step === 4 ? (
              <Field label="Special requirements">
                <textarea
                  rows={5}
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Occasions, dietary needs, hotel preference, accessibility…"
                  className={inputCls}
                />
              </Field>
            ) : null}
          </div>

          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="rounded-full border border-border px-5 py-3 text-sm disabled:opacity-40"
            >
              Back
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              {step === steps.length - 1 ? "Submit request" : "Continue"}
              {step === steps.length - 1 ? <Send className="size-4" aria-hidden /> : null}
            </button>
          </div>
        </form>

        <aside className="glass h-fit rounded-3xl p-7 lg:sticky lg:top-28">
          <p className="eyebrow">Your enquiry so far</p>
          <dl className="mt-4 space-y-3 text-sm">
            <Row k="Trip" v={selectedPkg ? selectedPkg.title : "Custom trip"} />
            <Row
              k="Dates"
              v={form.from ? `${form.from}${form.to ? ` → ${form.to}` : ""}` : "Flexible"}
            />
            <Row k="Travellers" v={`${form.adults} adults · ${form.children} children`} />
            <Row k="Budget" v={form.budget ? `AED ${form.budget} pp` : "To be advised"} />
          </dl>

          <a
            href={waLink(summaryMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
          >
            <MessageCircle className="size-4" aria-hidden /> Send this on WhatsApp
          </a>

          <div className="mt-6 flex items-start gap-2 rounded-2xl bg-surface p-4 text-xs text-muted-foreground">
            <Clock className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
            <span>
              Working hours: Saturday–Thursday, 9:00–19:00 Gulf Standard Time. Messages outside
              these hours are answered first thing next morning.
            </span>
          </div>

          <ul className="mt-5 space-y-2 text-xs text-muted-foreground">
            <li className="flex gap-2">
              <BadgeCheck className="size-3.5 shrink-0 text-verde" aria-hidden /> IATA accredited ·
              trading since 2009
            </li>
            <li className="flex gap-2">
              <BadgeCheck className="size-3.5 shrink-0 text-verde" aria-hidden /> flydubai GSA ·
              DTCM approved
            </li>
            <li className="flex gap-2">
              <BadgeCheck className="size-3.5 shrink-0 text-verde" aria-hidden /> No payment until
              you approve the plan
            </li>
          </ul>
        </aside>
      </section>

      <section className="mx-auto mt-24 max-w-[1400px] px-5 sm:px-8">
        <p className="eyebrow">Our offices</p>
        <h2 className="mt-3 text-3xl sm:text-4xl">Kabul · Dubai · Jeddah</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {offices.map((o, i) => (
            <Reveal key={o.city} delay={i * 70}>
              <div className="h-full rounded-3xl border border-border bg-surface p-7 transition-all hover:-translate-y-1 hover:border-primary/40">
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
                    <a href={`mailto:${o.email}`} className="break-all hover:text-accent">
                      {o.email}
                    </a>
                  </li>
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}

const inputCls =
  "mt-2 w-full rounded-xl border border-input bg-background/40 px-4 py-3 text-sm outline-none transition-colors focus:border-primary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      {children}
    </label>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 pb-2">
      <dt className="shrink-0 text-muted-foreground">{k}</dt>
      <dd className="truncate text-right text-foreground">{v}</dd>
    </div>
  );
}
