/**
 * Crawls the site and reports anything that fails to load or leads nowhere.
 *
 * The route sweep in verify-site.mjs proves each page renders; this proves the
 * things *inside* the pages resolve. Three classes of failure it catches that
 * a page-level check cannot:
 *
 *   - images and other subresources returning 404 (a renamed or pruned file)
 *   - internal links pointing at routes that no longer exist
 *   - images shipped without an alt attribute
 *
 * Samples a representative page from every route category rather than the whole
 * catalogue, so it stays fast enough to run before every push.
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:5199";

const PAGES = [
  "/",
  "/holidays",
  "/countries",
  "/activities",
  "/about",
  "/contact",
  "/deals",
  "/plan",
  "/uae",
  "/dubai",
  "/customized-tours",
  "/privacy",
  "/terms",
  "/holidays/swiss-alpine-dream",
  "/countries/japan",
  "/activities/burj-khalifa-at-the-top",
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

const failedRequests = new Map(); // url -> Set(pages)
const consoleErrors = new Map();
const internalLinks = new Set();
let missingAlt = 0;

page.on("response", (res) => {
  const status = res.status();
  if (status >= 400) {
    const u = res.url();
    if (!failedRequests.has(u)) failedRequests.set(u, new Set());
    failedRequests.get(u).add(page.url());
  }
});
page.on("console", (m) => {
  if (m.type() !== "error") return;
  const t = m.text();
  if (!consoleErrors.has(t)) consoleErrors.set(t, new Set());
  consoleErrors.get(t).add(page.url());
});

for (const path of PAGES) {
  await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(1200);
  // Scroll the whole page so lazy images and scroll-triggered sections load.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.9;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(900);

  const found = await page.evaluate(() => {
    const links = [...document.querySelectorAll("a[href]")]
      .map((a) => a.getAttribute("href"))
      .filter((h) => h && h.startsWith("/") && !h.startsWith("//"));
    const noAlt = [...document.querySelectorAll("img")].filter(
      (i) => i.getAttribute("alt") === null,
    ).length;
    return { links, noAlt };
  });
  found.links.forEach((l) => internalLinks.add(l.split("#")[0].split("?")[0]));
  missingAlt += found.noAlt;
}

// Every distinct internal link target must resolve.
const brokenLinks = [];
for (const href of [...internalLinks].sort()) {
  if (!href) continue;
  const res = await fetch(BASE + href, { redirect: "follow" }).catch(() => null);
  if (!res || res.status >= 400) brokenLinks.push(`${href} -> ${res ? res.status : "ERR"}`);
}

await browser.close();

const line = (s) => console.log(s);
line(`pages crawled        ${PAGES.length}`);
line(`internal links found ${internalLinks.size}`);
line(`images without alt   ${missingAlt}`);
line("");

let bad = 0;

if (failedRequests.size) {
  bad += failedRequests.size;
  line(`FAILED SUBRESOURCES (${failedRequests.size})`);
  for (const [url, pages] of failedRequests) {
    line(`  ${url}`);
    line(`      on: ${[...pages].join(", ")}`);
  }
  line("");
}

if (brokenLinks.length) {
  bad += brokenLinks.length;
  line(`BROKEN INTERNAL LINKS (${brokenLinks.length})`);
  brokenLinks.forEach((l) => line("  " + l));
  line("");
}

if (consoleErrors.size) {
  bad += consoleErrors.size;
  line(`CONSOLE ERRORS (${consoleErrors.size})`);
  for (const [msg, pages] of consoleErrors) {
    line(`  ${msg.slice(0, 160)}`);
    line(`      on: ${[...pages].slice(0, 3).join(", ")}`);
  }
  line("");
}

if (missingAlt) bad += missingAlt;

line(bad === 0 ? "All assets and links resolve." : `${bad} issue(s) found.`);
process.exit(bad === 0 ? 0 : 1);
