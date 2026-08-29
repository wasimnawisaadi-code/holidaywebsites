/**
 * Reports JSX components that a route uses but never imports or defines.
 *
 * These fail at runtime, not at build time: Vite happily bundles a file that
 * references an undefined identifier inside JSX, and the page only breaks when
 * React tries to render it. The route sweep catches the symptom as a console
 * error; this names the cause directly.
 *
 * Two of these shipped in one session (TrustMetricsBar, ArrowBadgeLink), both
 * from a component being added to the tree without its import line.
 */
import fs from "node:fs";
import path from "node:path";

const DIRS = ["src/routes", "src/components/site", "src/components/3d"];

const files = DIRS.filter((d) => fs.existsSync(d)).flatMap((d) =>
  fs.readdirSync(d).filter((f) => f.endsWith(".tsx")).map((f) => path.join(d, f)),
);

let problems = 0;

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");

  // A `<` only opens JSX when it follows whitespace, a bracket, or a return —
  // `useRef<HTMLDivElement>` is a type argument, not an element, and matching it
  // produced 26 false positives against one real bug.
  const used = [
    ...new Set(
      [...src.matchAll(/(^|[\s(){}[\],;=>?:])<([A-Z][A-Za-z0-9_]*)[\s/>]/gm)].map((m) => m[2]),
    ),
  ];

  const missing = used.filter((name) => {
    // Any import that mentions the identifier — named, default or namespaced.
    const imported = new RegExp(`import[^;]*\\b${name}\\b[^;]*from`, "s").test(src);
    // Declared locally...
    const declared = new RegExp(`(?:function|const|class)\\s+${name}\\b`).test(src);
    // ...or bound by destructuring, including a rename such as `{ icon: Icon }`
    // or a polymorphic `{ as: Tag = "div" }`. Both are real bindings that no
    // import line will ever mention.
    const destructured = new RegExp(`[:{,]\\s*${name}\\s*[,}=]`).test(src);
    return !imported && !declared && !destructured;
  });

  if (missing.length) {
    problems += missing.length;
    console.log(`${file}`);
    missing.forEach((m) => console.log(`    ${m}`));
  }
}

console.log(
  problems === 0
    ? `\nAll JSX components resolve across ${files.length} files.`
    : `\n${problems} unresolved component reference(s).`,
);
process.exit(problems === 0 ? 0 : 1);
