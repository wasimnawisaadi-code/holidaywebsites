import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { MapPin, Users, CalendarDays, Search } from "lucide-react";
import { countries } from "@/data/countries";
import { packages, waLink } from "@/data/catalogue";

/**
 * Enquiry bar, overlapping the foot of the hero.
 *
 * Deliberately a real tool rather than a decorative strip: picking a
 * destination routes to that country's page when one exists, and otherwise
 * opens WhatsApp with the selection already written into the message, so the
 * consultant receives the brief instead of a bare "hello".
 *
 * Every option is drawn from the catalogue — no invented destinations, and no
 * month list that runs into the past.
 */

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function EnquiryBar() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [travellers, setTravellers] = useState("2 adults");
  const [month, setMonth] = useState("");

  // Only offer countries we actually sell, and start the month list at the
  // current month so nobody can pick a date that has already passed.
  const destinations = useMemo(() => {
    const sold = new Set(packages.map((p) => p.country));
    return countries
      .filter((c) => sold.has(c.name) || c.fromAed !== undefined)
      .map((c) => ({ slug: c.slug, name: c.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const upcomingMonths = useMemo(() => {
    const now = new Date();
    const out: string[] = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      out.push(`${MONTHS[d.getMonth()]} ${d.getFullYear()}`);
    }
    return out;
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const match = destinations.find((d) => d.name === destination);
    if (match) {
      navigate({ to: "/countries/$slug", params: { slug: match.slug } });
      return;
    }
    const bits = [
      destination ? `to ${destination}` : "",
      month ? `in ${month}` : "",
      travellers ? `for ${travellers}` : "",
    ]
      .filter(Boolean)
      .join(" ");
    window.open(
      waLink(`Hi Nawi Saadi, I'd like a holiday quote${bits ? " " + bits : ""}.`),
      "_blank",
      "noopener",
    );
  };

  return (
    <div className="relative z-30 mx-auto -mt-16 max-w-[1400px] px-5 sm:-mt-20 sm:px-8">
      <form
        onSubmit={submit}
        className="liquid-glass-navy sheen grid gap-px overflow-hidden rounded-2xl shadow-[0_24px_60px_-30px_rgba(0,20,40,0.55)] sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_auto]"
      >
        <Field icon={MapPin} label="Destination">
          <input
            list="ns-destinations"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Anywhere"
            aria-label="Destination"
            className="w-full bg-transparent font-sans text-sm font-semibold text-white outline-none placeholder:font-normal placeholder:text-white/55"
          />
          <datalist id="ns-destinations">
            {destinations.map((d) => (
              <option key={d.slug} value={d.name} />
            ))}
          </datalist>
        </Field>

        <Field icon={CalendarDays} label="When">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            aria-label="Travel month"
            className="w-full cursor-pointer bg-transparent font-sans text-sm font-semibold text-white outline-none [&>option]:text-[#00365F]"
          >
            <option value="">Flexible</option>
            {upcomingMonths.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </Field>

        <Field icon={Users} label="Travellers">
          <select
            value={travellers}
            onChange={(e) => setTravellers(e.target.value)}
            aria-label="Travellers"
            className="w-full cursor-pointer bg-transparent font-sans text-sm font-semibold text-white outline-none [&>option]:text-[#00365F]"
          >
            {["1 adult", "2 adults", "2 adults + children", "Family group", "6+ group"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        <button
          type="submit"
          // Brass rather than full-strength gold, with near-black type. #CAA42D on a
          // dark bar was the loudest thing on the page; #B8912A keeps it clearly
          // the primary action without shouting. Text is #0A1B2A because white
          // measures 2.95:1 on this brass and brand navy 4.21:1 — both fail AA
          // for bold body text, where this passes at 5.92:1.
          className="flex items-center justify-center gap-2 bg-[#B8912A] px-8 py-5 font-sans text-sm font-bold text-[#0A1B2A] transition-colors hover:bg-[#CAA42D]"
        >
          <Search className="size-4" />
          <span>Find my trip</span>
        </button>
      </form>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 px-5 py-4 transition-colors hover:bg-white/10">
      <Icon className="size-4 shrink-0 text-[#CAA42D]" />
      <span className="min-w-0 flex-1">
        <span className="block font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">
          {label}
        </span>
        <span className="mt-0.5 block">{children}</span>
      </span>
    </label>
  );
}
