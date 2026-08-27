import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://localhost:5199/", { waitUntil: "networkidle" });
const finder = p.locator("section", { hasText: "What are you looking for?" }).last();
await finder.scrollIntoViewIfNeeded();
await p.waitForTimeout(1200);
const count = async () => (await finder.locator("li > a").count());
const shown = async () => (await finder.locator("p[aria-live] span").first().textContent());
console.log(`initial: cards=${await count()} label=${await shown()}`);

const input = finder.locator('input[placeholder*="Switzerland"]');
await input.fill("switzerland");
await p.waitForTimeout(700);
console.log(`search 'switzerland': cards=${await count()} label=${await shown()}`);

await input.fill("");
await finder.getByRole("button", { name: "AED 5,000+" }).click();
await p.waitForTimeout(700);
console.log(`budget 5000+: cards=${await count()} label=${await shown()}`);

await finder.getByRole("button", { name: "8+ nights" }).click();
await p.waitForTimeout(700);
console.log(`+ 8+ nights: cards=${await count()} label=${await shown()}`);

// force an empty state
await input.fill("zzzznotathing");
await p.waitForTimeout(700);
const empty = await finder.getByText("Nothing matches those filters").isVisible();
console.log(`empty state shows: ${empty}`);
await b.close();
