/**
 * Infinite credential strip.
 *
 * The list is rendered twice and the track slides exactly -50%, so the second
 * copy is in the first copy's place at the moment the animation restarts and
 * the loop is seamless. Hovering pauses it, so anyone who wants to read an item
 * can stop on it.
 *
 * Every line is a verifiable fact about the agency — accreditations and real
 * office cities — not invented logos or partner badges.
 */

type Mark = { label: string; icon: "ring" | "wings" | "shield" | "pin" | "clock" | "globe" };

const MARKS: Mark[] = [
  { label: "IATA accredited agency", icon: "ring" },
  { label: "flydubai GSA — Afghanistan", icon: "wings" },
  { label: "DTCM approved operator", icon: "shield" },
  { label: "Deira, Dubai", icon: "pin" },
  { label: "Kabul, Afghanistan", icon: "pin" },
  { label: "Jeddah, Saudi Arabia", icon: "pin" },
  { label: "Trading since 2009", icon: "clock" },
  { label: "40+ destinations", icon: "globe" },
];

function Icon({ kind }: { kind: Mark["icon"] }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 22 22",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (kind) {
    case "ring":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="8.5" />
          <circle cx="11" cy="11" r="3.6" />
        </svg>
      );
    case "wings":
      return (
        <svg {...common}>
          <path d="M2 12h7l3-6 3 6h5" />
          <path d="M5 16h12" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M11 2.5 4 5.4v5.2c0 4.3 2.9 7.5 7 8.9 4.1-1.4 7-4.6 7-8.9V5.4L11 2.5Z" />
          <path d="m8 11 2.2 2.2L14.5 9" />
        </svg>
      );
    case "pin":
      return (
        <svg {...common}>
          <path d="M11 19.5s6-5 6-9.5a6 6 0 1 0-12 0c0 4.5 6 9.5 6 9.5Z" />
          <circle cx="11" cy="10" r="2.3" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="8.5" />
          <path d="M11 6v5.3l3.2 2" />
        </svg>
      );
    case "globe":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="8.5" />
          <path d="M2.5 11h17M11 2.5c2.2 2.4 3.3 5.4 3.3 8.5S13.2 17.1 11 19.5C8.8 17.1 7.7 14.1 7.7 11S8.8 4.9 11 2.5Z" />
        </svg>
      );
  }
}

export function CredentialMarquee() {
  // Doubled so the -50% translate lands on an identical frame.
  const doubled = [...MARKS, ...MARKS];

  return (
    <section className="marquee-host overflow-hidden border-y border-[#E5E5E5] bg-[#FFFFFF] py-5">
      {/* One accessible copy; the visual strip is decorative and duplicated. */}
      <h2 className="sr-only">Accreditations and offices</h2>
      <ul className="sr-only">
        {MARKS.map((m) => (
          <li key={m.label}>{m.label}</li>
        ))}
      </ul>

      <div className="marquee-track" aria-hidden="true">
        {doubled.map((m, i) => (
          <div
            key={`${m.label}-${i}`}
            className="flex shrink-0 items-center gap-2.5 px-8 text-[#00365F]"
          >
            <span className="text-[#CAA42D]">
              <Icon kind={m.icon} />
            </span>
            <span className="whitespace-nowrap font-sans text-sm font-medium tracking-wide text-[#666666]">
              {m.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
