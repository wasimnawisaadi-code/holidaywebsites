import { Award, BadgeCheck, Building2, Globe2, Plane, Users } from "lucide-react";
import { credentials } from "@/data/catalogue";
import { Reveal } from "@/components/site/Reveal";

const icons = [BadgeCheck, Plane, Award, Globe2, Users, Building2];

export function CredentialGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {credentials.map((c, i) => {
        const Icon = icons[i % icons.length]!;
        return (
          <Reveal key={c.code} delay={i * 70}>
            <div className="h-full rounded-3xl bg-surface p-7">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-accent">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="text-display text-xl text-accent">{c.code}</span>
              </div>
              <h3 className="mt-4 text-xl">{c.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}

/** Compact single-line credibility strip for the homepage. */
export function TrustStrip() {
  return (
    <section aria-label="Accreditations" className="border-y border-border bg-surface/60">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-x-10 gap-y-4 px-5 py-6 sm:px-8">
        {credentials.map((c) => (
          <div key={c.code} className="flex items-center gap-2 text-sm">
            <BadgeCheck className="size-4 text-accent" aria-hidden />
            <span className="font-medium">{c.title}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
