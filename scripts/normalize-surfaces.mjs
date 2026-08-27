/**
 * One-off: collapse the drifted per-page surface tones onto the three canonical
 * grounds defined in styles.css. Pages had six near-identical papers and nine
 * near-identical darks, which is why each route looked like a different site.
 */
import fs from "node:fs";
import path from "node:path";

// paper-family variants -> canonical paper / raised
const PAPER = ["#fbf8f2", "#fcfaf6", "#f5f1e8", "#fdfbf7", "#eae4d8"];
const RAISED = ["#FCFDFE", "#fcfdfe"];
// dark-family variants -> canonical navy. #04121f is left alone: it is the
// WebGL globe stage and the video hero scrim, which are meant to be near-black.
const NAVY = ["#020b14", "#030e19", "#001f3f", "#00203c", "#00243f", "#0a3a63", "#12293f"];

const files = [];
for (const dir of ["src/routes", "src/components/site", "src/components/3d"]) {
  for (const f of fs.readdirSync(dir)) {
    if (f.endsWith(".tsx")) files.push(path.join(dir, f));
  }
}

let touched = 0;
const report = {};
for (const file of files) {
  let s = fs.readFileSync(file, "utf8");
  const before = s;
  for (const hex of PAPER) {
    s = s.split(`bg-[${hex}]`).join("surface-paper");
    s = s.split(`bg-[${hex.toUpperCase()}]`).join("surface-paper");
  }
  for (const hex of RAISED) s = s.split(`bg-[${hex}]`).join("surface-raised");
  s = s.split("bg-[#f7f5f1]").join("surface-paper");
  for (const hex of NAVY) {
    s = s.split(`bg-[${hex}]`).join("bg-[#003058]");
    s = s.split(`from-[${hex}]`).join("from-[#003058]");
    s = s.split(`via-[${hex}]`).join("via-[#003058]");
    s = s.split(`to-[${hex}]`).join("to-[#003058]");
  }
  // canonical hairline
  s = s.split("border-[#e6ded0]").join("rule-paper");
  if (s !== before) {
    fs.writeFileSync(file, s);
    touched++;
    report[file] = true;
  }
}
console.log("files rewritten:", touched);
for (const f of Object.keys(report)) console.log("  ", f);
