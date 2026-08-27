const fs = require("fs");
const block = `                  <li className="flex items-center gap-2">
                    <Phone className="size-4 shrink-0 text-accent" aria-hidden />
                    <a href={\`tel:\${o.phone.replace(/\s/g, "")}\`} className="hover:text-accent">
                      {o.phone}
                    </a>
                  </li>
`;
// Only the Dubai office publishes a number; the others are named, not dialled.
const guarded = `                  {o.city === "Dubai" ? (
                    <li className="flex items-center gap-2">
                      <Phone className="size-4 shrink-0 text-accent" aria-hidden />
                      <a href={\`tel:\${BRAND.phone.replace(/\s/g, "")}\`} className="hover:text-accent">
                        {BRAND.phone}
                      </a>
                    </li>
                  ) : null}
`;
for (const f of ["src/routes/contact.tsx", "src/routes/about.tsx"]) {
  let t = fs.readFileSync(f, "utf8");
  if (!t.includes(block)) { console.log("!! block not found in " + f); continue; }
  t = t.split(block).join(guarded);
  fs.writeFileSync(f, t);
  console.log("updated " + f);
}
