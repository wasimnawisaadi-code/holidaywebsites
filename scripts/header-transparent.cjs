const fs = require("fs");
const f = "src/components/site/SiteHeader.tsx";
let t = fs.readFileSync(f, "utf8");

t = t.replace(
  'import { Link } from "@tanstack/react-router";',
  'import { Link, useRouterState } from "@tanstack/react-router";'
);

t = t.replace(
  `        scrolled || openMenu || mobileOpen
          ? "border-b border-[#e6ded0] bg-[#fbf8f2]/95 backdrop-blur-md"
          : "border-b border-transparent bg-[#fbf8f2]",`,
  `        transparent
          ? "border-b border-white/15 bg-gradient-to-b from-black/45 to-transparent"
          : "border-b border-[#e6ded0] bg-[#fbf8f2]/95 backdrop-blur-md",`
);

// Logo swaps to the light mark over the dark hero.
t = t.replace(
  'import logoImg from "@/assets/logo.png";',
  'import logoImg from "@/assets/logo.png";\nimport logoLight from "@/assets/logo-dark.png";'
);
t = t.replace(
  '<img src={logoImg} alt={BRAND.name} className="h-10 w-auto sm:h-11" />',
  '<img\n            src={transparent ? logoLight : logoImg}\n            alt={BRAND.name}\n            className="h-10 w-auto sm:h-11"\n          />'
);

// Nav + action colours flip with the header.
t = t.replace(
  `<NavLink to="/activities" onHover={scheduleClose}>
            Dubai & UAE
          </NavLink>`,
  `<NavLink to="/activities" onHover={scheduleClose} light={transparent}>
            Dubai & UAE
          </NavLink>`
);
t = t.replace(
  `<NavLink to="/customized-tours" onHover={scheduleClose}>
            Tailor-made
          </NavLink>`,
  `<NavLink to="/customized-tours" onHover={scheduleClose} light={transparent}>
            Tailor-made
          </NavLink>`
);
t = t.replace(
  `<NavLink to="/about" onHover={scheduleClose}>
            About
          </NavLink>`,
  `<NavLink to="/about" onHover={scheduleClose} light={transparent}>
            About
          </NavLink>`
);
t = t.replace(
  `<NavLink to="/contact" onHover={scheduleClose}>
            Contact
          </NavLink>`,
  `<NavLink to="/contact" onHover={scheduleClose} light={transparent}>
            Contact
          </NavLink>`
);
t = t.replace(
  `            isOpen={openMenu === "holidays"}
            onOpen={() => open("holidays")}
          />`,
  `            isOpen={openMenu === "holidays"}
            onOpen={() => open("holidays")}
            light={transparent}
          />`
);
t = t.replace(
  `            isOpen={openMenu === "destinations"}
            onOpen={() => open("destinations")}
          />`,
  `            isOpen={openMenu === "destinations"}
            onOpen={() => open("destinations")}
            light={transparent}
          />`
);

// Phone + Enquire button.
t = t.replace(
  `            className="flex items-center gap-2 text-sm font-semibold text-[#003058] transition-colors hover:text-[#a8851f]"`,
  `            className={cn(
              "flex items-center gap-2 text-sm font-semibold transition-colors",
              transparent ? "text-white hover:text-[#dcbf5a]" : "text-[#003058] hover:text-[#a8851f]",
            )}`
);
t = t.replace(
  `            className="inline-flex items-center gap-2 rounded-sm bg-[#003058] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#00203c]"`,
  `            className={cn(
              "inline-flex items-center gap-2 rounded-sm px-5 py-2.5 text-sm font-semibold transition-colors",
              transparent
                ? "bg-[#c8a028] text-[#04121f] hover:bg-[#dcbf5a]"
                : "bg-[#003058] text-white hover:bg-[#00203c]",
            )}`
);
t = t.replace(
  `          className="flex size-11 items-center justify-center rounded-sm border border-[#003058]/20 text-[#003058] lg:hidden"`,
  `          className={cn(
            "flex size-11 items-center justify-center rounded-sm border lg:hidden",
            transparent ? "border-white/35 text-white" : "border-[#003058]/20 text-[#003058]",
          )}`
);

// NavLink / MenuTrigger signatures gain the light flag.
t = t.replace(
  `function NavLink({
  to,
  children,
  onHover,
}: {
  to: string;
  children: React.ReactNode;
  onHover: () => void;
}) {
  return (
    <Link
      to={to}
      onMouseEnter={onHover}
      className="rounded-sm px-3.5 py-2 text-sm font-medium text-[#1c1a17] transition-colors hover:text-[#a8851f]"
    >`,
  `function NavLink({
  to,
  children,
  onHover,
  light = false,
}: {
  to: string;
  children: React.ReactNode;
  onHover: () => void;
  light?: boolean;
}) {
  return (
    <Link
      to={to}
      onMouseEnter={onHover}
      className={cn(
        "rounded-sm px-3.5 py-2 text-sm font-medium transition-colors",
        light ? "text-white/90 hover:text-[#dcbf5a]" : "text-[#1c1a17] hover:text-[#a8851f]",
      )}
    >`
);
t = t.replace(
  `function MenuTrigger({
  label,
  isOpen,
  onOpen,
}: {
  label: string;
  isOpen: boolean;
  onOpen: () => void;
}) {`,
  `function MenuTrigger({
  label,
  isOpen,
  onOpen,
  light = false,
}: {
  label: string;
  isOpen: boolean;
  onOpen: () => void;
  light?: boolean;
}) {`
);
t = t.replace(
  `        isOpen ? "text-[#a8851f]" : "text-[#1c1a17] hover:text-[#a8851f]",`,
  `        isOpen
          ? "text-[#a8851f]"
          : light
            ? "text-white/90 hover:text-[#dcbf5a]"
            : "text-[#1c1a17] hover:text-[#a8851f]",`
);

fs.writeFileSync(f, t);
console.log("header updated");
