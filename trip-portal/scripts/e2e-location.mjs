/**
 * End-to-end test of maps, the photo guide, and deleting from the dashboard.
 *
 * Covers: placing a step's pin by searching a name and by pasting a Google Maps
 * link; a photo guide with several photos uploaded at once, reordered, and
 * ending at a meeting point; what the customer sees on a phone — the day's
 * route map, directions in three apps, the guide swiped through to the meeting
 * point; a deleted guide taking its photos out of storage; and a trip deleted
 * from its dashboard row, files and all.
 *
 * Writes to the database; everything is named "DEMO — …" and the trip deletes
 * itself at the end. The place search calls OpenStreetMap's geocoder once.
 * Needs .env.local exported and a preview on PORTAL_BASE_URL (default
 * http://localhost:4201). Saves phone screenshots to scripts/__shot-location-*.
 */
import { chromium } from "playwright";

const BASE = process.env.PORTAL_BASE_URL || "http://localhost:4201";
const EMAIL = (process.env.TRIP_ADMIN_EMAILS || "").split(",")[0]?.trim();
const PASSWORD = process.env.ADMIN_PASSWORD;
const SB = process.env.SUPABASE_URL;
const SK = process.env.SUPABASE_SERVICE_ROLE_KEY;

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
};

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

const listFolder = async (bucket, prefix) => {
  const r = await fetch(`${SB}/storage/v1/object/list/${bucket}`, {
    method: "POST",
    headers: { apikey: SK, Authorization: `Bearer ${SK}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prefix, limit: 100 }),
  });
  return r.ok ? (await r.json()).filter((o) => o.id).map((o) => o.name) : [];
};

// A place link as Google Maps' Share button produces it on a desktop: the pin
// is the !3d/!4d pair; the @ pair is only where the view was centred.
const T3 = { name: "Dubai International Airport Terminal 3", lat: 25.2485207, lng: 55.3643842 };
const T3_LINK = `https://www.google.com/maps/place/Dubai+International+Airport+Terminal+3/@25.2501,55.3521,15z/data=!3m1!4b1!4m6!3m5!1s0x0:0x0!8m2!3d${T3.lat}!4d${T3.lng}`;
const PICKUP_LINK =
  "https://www.google.com/maps/place/Terminal+3+Car+Park/@25.2461,55.3601,17z/data=!4m6!3m5!8m2!3d25.2467131!4d55.3629915";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("  [page error]", e.message));
page.on("dialog", (d) => d.accept());

// ---- sign in, create a trip, publish it, open the editor --------------------
await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
await page.fill("#admin-email", EMAIL);
await page.fill("#admin-password", PASSWORD);
await page.getByRole("button", { name: "Sign in" }).click();
await page.getByRole("button", { name: "+ New trip" }).waitFor({ timeout: 30000 });

const customer = `DEMO — Layla Hassan ${Date.now().toString().slice(-5)}`;
await page.getByRole("button", { name: "+ New trip" }).click();
await page.fill('input[name="customerName"]', customer);
await page.fill('input[name="phone"]', "+971500000000");
await page.fill('input[name="destination"]', "Dubai");
await page.fill('input[name="startDate"]', "2026-10-10");
await page.fill('input[name="endDate"]', "2026-10-14");
await page.getByRole("button", { name: "Create trip & generate link" }).click();
const created = page.getByText(/Trip NST-\d{6}-\d{3} created/);
await created.waitFor({ timeout: 30000 });
const code = (await created.innerText()).match(/NST-\d{6}-\d{3}/)[0];
await page.getByRole("button", { name: "Done" }).click();

const row = () => page.locator("article", { hasText: customer });
await row().waitFor({ timeout: 30000 });
await row().getByRole("button", { name: "Link & progress" }).click();
const link = await row().locator("input[readonly]").inputValue();
await row().getByRole("button", { name: "Publish to customer" }).click();
await row().getByRole("button", { name: "Unpublish" }).waitFor({ timeout: 45000 });
await row().getByRole("link", { name: "Edit itinerary" }).click();
await page.getByRole("button", { name: /\+ Add day 1/ }).waitFor({ timeout: 30000 });
const tripId = new URL(page.url()).pathname.split("/").pop();

await page.getByRole("button", { name: /\+ Add day 1/ }).click();
await page.fill('input[name="title"]', "Arrival day");
await page.fill('input[name="date"]', "2026-10-10");
await page.locator('input[name="published"]').first().check();
await page.getByRole("button", { name: "Save day" }).click();
await page.getByRole("button", { name: /\+ Add step 1/ }).waitFor({ timeout: 30000 });

// ---- step 1: pin placed by searching a name ------------------------------------
await page.getByRole("button", { name: /\+ Add step 1/ }).click();
await page.fill('input[name="title"]', "Evening at the Dubai Mall");
await page.getByPlaceholder("Search a place…").fill("Dubai Mall");
await page.getByRole("button", { name: "Search", exact: true }).click();
const firstHit = page.getByRole("list", { name: "Search results" }).getByRole("button").first();
const searched = await firstHit.waitFor({ timeout: 20000 }).then(
  () => true,
  () => false,
);
check("searching a place name returns map results", searched);
if (searched) {
  await firstHit.click();
} else {
  // The geocoder is a free public service; if it is down, the rest of the
  // suite still runs on a pasted link rather than stopping here.
  await page.getByPlaceholder("…or paste a Google Maps link").fill(PICKUP_LINK);
  await page.getByRole("button", { name: "Use link" }).click();
}
const pinText = page.locator("summary .font-mono").first();
await pinText.waitFor({ timeout: 20000 });
check(
  "choosing a result drops a pin with coordinates",
  /^\s*25\.\d{5}, 55\.\d{5}\s*$/.test(await pinText.innerText()),
  await pinText.innerText(),
);
check(
  "the admin map draws the pin",
  (await page.locator("form .leaflet-marker-icon").count()) === 1,
);
check(
  "the admin map loads street tiles",
  await page
    .locator("form .leaflet-tile-loaded")
    .first()
    .waitFor({ timeout: 20000 })
    .then(
      () => true,
      () => false,
    ),
);
check(
  "the location name was filled from the search result",
  (await page.locator('input[name="locationName"]').inputValue()).trim().length > 0,
);
await page.getByRole("button", { name: "Save step" }).click();
await page.getByText("Evening at the Dubai Mall").first().waitFor({ timeout: 30000 });
check(
  "a pinned step is marked 'On the map' in the editor",
  await page
    .locator("li", { hasText: "Evening at the Dubai Mall" })
    .getByText("On the map")
    .first()
    .waitFor({ timeout: 20000 })
    .then(
      () => true,
      () => false,
    ),
);

// ---- step 2: pin placed from a pasted Google Maps link ----------------------------
await page.getByRole("button", { name: /\+ Add step 2/ }).click();
await page.fill('input[name="title"]', "Meet your driver");
await page.getByPlaceholder("…or paste a Google Maps link").fill(T3_LINK);
await page.getByRole("button", { name: "Use link" }).click();
await page.getByText("Pin placed from the link").waitFor({ timeout: 20000 });
check(
  "a pasted Google Maps link names the place",
  (await page.locator('input[name="locationName"]').inputValue()) === T3.name,
  await page.locator('input[name="locationName"]').inputValue(),
);
check(
  "a pasted link uses the place's pin, not the map centre",
  (await page.locator("summary .font-mono").first().innerText()).includes("25.24852, 55.36438"),
  await page.locator("summary .font-mono").first().innerText(),
);
await page.getByRole("button", { name: "Save step" }).click();
const step2 = page.locator("li", { hasText: "Meet your driver" }).first();
await step2.waitFor({ timeout: 30000 });

// ---- a photo guide inside step 2 ------------------------------------------------------
await step2.getByRole("button", { name: /Photo guide/ }).click();
const form = page.locator("div.border-gold").first();
await form.getByLabel("Guide title").fill("Finding your driver at Terminal 3");
await form.getByLabel("Introduction (optional)").fill("Five minutes' walk from baggage claim.");
// Chosen out of order; the editor adds them in file-name (= camera) order.
await form.locator('input[type="file"][multiple]').setInputFiles([
  { name: "IMG_0003.png", mimeType: "image/png", buffer: PNG },
  { name: "IMG_0001.png", mimeType: "image/png", buffer: PNG },
  { name: "IMG_0002.png", mimeType: "image/png", buffer: PNG },
]);
await form.getByLabel("Step 3 instruction").waitFor({ timeout: 45000 });
check("three photos chosen at once become three guide steps", true);
await form.getByLabel("Step 1 instruction").fill("Walk out through Exit 2");
await form.getByLabel("Step 2 instruction").fill("Cross to the car park lift");
await form.getByLabel("Step 3 instruction").fill("Level 1, pillar B4 — your driver waits here");
await form.getByRole("button", { name: "Move step 3 up" }).click();
check(
  "reordering moves a step's text with it",
  (await form.getByLabel("Step 2 instruction").inputValue()).startsWith("Level 1") &&
    (await form.getByLabel("Step 3 instruction").inputValue()).startsWith("Cross"),
);
await form.getByRole("button", { name: "Move step 2 down" }).click();
await form.getByPlaceholder("…or paste a Google Maps link").fill(PICKUP_LINK);
await form.getByRole("button", { name: "Use link" }).click();
await form.getByText("Pin placed from the link").waitFor({ timeout: 20000 });
await form.screenshot({ path: "scripts/__shot-location-editor.png" });
await form.getByRole("button", { name: "Save block" }).click();
await page
  .getByText(/Finding your driver at Terminal 3 · 3 photo steps · meeting point pinned/)
  .first()
  .waitFor({ timeout: 30000 });
check("the guide saves with its steps and meeting point", true);

// ---- the customer, on a phone ----------------------------------------------------
const phoneCtx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const phone = await phoneCtx.newPage();
const phoneErrors = [];
phone.on("pageerror", (e) => phoneErrors.push(e.message));
await phone.goto(link, { waitUntil: "networkidle" });
await phone.screenshot({ path: "scripts/__shot-location-top.png" });

const dayMap = phone.getByRole("region", { name: "Map of day 1" });
check("the day's route map is shown", await dayMap.isVisible());
check(
  "the route map has a numbered pin for each pinned step",
  (await dayMap.locator(".leaflet-marker-icon").count()) === 2 &&
    (await dayMap.locator(".ns-pin-label").allInnerTexts()).join(",") === "1,2",
  (await dayMap.locator(".ns-pin-label").allInnerTexts()).join(","),
);
check("the route line joins the stops", (await dayMap.locator("path.ns-route").count()) === 1);
check(
  "map tiles load for the customer",
  await dayMap
    .locator(".leaflet-tile-loaded")
    .first()
    .waitFor({ timeout: 20000 })
    .then(
      () => true,
      () => false,
    ),
);
await dayMap.scrollIntoViewIfNeeded();
await phone.waitForTimeout(600);
await dayMap.screenshot({ path: "scripts/__shot-location-map.png" });

const wazeHrefs = await phone
  .getByRole("link", { name: "Waze" })
  .evaluateAll((els) => els.map((a) => a.getAttribute("href")));
check(
  "each pinned step offers Waze with its exact coordinates",
  wazeHrefs.some((h) => h?.includes(`ll=${T3.lat},${T3.lng}`)),
  `${wazeHrefs.length} Waze links`,
);
const googleHref = await phone
  .getByRole("link", { name: "Google Maps" })
  .evaluateAll((els) => els.map((a) => a.getAttribute("href")));
check(
  "and Google Maps directions to the same point",
  googleHref.some((h) => h?.includes(`destination=${T3.lat},${T3.lng}`)),
);
check("and Apple Maps", (await phone.getByRole("link", { name: "Apple Maps" }).count()) >= 2);

const guide = phone.getByRole("region", { name: "Finding your driver at Terminal 3" });
const guideShown = await guide.waitFor({ timeout: 15000 }).then(
  () => true,
  () => false,
);
check("the photo guide is shown to the customer", guideShown);
check(
  "the guide says how many steps it has",
  /photo guide · 3 steps/i.test(await guide.innerText()),
);
const guidePhotos = guide.locator('img[alt^="Step "]');
await guidePhotos.first().scrollIntoViewIfNeeded();
check("every guide step has its photo", (await guidePhotos.count()) === 3);
check(
  "the guide's photos actually load",
  await guidePhotos.evaluateAll((imgs) =>
    Promise.all(
      imgs.map((img) =>
        img.complete
          ? img.naturalWidth > 0
          : new Promise((r) => {
              img.addEventListener("load", () => r(img.naturalWidth > 0));
              img.addEventListener("error", () => r(false));
              img.loading = "eager";
            }),
      ),
    ).then((all) => all.every(Boolean)),
  ),
);
check(
  "steps are in the order the office set",
  (await guidePhotos.evaluateAll((imgs) => imgs.map((i) => i.alt))).join(" | ") ===
    "Step 1: Walk out through Exit 2 | Step 2: Cross to the car park lift | Step 3: Level 1, pillar B4 — your driver waits here",
);
await guide.scrollIntoViewIfNeeded();
await phone.waitForTimeout(500);
await guide.screenshot({ path: "scripts/__shot-location-guide.png" });

await guide.getByRole("button", { name: "Full screen", exact: true }).click();
const viewer = phone.getByRole("dialog");
await viewer.waitFor({ timeout: 10000 });
check(
  "full screen opens on step 1 with its instruction",
  ((await viewer.getAttribute("aria-label")) ?? "").includes(
    "Step 1 of 3 — Walk out through Exit 2",
  ),
);
await phone.keyboard.press("Escape");
await viewer.waitFor({ state: "detached", timeout: 10000 });

const status = guide.locator('[aria-live="polite"]');
await guide.getByRole("button", { name: "Next step" }).click();
await phone.waitForFunction(
  (el) => el?.textContent === "Step 2 of 3",
  await status.elementHandle(),
  { timeout: 10000 },
);
check("Next moves the guide to step 2", true);
await guide.getByRole("button", { name: "Next step" }).click();
await guide.getByRole("button", { name: "Next step" }).click();
const atEnd = await phone
  .waitForFunction((el) => el?.textContent === "Meeting point", await status.elementHandle(), {
    timeout: 10000,
  })
  .then(
    () => true,
    () => false,
  );
check("the guide ends at the meeting point", atEnd);
check("the meeting point says you have arrived", /you have arrived/i.test(await guide.innerText()));
check(
  "the meeting point has its own map and directions",
  (await guide.getByRole("region", { name: /^Map: / }).count()) === 1 &&
    (await guide.getByRole("link", { name: "Waze" }).getAttribute("href"))?.includes("25.2467131"),
);
check("no errors in the customer's browser", phoneErrors.length === 0, phoneErrors.join(" | "));
await phone.screenshot({ path: "scripts/__shot-location-full.png", fullPage: true });

// ---- deleting the guide takes its photos out of storage ------------------------------
const before = (await listFolder("trip-media", `${tripId}/`)).length;
const guideRow = page.locator("div.rounded-lg", { hasText: "3 photo steps" }).first();
await guideRow.getByRole("button", { name: "Delete block" }).click();
await page.getByText(/3 photo steps/).waitFor({ state: "detached", timeout: 30000 });
const after = (await listFolder("trip-media", `${tripId}/`)).length;
check("deleting a guide deletes its three photos", before - after === 3, `${before} → ${after}`);

// ---- delete the trip from its dashboard row -----------------------------------------
await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: "All trips" }).click();
await row()
  .getByRole("button", { name: `Delete trip ${code}` })
  .click();
const confirm = row().getByRole("group", { name: `Delete trip ${code}` });
await confirm.waitFor({ timeout: 10000 });
check(
  "delete stays locked until the reference is typed",
  await confirm.getByRole("button", { name: "Delete forever" }).isDisabled(),
);
await confirm.getByLabel(/to confirm/).fill(code.toLowerCase());
await row().screenshot({ path: "scripts/__shot-location-delete.png" });
check(
  "typing the reference unlocks it (any case)",
  await confirm.getByRole("button", { name: "Delete forever" }).isEnabled(),
);
await confirm.getByRole("button", { name: "Delete forever" }).click();
await row().waitFor({ state: "detached", timeout: 45000 });
check("the trip disappears from the dashboard", true);
const left =
  (await listFolder("trip-media", `${tripId}/`)).length +
  (await listFolder("trip-docs", `${tripId}/`)).length;
check("its files are gone from storage", left === 0, `${left} left`);
await phone.goto(link, { waitUntil: "domcontentloaded" });
check(
  "the customer's link stops working",
  (await phone.locator("body").innerText()).includes("find this trip"),
);

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
