import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, X, MessageCircle, SlidersHorizontal } from "lucide-react";
import { BRAND, waLink } from "@/data/catalogue";
import { inboundActivities, inboundCategories, type InboundCategory } from "@/data/inbound";
import { ActivityCard } from "@/components/site/ActivityCard";
import { Reveal } from "@/components/site/Reveal";
import { PageHero } from "@/components/site/PageHero";
import { cn } from "@/lib/utils";

const title = `Dubai & UAE Tours, Tickets and Activities | ${BRAND.name}`;
const description =
  "DTCM-approved UAE tour operator. Desert safaris, dhow and yacht cruises, Burj Khalifa tickets, Atlantis Aquaventure, Ferrari World and attraction passes, booked through our Deira office.";

type Emirate = "All" | "Dubai" | "Abu Dhabi" | "Sharjah & Northern Emirates";

export const Route = createFileRoute("/activities/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/activities" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/activities" }],
  }),
  component: ActivitiesPage,
});

function ActivitiesPage() {
  const [cat, setCat] = useState<InboundCategory | "All">("All");
  const [q, setQ] = useState("");
  const [emirate, setEmirate] = useState<Emirate>("All");

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return inboundActivities.filter((a) => {
      if (cat !== "All" && a.category !== cat) return false;
      if (emirate === "Dubai" && a.emirate !== "Dubai") return false;
      if (emirate === "Abu Dhabi" && a.emirate !== "Abu Dhabi") return false;
      if (
        emirate === "Sharjah & Northern Emirates" &&
        (a.emirate === "Dubai" || a.emirate === "Abu Dhabi")
      ) {
        return false;
      }
      if (!term) return true;
      return (
        a.title.toLowerCase().includes(term) ||
        a.emirate.toLowerCase().includes(term) ||
        a.category.toLowerCase().includes(term)
      );
    });
  }, [cat, q, emirate]);

  const active = q.trim() !== "" || cat !== "All" || emirate !== "All";
  const reset = () => {
    setQ("");
    setCat("All");
    setEmirate("All");
  };

  return (
    <div className="bg-[#FFFFFF] text-[#353844]">
      <PageHero
        eyebrow="Dubai & the Emirates"
        title={
          <>
            Tours, tickets &amp; <span className="italic text-[#DDBE5E]">attractions</span>
          </>
        }
        intro="Desert safaris, cruises, observation decks and theme parks across the UAE — booked and ticketed through our Deira office as a DTCM-approved tour operator."
        image="/images/dst/view-at-the-top-burj-khalifa-burj-foot-shot-original-print2-1-2000x1335.jpg"
        imageAlt="Burj Khalifa rising over Downtown Dubai"
        stats={[{ value: "DTCM", label: "Approved operator" }]}
      />

      {/* Filters */}
      <section className="mx-auto mt-10 max-w-[1400px] px-5 sm:px-8">
        <div className="rounded-sm border border-[#E5E5E5] bg-white p-5">
          <label className="flex items-center gap-3 rounded-sm border border-[#E5E5E5] bg-[#FFFFFF] px-4 py-3">
            <Search className="size-4 shrink-0 text-[#CAA42D]" />
            <span className="sr-only">Search activities</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search desert safari, Burj Khalifa, dhow cruise…"
              className="w-full bg-transparent font-sans text-sm text-[#353844] outline-none placeholder:text-slate-400"
            />
            {q ? (
              <button
                type="button"
                onClick={() => setQ("")}
                aria-label="Clear search"
                className="shrink-0 text-slate-400 hover:text-[#00365F]"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </label>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 flex items-center gap-2 font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
              <SlidersHorizontal className="size-3.5 text-[#CAA42D]" />
              Emirate
            </span>
            {(["All", "Dubai", "Abu Dhabi", "Sharjah & Northern Emirates"] as Emirate[]).map((e) => (
              <Chip key={e} on={emirate === e} onClick={() => setEmirate(e)}>
                {e === "All" ? "All emirates" : e}
              </Chip>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="mr-1 font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
              Category
            </span>
            {(["All", ...inboundCategories] as const).map((c) => (
              <Chip
                key={c}
                on={cat === c}
                onClick={() => setCat(c as InboundCategory | "All")}
              >
                {c === "All" ? "All categories" : c}
              </Chip>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E5E5] pb-5">
          <p className="font-sans text-sm text-slate-500" aria-live="polite" aria-atomic="true">
            <span className="font-display text-2xl text-[#00365F]">{list.length}</span>{" "}
            {list.length === 1 ? "experience" : "experiences"}
          </p>
          {active ? (
            <button
              type="button"
              onClick={reset}
              className="font-sans text-xs font-semibold text-[#00365F] underline underline-offset-4 hover:text-[#8F7420]"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-[1400px] px-5 pb-24 pt-10 sm:px-8">
        {list.length === 0 ? (
          <div className="rounded-sm border border-dashed border-[#d8cdb8] bg-white px-6 py-16 text-center">
            <p className="font-display text-2xl text-[#00365F]">No match for those filters</p>
            <p className="mx-auto mt-3 max-w-md font-sans text-sm leading-relaxed text-slate-600">
              We ticket far more than the list shows. Tell our Deira desk what you are after and we
              will source it.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={reset}
                className="rounded-sm border border-[#00365F]/25 px-6 py-3 font-sans text-sm font-semibold text-[#00365F] transition-colors hover:bg-[#00365F]/5"
              >
                Clear filters
              </button>
              <a
                href={waLink(
                  `Hi Nawi Saadi, I'm looking for tickets${q ? ` for ${q}` : " in the UAE"}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-sm bg-[#00365F] px-6 py-3 font-sans text-sm font-semibold text-white transition-colors hover:bg-[#00365F]"
              >
                <MessageCircle className="size-4" />
                Ask on WhatsApp
              </a>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((a, i) => (
              <Reveal key={a.slug} delay={Math.min(i, 8) * 40}>
                <ActivityCard a={a} eager={i < 4} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "rounded-sm px-3 py-1.5 font-sans text-xs font-medium transition-colors",
        on
          ? "bg-[#00365F] text-white"
          : "border border-[#E5E5E5] bg-white text-slate-600 hover:border-[#CAA42D] hover:text-[#00365F]",
      )}
    >
      {children}
    </button>
  );
}
