import { useMemo, useState } from "react";
import { experienceCategories, type Experience } from "@/data/catalogue";
import { Reveal } from "@/components/site/Reveal";
import { TourCard } from "@/components/site/TourCard";
import { cn } from "@/lib/utils";

const durations = ["Any", "<1 Hour", "1–2 Hours", "2–4 Hours", "Half Day", "Full Day"] as const;
const audiences = ["Any", "Adults", "Children", "Families", "Couples", "Groups"] as const;
const budgets = ["Any budget", "Under AED 100", "AED 100–250", "AED 250–500", "AED 500+"] as const;
const sorts = [
  "Recommended",
  "Price: low to high",
  "Price: high to low",
  "Biggest discount",
] as const;

export function TourBrowser({
  pool,
  emirateOptions,
}: {
  pool: Experience[];
  emirateOptions?: string[];
}) {
  const [emirate, setEmirate] = useState("All");
  const [category, setCategory] = useState<string>("All");
  const [duration, setDuration] = useState<(typeof durations)[number]>("Any");
  const [audience, setAudience] = useState<(typeof audiences)[number]>("Any");
  const [budget, setBudget] = useState<(typeof budgets)[number]>("Any budget");
  const [sort, setSort] = useState<(typeof sorts)[number]>("Recommended");
  const [q, setQ] = useState("");

  const categories = useMemo(
    () => ["All", ...experienceCategories.filter((c) => pool.some((e) => e.category === c))],
    [pool],
  );

  const results = useMemo(() => {
    const list = pool.filter((e) => {
      if (emirate !== "All" && e.emirate !== emirate) return false;
      if (category !== "All" && e.category !== category) return false;
      if (duration !== "Any" && e.duration !== duration) return false;
      if (audience !== "Any" && !e.audience.includes(audience as never)) return false;
      if (
        q &&
        !`${e.title} ${e.overview} ${e.emirate} ${e.category}`
          .toLowerCase()
          .includes(q.toLowerCase())
      )
        return false;
      if (budget !== "Any budget") {
        const p = e.priceStatus === "from" ? e.priceFrom : undefined;
        if (p === undefined) return false;
        if (budget === "Under AED 100" && p >= 100) return false;
        if (budget === "AED 100–250" && (p < 100 || p > 250)) return false;
        if (budget === "AED 250–500" && (p < 250 || p > 500)) return false;
        if (budget === "AED 500+" && p < 500) return false;
      }
      return true;
    });

    const price = (v: Experience) =>
      v.priceStatus === "from" ? (v.priceFrom ?? 0) : Number.MAX_SAFE_INTEGER;
    const off = (v: Experience) =>
      v.wasPrice && v.priceFrom ? (v.wasPrice - v.priceFrom) / v.wasPrice : 0;

    if (sort === "Price: low to high") return [...list].sort((a, b) => price(a) - price(b));
    if (sort === "Price: high to low") return [...list].sort((a, b) => price(b) - price(a));
    if (sort === "Biggest discount") return [...list].sort((a, b) => off(b) - off(a));
    return list;
  }, [pool, emirate, category, duration, audience, budget, sort, q]);

  const field =
    "mt-2 w-full rounded-xl border border-input bg-surface px-4 py-3 text-sm outline-none focus:border-primary";

  return (
    <>
      <div className="no-scrollbar mt-10 flex gap-2 overflow-x-auto pb-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm transition-colors",
              category === c
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-foreground/75 hover:border-primary/50",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div
        className={cn(
          "mt-4 grid gap-4 rounded-3xl border border-border bg-surface p-4 md:grid-cols-2",
          emirateOptions ? "lg:grid-cols-5" : "lg:grid-cols-4",
        )}
      >
        <label>
          <span className="eyebrow">Search</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Burj Khalifa, safari…"
            className={field}
          />
        </label>
        {emirateOptions ? (
          <label>
            <span className="eyebrow">Emirate</span>
            <select value={emirate} onChange={(e) => setEmirate(e.target.value)} className={field}>
              {["All", ...emirateOptions].map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>
          </label>
        ) : null}
        <label>
          <span className="eyebrow">Budget</span>
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value as never)}
            className={field}
          >
            {budgets.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="eyebrow">Duration</span>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value as never)}
            className={field}
          >
            {durations.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="eyebrow">Audience</span>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value as never)}
            className={field}
          >
            {audiences.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {results.length} experiences
        </p>
        <label className="flex items-center gap-3 text-sm text-muted-foreground">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as never)}
            className="rounded-full border border-input bg-surface px-4 py-2 text-sm outline-none focus:border-primary"
          >
            {sorts.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((e, i) => (
          <Reveal key={e.slug} delay={Math.min(i, 8) * 50} as="article">
            <TourCard e={e} />
          </Reveal>
        ))}
      </div>

      {results.length === 0 ? (
        <p className="mx-auto mt-16 max-w-md text-center text-muted-foreground">
          Nothing matches those filters yet — message us on WhatsApp and we'll build it for you.
        </p>
      ) : null}
    </>
  );
}
