import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { inboundCategories, type InboundActivity, type InboundCategory } from "@/data/inbound";
import { ActivityCard } from "@/components/site/ActivityCard";
import { Reveal } from "@/components/site/Reveal";
import { cn } from "@/lib/utils";

export function ActivityBrowser({
  pool,
  filterEmirate,
  placeholder = "Search safari, cruise, Burj Khalifa…",
}: {
  pool: InboundActivity[];
  filterEmirate?: string;
  placeholder?: string;
}) {
  const [cat, setCat] = useState<InboundCategory | "All">("All");
  const [q, setQ] = useState("");

  const activePool = useMemo(() => {
    if (!filterEmirate) return pool;
    const directMatches = pool.filter(
      (a) => a.emirate.toLowerCase() === filterEmirate.toLowerCase(),
    );
    return directMatches.length > 0 ? directMatches : pool;
  }, [pool, filterEmirate]);

  const cats = useMemo(
    () => inboundCategories.filter((c) => activePool.some((a) => a.category === c)),
    [activePool],
  );

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return activePool.filter((a) => {
      if (cat !== "All" && a.category !== cat) return false;
      if (!term) return true;
      return (
        a.title.toLowerCase().includes(term) ||
        a.emirate.toLowerCase().includes(term) ||
        a.category.toLowerCase().includes(term)
      );
    });
  }, [activePool, cat, q]);

  return (
    <div>
      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center">
        <label className="glass flex w-full items-center gap-3 rounded-full px-5 py-3 lg:max-w-sm">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-label="Search activities"
          />
        </label>

        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          {(["All", ...cats] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c as InboundCategory | "All")}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm transition-colors",
                cat === c
                  ? "border-primary bg-primary text-primary-foreground font-medium"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-accent",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10">
        {list.length === 0 ? (
          <p className="rounded-2xl bg-surface p-8 text-center text-muted-foreground">
            No activities match that search. Try another keyword or category.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((a, i) => (
              <Reveal key={a.slug} delay={Math.min(i, 8) * 60}>
                <ActivityCard a={a} eager={i < 4} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
