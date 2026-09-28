/**
 * End-to-end test of full create / update / delete, invoice PDFs and photos.
 *
 * Covers what the other suites do not: editing a trip after creation, trip and
 * day cover photos, invoice PDFs for the customer and the office (and that a
 * wrong link gets nothing), deleting a progress update, the drivers page, and
 * deleting a whole trip — including proof that its files leave storage.
 *
 * Writes to the database; everything is named "DEMO — …" and the trip it
 * creates deletes itself at the end. Needs .env.local exported and a preview on
 * PORTAL_BASE_URL (default http://localhost:4201).
 *
 * Also saves phone- and desktop-sized screenshots to scripts/__shot-*.png.
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

// A real (tiny) JPEG-sized photo is not needed; storage checks the declared type.
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

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("  [page error]", e.message));
let promptAnswer = "";
page.on("dialog", (d) => (d.type() === "prompt" ? d.accept(promptAnswer) : d.accept()));

// ---- sign in, screenshot the dashboard ---------------------------------------
await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
await page.screenshot({ path: "scripts/__shot-signin.png" });
await page.fill("#admin-email", EMAIL);
await page.fill("#admin-password", PASSWORD);
await page.getByRole("button", { name: "Sign in" }).click();
await page.getByRole("button", { name: "+ New trip" }).waitFor({ timeout: 30000 });

// ---- create a trip --------------------------------------------------------
const customer = `DEMO — Sara Ahmed ${Date.now().toString().slice(-5)}`;
await page.getByRole("button", { name: "+ New trip" }).click();
await page.fill('input[name="customerName"]', customer);
await page.fill('input[name="phone"]', "+971500000000");
await page.fill('input[name="destination"]', "Maldives");
await page.fill('input[name="startDate"]', "2026-10-10");
await page.fill('input[name="endDate"]', "2026-10-14");
await page.getByRole("button", { name: "Create trip & generate link" }).click();
const code = ((
  await page.getByText(/Trip NST-\d{6}-\d{3} created/).innerText({ timeout: 30000 })
).match(/NST-\d{6}-\d{3}/) ?? [""])[0];
await page.getByRole("button", { name: "Done" }).click();
const row = page.locator("article", { hasText: customer });
await row.waitFor({ timeout: 30000 });
check("trip created", Boolean(code), code);

// search finds it by phone number
await page.getByPlaceholder(/Search name, reference/).fill("500000000");
check("dashboard search finds the trip by phone", await row.isVisible());
await page.getByPlaceholder(/Search name, reference/).fill("");
await page.screenshot({ path: "scripts/__shot-dashboard.png", fullPage: true });

await row.getByRole("button", { name: "Link & progress" }).click();
const link = await row.locator("input[readonly]").inputValue();
const token = link.split("/t/")[1];
await row.getByRole("button", { name: "Publish to customer" }).click();
await row.getByRole("button", { name: "Unpublish" }).waitFor({ timeout: 45000 });
await row.getByLabel("Progress stage").selectOption("driver_assigned");
await row.getByPlaceholder(/Note for the customer/).fill("Wrong trip — this update is a mistake.");
await row.getByRole("button", { name: "Save update" }).click();
await page
  .locator("article", { hasText: customer })
  .getByText(/Driver assigned · \d+%/)
  .waitFor({ timeout: 45000 });

await page
  .locator("article", { hasText: customer })
  .getByRole("link", { name: "Edit itinerary" })
  .click();
await page.getByRole("button", { name: /Trip details/ }).waitFor({ timeout: 30000 });
const tripId = new URL(page.url()).pathname.split("/").pop();

// ---- update: trip details ----------------------------------------------------
await page.getByRole("button", { name: /Trip details/ }).click();
await page.getByLabel("Title shown to the customer").fill("Maldives honeymoon, overwater villa");
await page.getByLabel("Adults").fill("2");
await page.getByRole("button", { name: "Save trip details" }).click();
await page.getByRole("status").filter({ hasText: "Saved." }).waitFor({ timeout: 45000 });
check("trip details save", true);

// ---- cover photo -----------------------------------------------------------
await page.locator('label:has-text("cover photo") input[type="file"]').setInputFiles({
  name: "villa.png",
  mimeType: "image/png",
  buffer: PNG,
});
await page
  .getByRole("button", { name: "Remove and use the standard photo" })
  .waitFor({ timeout: 60000 });
check("cover photo uploads", true);

// ---- a day with its own photo -------------------------------------------------
await page.getByRole("button", { name: /^Itinerary/ }).click();
await page.getByRole("button", { name: /\+ Add day 1/ }).click();
await page.fill('input[name="title"]', "Arrival in Malé");
await page.locator('input[name="published"]').first().check();
await page.getByRole("button", { name: "Save day" }).click();
await page.getByText("Arrival in Malé").first().waitFor({ timeout: 45000 });
await page.locator('label:has-text("Add a photo for day 1") input[type="file"]').setInputFiles({
  name: "male-jetty.png",
  mimeType: "image/png",
  buffer: PNG,
});
await page.getByText("Change photo").first().waitFor({ timeout: 60000 });
check("day photo uploads", true);

// ---- invoice + PDFs ----------------------------------------------------------
await page.getByRole("button", { name: /^Invoices/ }).click();
await page.getByRole("button", { name: "+ New invoice" }).click();
const invNumber = (
  await page
    .getByText(/^NSI-\d{4}-T?\d+$/)
    .first()
    .innerText({ timeout: 45000 })
).trim();
await page.getByRole("button", { name: "+ Add line item" }).click();
await page.fill('input[name="description"]', "Overwater villa, 4 nights");
await page.fill('input[name="quantity"]', "1");
await page.fill('input[name="unitPrice"]', "8400.50");
await page.getByRole("button", { name: "Save item" }).click();
await page.getByText("Overwater villa, 4 nights").waitFor({ timeout: 45000 });
await page.fill('input[name="amountPaid"]', "2000");
await page.locator('input[name="published"]').last().check();
await page.getByRole("button", { name: "Save invoice" }).click();
const invSection = page.locator("section", { hasText: invNumber }).first();
await invSection.getByText(/visible to customer/i).waitFor({ timeout: 45000 });

const adminPdfHref = await invSection.getByRole("link", { name: /PDF/ }).getAttribute("href");
const adminPdf = await page.request.get(`${BASE}${adminPdfHref}`);
const adminBytes = await adminPdf.body();
check(
  "office can open the invoice PDF",
  adminPdf.status() === 200 &&
    adminPdf.headers()["content-type"] === "application/pdf" &&
    adminBytes.subarray(0, 5).toString() === "%PDF-",
  `${adminBytes.length} bytes`,
);

const signedOut = await browser.newContext();
const anon = await signedOut.request.get(`${BASE}${adminPdfHref}`, { maxRedirects: 0 });
check(
  "office PDF refuses a signed-out visitor",
  anon.status() === 302 || anon.status() === 401,
  `HTTP ${anon.status()}`,
);

// ---- delete a mistaken progress update --------------------------------------------
await page.getByRole("button", { name: /^Activity/ }).click();
await page.getByRole("heading", { name: "Progress history" }).waitFor({ timeout: 45000 });
const mistaken = page.locator("li", { hasText: "Wrong trip — this update is a mistake." });
await mistaken.getByRole("button", { name: "Delete this update" }).click();
await mistaken.waitFor({ state: "detached", timeout: 45000 });
check("a progress update can be deleted", true);

// ---- the customer's view ------------------------------------------------------
const phoneCtx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
});
const phone = await phoneCtx.newPage();
phone.on("pageerror", (e) => console.log("  [customer page error]", e.message));
await phone.goto(link, { waitUntil: "networkidle" });
const body = await phone.locator("body").innerText();
check("customer sees the edited title", body.includes("Maldives honeymoon, overwater villa"));
check("customer no longer sees the deleted update", !body.includes("this update is a mistake"));
const heroSrc = await phone.locator("header img").first().getAttribute("src");
check(
  "hero shows the uploaded cover (signed URL)",
  Boolean(heroSrc?.includes("/object/sign/trip-media/")),
);
const dayCardImg = await phone.getByRole("tab").first().locator("img").getAttribute("src");
check(
  "day card shows the day photo (signed URL)",
  Boolean(dayCardImg?.includes("/object/sign/trip-media/")),
);
check(
  "journey tracker shows all four phases",
  ["Booked", "Transfer", "Your trip", "Home"].every((w) => body.includes(w)),
);
await phone.getByRole("button", { name: /Show all 13 stages/ }).click();
check(
  "every stage can be listed",
  (await phone.locator("body").innerText()).includes("Trip complete — thank you"),
);

const pdfLink = phone.getByRole("link", { name: /Download PDF/ });
const customerPdfHref = await pdfLink.getAttribute("href");
const customerPdf = await phone.request.get(`${BASE}${customerPdfHref}`);
const cBytes = await customerPdf.body();
check(
  "customer can download the invoice PDF",
  customerPdf.status() === 200 &&
    cBytes.subarray(0, 5).toString() === "%PDF-" &&
    (customerPdf.headers()["content-disposition"] ?? "").includes(invNumber),
  customerPdf.headers()["content-disposition"],
);
const wrong = await phone.request.get(`${BASE}${customerPdfHref.replace(token, "0".repeat(48))}`);
check(
  "the same invoice under a wrong link is refused",
  wrong.status() === 404,
  `HTTP ${wrong.status()}`,
);

await phone.screenshot({ path: "scripts/__shot-customer.png", fullPage: true });

// ---- drivers: create, update, delete ------------------------------------------
await page.goto(`${BASE}/admin/drivers`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: "+ Add driver" }).click();
const driverName = `DEMO Driver ${Date.now().toString().slice(-4)}`;
await page.getByLabel("Full name *").fill(driverName);
await page.getByLabel("Vehicle").fill("Silver Toyota Hiace");
await page.getByLabel("Plate number").fill("dxb   12345");
await page.locator('label:has-text("Upload photo") input[type="file"]').setInputFiles({
  name: "driver.png",
  mimeType: "image/png",
  buffer: PNG,
});
await page.locator("label", { hasText: "Change photo" }).waitFor({ timeout: 60000 });
await page.getByRole("button", { name: "Add driver" }).click();
const tile = page.locator("article", { hasText: driverName });
await tile.waitFor({ timeout: 45000 });
check("driver created, plate normalised", (await tile.innerText()).includes("DXB 12345"));
check(
  "driver photo shows",
  Boolean(
    (await tile.locator("img").getAttribute("src"))?.includes("/object/sign/trip-media/drivers/"),
  ),
);
await page.screenshot({ path: "scripts/__shot-drivers.png", fullPage: true });

await tile.getByRole("button", { name: "Edit" }).click();
await page.getByLabel("Plate number").fill("DXB 99999");
await page.getByRole("button", { name: "Save driver" }).click();
await page.locator("article", { hasText: "DXB 99999" }).waitFor({ timeout: 45000 });
check("driver updated", true);

const driverPhotosBefore = await listFolder("trip-media", "drivers/");
await page
  .locator("article", { hasText: driverName })
  .getByRole("button", { name: "Delete" })
  .click();
await page
  .locator("article", { hasText: driverName })
  .waitFor({ state: "detached", timeout: 45000 });
const driverPhotosAfter = await listFolder("trip-media", "drivers/");
check(
  "driver deleted with their photo",
  driverPhotosAfter.length === driverPhotosBefore.length - 1,
  `${driverPhotosBefore.length} → ${driverPhotosAfter.length}`,
);

// ---- delete the whole trip ------------------------------------------------------
const filesBefore = (await listFolder("trip-media", `${tripId}/`)).length;
check("trip has files in storage before delete", filesBefore >= 2, `${filesBefore} files`);
await page.goto(`${BASE}/admin/trips/${tripId}`, { waitUntil: "networkidle" });
await page.screenshot({ path: "scripts/__shot-editor.png" });
await page.getByRole("button", { name: /Trip details/ }).click();
promptAnswer = code;
await page.getByRole("button", { name: "Delete trip permanently" }).click();
await page.waitForURL((u) => new URL(u).pathname === "/admin", { timeout: 45000 });
const filesAfter =
  (await listFolder("trip-media", `${tripId}/`)).length +
  (await listFolder("trip-docs", `${tripId}/`)).length;
check("deleting the trip removed every file from storage", filesAfter === 0, `${filesAfter} left`);
const gone = await phone.goto(link, { waitUntil: "domcontentloaded" });
check(
  "the deleted trip's link no longer works",
  (await phone.locator("body").innerText()).includes("find this trip"),
  `HTTP ${gone?.status()}`,
);
check(
  "the deleted trip is gone from the dashboard",
  (await page.locator("article", { hasText: customer }).count()) === 0,
);

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
