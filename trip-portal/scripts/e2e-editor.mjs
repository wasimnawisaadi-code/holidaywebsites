/**
 * End-to-end test of the itinerary editor and invoices, through the real UI.
 *
 * Run after e2e-live.mjs, which creates the DEMO trip this one edits. Covers the
 * paths e2e-live does not: days, steps, blocks, the draft gate on a day, and the
 * invoice arithmetic — which is money, and so is checked to the fils against
 * what the customer is shown.
 *
 *     set -a; . ./.env.local; set +a
 *     node scripts/e2e-editor.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.PORTAL_BASE_URL || "http://localhost:4201";
const EMAIL = (process.env.TRIP_ADMIN_EMAILS || "").split(",")[0]?.trim();
const PASSWORD = process.env.ADMIN_PASSWORD;

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("  [page error]", e.message));
page.on("dialog", (d) => d.accept());

// Every request the admin makes, with its body size, so the upload section can
// prove where the bytes actually went.
const traffic = [];
page.on("request", (r) => {
  const body = r.postDataBuffer();
  traffic.push({ url: r.url(), method: r.method(), bytes: body ? body.length : 0 });
});

// ---- sign in and create a FRESH trip to edit --------------------------------
//
// Every run makes its own trip. The first version reused "the DEMO trip", which
// made the test depend on whatever the previous run left behind: a run that
// failed halfway had already added Day 1, so the next run looked for
// "+ Add day 1", found "+ Add day 2", and failed for a reason that had nothing
// to do with the code under test.
await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
await page.fill("#admin-email", EMAIL);
await page.fill("#admin-password", PASSWORD);
await page.getByRole("button", { name: "Sign in" }).click();
await page.getByRole("button", { name: "+ New trip" }).waitFor({ timeout: 20000 });

const customer = `DEMO — Ahmed Mohammed ${Date.now().toString().slice(-5)}`;
await page.getByRole("button", { name: "+ New trip" }).click();
await page.fill('input[name="customerName"]', customer);
await page.fill('input[name="phone"]', "+971500000000");
await page.fill('input[name="destination"]', "Dubai + Abu Dhabi");
await page.fill('input[name="title"]', "Five nights in the UAE");
await page.fill('input[name="startDate"]', "2026-09-28");
await page.fill('input[name="endDate"]', "2026-10-03");
await page.getByRole("button", { name: "Create trip & generate link" }).click();
await page.getByText(/Trip NST-\d{6}-\d{3} created/).waitFor({ timeout: 20000 });
await page.getByRole("button", { name: "Done" }).click();

const row = page.locator("article", { hasText: customer });
await row.waitFor({ timeout: 20000 });
await row.getByRole("button", { name: "Share link" }).click();
const link = await row.locator("input[readonly]").inputValue();
// Published up front, so the day-level draft gate below is tested on its own:
// the trip is visible, and only the unpublished day should be hidden.
await row.getByRole("button", { name: "Publish to customer" }).click();
// Waits for the outcome of each action throughout, never a fixed pause. A
// guessed duration made these tests pass or fail with the database's latency.
await page
  .locator("article", { hasText: customer })
  .getByRole("button", { name: "Unpublish" })
  .waitFor({ timeout: 45000 });
await page
  .locator("article", { hasText: customer })
  .getByRole("link", { name: "Edit itinerary" })
  .click();
await page.getByRole("button", { name: /\+ Add day 1/ }).waitFor({ timeout: 20000 });
check("itinerary editor opens for the trip", true);

// ---- add a day, UNPUBLISHED first ----------------------------------------
await page.getByRole("button", { name: /\+ Add day 1/ }).click();
await page.fill('input[name="title"]', "Arrival in Dubai");
await page.fill('input[name="date"]', "2026-09-28");
await page.fill('textarea[name="summary"]', "Land at DXB, meet your driver, check in and rest.");
// New days are shown by default now; untick to exercise the hidden-day gate.
await page.locator('input[name="published"]').first().uncheck();
await page.getByRole("button", { name: "Save day" }).click();
await page.getByText("Arrival in Dubai").first().waitFor({ timeout: 20000 });
check("day is saved", true);

// ---- add a step -----------------------------------------------------------
await page.getByRole("button", { name: /\+ Add step 1/ }).click();
await page.fill('input[name="title"]', "Meet your driver");
await page.fill('textarea[name="description"]', "After collecting your luggage, walk to Exit 2.");
await page.fill('input[name="timeLabel"]', "14:30");
await page.fill('input[name="locationName"]', "DXB Terminal 3, Exit 2");
await page.getByRole("button", { name: "Save step" }).click();
await page.getByText("Meet your driver").first().waitFor({ timeout: 20000 });
check("step is saved", true);

// ---- add a notice block ---------------------------------------------------
await page
  .getByRole("button", { name: /Notice/ })
  .first()
  .click();
const form = page.locator("div.rounded-lg.border-gold").first();
await form.getByLabel("Heading").fill("Keep your phone on");
await form.locator("textarea").first().fill("Your driver will WhatsApp you when he parks.");
await form.locator("select").first().selectOption("warning");
await form.getByRole("button", { name: "Save block" }).click();
await page.getByText("Keep your phone on").first().waitFor({ timeout: 20000 });
check("notice block is saved", true);

// ---- the day-level draft gate --------------------------------------------
// The trip is published but this day is not, so the customer must not see it.
const probe = await browser.newPage();
await probe.goto(link, { waitUntil: "networkidle" });
const beforePublish = await probe.locator("body").innerText();
check(
  "an unpublished DAY is invisible to the customer",
  !beforePublish.includes("Arrival in Dubai") && !beforePublish.includes("Keep your phone on"),
);
await probe.close();

// ---- publish the day ------------------------------------------------------
await page.getByRole("button", { name: "Edit day" }).first().click();
await page.locator('input[name="published"]').first().check();
await page.getByRole("button", { name: "Save day" }).click();
await page
  .locator("section", { hasText: "Arrival in Dubai" })
  .getByText(/^live$/i)
  .first()
  .waitFor({ timeout: 45000 });
check("day is published", true);

// ---- invoice --------------------------------------------------------------
await page.getByRole("button", { name: /^Invoices/ }).click();
await page.getByRole("button", { name: "+ New invoice" }).click();
const invHeader = page.getByText(/^NSI-\d{4}-T?\d+$/).first();
await invHeader.waitFor({ timeout: 45000 });
const invNumber = (await invHeader.innerText()).trim();
// A sequence number is all digits; the fallback carries a "T". Before that
// marker existed the two had the same shape and this check proved nothing.
check(
  "invoice number comes from the sequence, not the timestamp fallback",
  /^NSI-2026-\d{4,}$/.test(invNumber),
  invNumber,
);

// Two lines, chosen so float arithmetic would go wrong: 3 x 1499.99 is
// 4499.969999999999 in a double.
await page.getByRole("button", { name: "+ Add line item" }).click();
await page.fill('input[name="description"]', "Hotel, 5 nights, Downtown Dubai");
await page.fill('input[name="quantity"]', "3");
await page.fill('input[name="unitPrice"]', "1499.99");
await page.getByRole("button", { name: "Save item" }).click();
await page.getByText("Hotel, 5 nights, Downtown Dubai").waitFor({ timeout: 20000 });

await page.getByRole("button", { name: "+ Add line item" }).click();
await page.fill('input[name="description"]', "Airport transfers");
await page.fill('input[name="quantity"]', "2");
await page.fill('input[name="unitPrice"]', "150");
await page.getByRole("button", { name: "Save item" }).click();
await page.getByText("Airport transfers").waitFor({ timeout: 20000 });
check("both invoice line items are saved", true);

// The arithmetic, worked out by hand — an earlier version of this test had it
// wrong (it summed the lines to 4,699.97), which would have failed a correct
// app and invited "fixing" the code to match a bad expectation:
//
//   3 x 1,499.99 = 4,499.97      (a double makes this 4,499.969999999999)
//   2 x   150.00 =   300.00
//   subtotal     = 4,799.97
//   discount     =    99.97
//   total        = 4,700.00
//   paid         = 1,000.00
//   balance      = 3,700.00
await page.fill('input[name="discount"]', "99.97");
await page.fill('input[name="amountPaid"]', "1000");
await page.locator('input[name="published"]').last().check();
await page.getByRole("button", { name: "Save invoice" }).click();
const invoiceSection = page.locator("section", { hasText: invNumber }).first();
await invoiceSection.getByText(/visible to customer/i).waitFor({ timeout: 45000 });

const adminInvoice = await invoiceSection.innerText();
check("admin sums the line that traps a double (4,499.97)", adminInvoice.includes("4,499.97"));
check(
  "admin shows the total to the fils",
  adminInvoice.includes("4,700.00"),
  "expected AED 4,700.00",
);
check(
  "admin shows the balance due",
  adminInvoice.includes("3,700.00"),
  "expected AED 3,700.00 due",
);

// ---- uploads ---------------------------------------------------------------
//
// Files go from the browser straight to Supabase Storage on a signed ticket.
// The reason is Vercel's 4.5 MB limit on a function's request body: routed
// through a server function, almost every real video and many phone photos
// would fail in production — while working perfectly on a laptop, which has no
// such limit. This section proves the bytes bypass the function.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);
const PDF = Buffer.from(
  "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n" +
    "3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n",
);
// Larger than Vercel's 4.5 MB function limit, on purpose.
const BIG_VIDEO = Buffer.alloc(6 * 1024 * 1024, 7);

await page.getByRole("button", { name: /^Itinerary/ }).click();
const step = page.locator("li", { hasText: "Meet your driver" }).first();

// An image block
await step.getByRole("button", { name: /Image$/ }).click();
let blockForm = page.locator("div.rounded-lg.border-gold").first();
await blockForm.locator('input[type="file"]').first().setInputFiles({
  name: "Meeting Point, Exit 2.png",
  mimeType: "image/png",
  buffer: PNG,
});
await blockForm.getByText(/✓ .*meeting-point-exit-2\.png/).waitFor({ timeout: 60000 });
await blockForm.getByLabel("Caption").fill("Meet here, beside the Costa kiosk");
await blockForm.getByRole("button", { name: "Save block" }).click();
await page.getByText("Meet here, beside the Costa kiosk").first().waitFor({ timeout: 45000 });
check("photo uploads and its block is saved", true);
check(
  "uploaded filename was sanitised by the server",
  true,
  "spaces and comma → meeting-point-exit-2.png",
);

// A video block, deliberately larger than the serverless body limit
const before = traffic.length;
await step.getByRole("button", { name: /Video$/ }).click();
blockForm = page.locator("div.rounded-lg.border-gold").first();
await blockForm.locator('input[type="file"]').first().setInputFiles({
  name: "where-to-find-your-driver.mp4",
  mimeType: "video/mp4",
  buffer: BIG_VIDEO,
});
await blockForm.getByText(/✓ .*where-to-find-your-driver\.mp4/).waitFor({ timeout: 120000 });
const uploadTraffic = traffic.slice(before);
const directPut = uploadTraffic.find(
  (t) => t.method === "PUT" && /supabase\.co\/storage\/v1\/object\/upload\/sign\//.test(t.url),
);
const biggestServerFn = Math.max(
  0,
  ...uploadTraffic.filter((t) => t.url.includes("_serverFn")).map((t) => t.bytes),
);
// The size is read back from storage, not from the request. Playwright does not
// expose the body of a request sent from a File — the first version of this
// check read 0 bytes off a perfectly good 6 MB upload and failed. What landed
// in the bucket is the fact that matters anyway.
const videoObject = await (async () => {
  const id = new URL(page.url()).pathname.split("/").pop();
  const r = await fetch(`${process.env.SUPABASE_URL}/storage/v1/object/list/trip-media`, {
    method: "POST",
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefix: `${id}/`, limit: 100 }),
  });
  const list = r.ok ? await r.json() : [];
  return list.find((o) => o.name.endsWith("where-to-find-your-driver.mp4"));
})();
const storedBytes = videoObject?.metadata?.size ?? 0;
check(
  "a 6 MB video goes straight to storage",
  Boolean(directPut) && storedBytes === BIG_VIDEO.length,
  `PUT to supabase.co: ${directPut ? "yes" : "no"}; stored ${(storedBytes / 1048576).toFixed(1)} MB`,
);
check(
  "no server-function request carried the file",
  biggestServerFn < 64 * 1024,
  `largest server-function body: ${biggestServerFn} bytes`,
);
await blockForm.getByLabel("Label").fill("How to find your driver");
await blockForm.getByRole("button", { name: "Save block" }).click();
await page.getByText("How to find your driver").first().waitFor({ timeout: 45000 });

// A document
await page.getByRole("button", { name: /^Documents/ }).click();
await page.getByLabel(/Upload a document/).setInputFiles({
  name: "Hotel voucher - Downtown.pdf",
  mimeType: "application/pdf",
  buffer: PDF,
});
await page.getByText("Hotel voucher - Downtown.pdf").first().waitFor({ timeout: 60000 });
check("PDF document uploads and is recorded", true);

// A refused file type is explained before any bytes move
await page.getByLabel(/Upload a document/).setInputFiles({
  name: "notes.txt",
  mimeType: "text/plain",
  buffer: Buffer.from("not a document"),
});
await page
  .getByRole("alert")
  .filter({ hasText: /PDF or an image/ })
  .waitFor({ timeout: 30000 });
check("a disallowed file type is refused with a reason", true);

// ---- what the customer now sees -------------------------------------------
const cust = await browser.newContext({ viewport: { width: 390, height: 844 } });
const phone = await cust.newPage();
phone.on("pageerror", (e) => console.log("  [customer page error]", e.message));
await phone.goto(link, { waitUntil: "networkidle" });
const body = await phone.locator("body").innerText();

check("customer sees the published day", body.includes("Arrival in Dubai"));
check(
  "customer sees the step and its time",
  body.includes("Meet your driver") && body.includes("14:30"),
);
check("customer sees the step's location", body.includes("DXB Terminal 3, Exit 2"));
check("customer sees the notice block", body.includes("Keep your phone on"));
check("customer sees the invoice", body.includes(invNumber));
check("customer sees the line items", body.includes("Airport transfers"));
check("customer sees the subtotal to the fils", body.includes("4,799.97"));
check("customer's balance matches the admin to the fils", body.includes("3,700.00"));
check("customer sees a part-paid status", body.toLowerCase().includes("part paid"));
check("customer has a way to arrange payment", body.includes("Arrange payment"));

// The photo must actually load, not merely be referenced. Private bucket, so
// the src has to be a signed URL — and a signed URL that has expired or was
// minted for the wrong path renders as a broken image with no error anywhere.
const photo = phone.locator('img[alt="Meet here, beside the Costa kiosk"]');
const photoSrc = (await photo.count()) ? await photo.getAttribute("src") : null;
check(
  "customer's photo uses a signed storage URL",
  Boolean(photoSrc?.includes("/object/sign/trip-media/")),
);
const photoOk = photoSrc
  ? await fetch(photoSrc).then((r) => r.ok && r.headers.get("content-type")?.startsWith("image/"))
  : false;
check("customer's photo actually loads", Boolean(photoOk));
check(
  "photo has rendered pixels in the browser",
  photoSrc ? await photo.evaluate((img) => img.complete && img.naturalWidth > 0) : false,
);

const video = phone.locator("video");
const videoSrc = (await video.count()) ? await video.first().getAttribute("src") : null;
check("customer sees the driver video", Boolean(videoSrc?.includes("/object/sign/trip-media/")));
check("customer sees the video's label", body.includes("How to find your driver"));

const docLink = phone.getByRole("link", { name: /Hotel voucher - Downtown\.pdf/ });
const docHref = (await docLink.count()) ? await docLink.first().getAttribute("href") : null;
check(
  "customer sees the voucher in Documents",
  Boolean(docHref?.includes("/object/sign/trip-docs/")),
);
const docOk = docHref ? await fetch(docHref).then((r) => r.ok) : false;
check("customer's voucher link actually opens", Boolean(docOk));

// Signed links are scoped to one file: changing the path under a valid token
// must not open a different object.
if (docHref) {
  const tampered = docHref.replace(/trip-docs\/[^?]+/, "trip-docs/someone-else/voucher.pdf");
  const tamperedOk = await fetch(tampered).then((r) => r.ok);
  check("a signed link cannot be re-pointed at another file", !tamperedOk);
}

await phone.screenshot({ path: "scripts/__e2e-customer-full.png", fullPage: true });
await page.getByRole("button", { name: /^Edit history/ }).click();
await page.getByRole("heading", { name: "Change history" }).waitFor({ timeout: 45000 });
const activity = await page.locator("main").innerText();
check(
  "change history recorded the edits, via the database trigger",
  /insert\s+(days|steps|blocks|invoices)/i.test(activity),
);

// ---- deleting removes the file, not just the row ---------------------------
const tripId = new URL(page.url()).pathname.split("/").pop();
const SB = process.env.SUPABASE_URL;
const SK = process.env.SUPABASE_SERVICE_ROLE_KEY;
const listFolder = async (bucket) => {
  const r = await fetch(`${SB}/storage/v1/object/list/${bucket}`, {
    method: "POST",
    headers: { apikey: SK, Authorization: `Bearer ${SK}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prefix: `${tripId}/`, limit: 100 }),
  });
  return r.ok ? (await r.json()).map((o) => o.name) : [];
};

const mediaBefore = await listFolder("trip-media");
const docsBefore = await listFolder("trip-docs");
check(
  "uploads landed in the trip's own storage folder",
  mediaBefore.some((n) => n.endsWith("where-to-find-your-driver.mp4")) &&
    docsBefore.some((n) => n.endsWith(".pdf")),
  `media: ${mediaBefore.length}, docs: ${docsBefore.length}`,
);

// Delete the video block through the admin.
await page.getByRole("button", { name: /^Itinerary/ }).click();
const videoRow = page.locator("div.rounded-lg", { hasText: "How to find your driver" }).first();
await videoRow.getByRole("button", { name: "Delete block" }).click();
await page.getByText("How to find your driver").waitFor({ state: "detached", timeout: 45000 });

// Delete the voucher through the admin.
await page.getByRole("button", { name: /^Documents/ }).click();
await page
  .locator("div.rounded-lg", { hasText: "Hotel voucher - Downtown.pdf" })
  .last()
  .getByRole("button", { name: "Delete" })
  .click();
await page.getByText("Hotel voucher - Downtown.pdf").waitFor({ state: "detached", timeout: 45000 });

const mediaAfter = await listFolder("trip-media");
const docsAfter = await listFolder("trip-docs");
check(
  "deleting the video block removed the video file from storage",
  !mediaAfter.some((n) => n.endsWith("where-to-find-your-driver.mp4")),
);
check(
  "deleting the document removed the PDF from storage",
  !docsAfter.some((n) => n.endsWith(".pdf")),
);
check(
  "the photo that was not deleted is still there",
  mediaAfter.some((n) => n.endsWith("meeting-point-exit-2.png")),
);

// Test hygiene: remove whatever this run left in storage. The trip rows are
// cleared by the DEMO cleanup SQL; storage objects are not covered by it.
for (const [bucket, names] of [
  ["trip-media", mediaAfter],
  ["trip-docs", docsAfter],
]) {
  if (!names.length) continue;
  await fetch(`${SB}/storage/v1/object/${bucket}`, {
    method: "DELETE",
    headers: { apikey: SK, Authorization: `Bearer ${SK}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prefixes: names.map((n) => `${tripId}/${n}`) }),
  });
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
