/** Local browser regressions for homepage media. Usage: node scripts/verify-media-performance.mjs [baseUrl] */
import assert from "node:assert/strict";
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:5199";
const origin = new URL(base).origin;
assert.ok(
  ["localhost", "127.0.0.1", "[::1]"].includes(new URL(base).hostname),
  "Run media regressions against a local server only",
);
const stillPath = "/frames/journey/mobile/f_0001.webp";
const caption = "Book once. We arrange every step of it.";
const browser = await chromium.launch();

async function openCase({
  mobile = false,
  reducedMotion = "no-preference",
  connection,
  failImage = false,
} = {}) {
  const context = await browser.newContext({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    reducedMotion,
    serviceWorkers: "block",
  });
  // Block analytics, third-party requests and all writes during verification.
  await context.route("**/*", (route) => {
    const request = route.request();
    if (new URL(request.url()).origin !== origin || !["GET", "HEAD"].includes(request.method())) {
      return route.abort("blockedbyclient");
    }
    return route.continue();
  });
  if (failImage) {
    await context.route(`${origin}${stillPath}`, (route) =>
      route.fulfill({
        status: 503,
        contentType: "text/plain",
        body: "Image temporarily unavailable",
      }),
    );
  }
  await context.addInitScript(
    (network) => {
      // Avoid inheriting Chromium's estimate of the development connection.
      Object.defineProperty(navigator, "connection", { configurable: true, value: network });
      localStorage.setItem("ns-offer-seen", "1");
    },
    connection ?? { effectiveType: "4g", saveData: false },
  );
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  const requests = [];
  const errors = [];
  page.on("request", (request) => requests.push(new URL(request.url()).pathname));
  page.on("pageerror", (error) => errors.push(error.message));
  const response = await page.goto(base, { waitUntil: "load" });
  assert.equal(response?.status(), 200, "Homepage should load successfully");
  return { context, page, requests, errors };
}

async function assertStaticJourney({ page, requests }, { failedImage = false } = {}) {
  const section = page.locator("section").filter({ has: page.getByText(caption, { exact: true }) });
  assert.equal(await section.count(), 1, "The journey caption should identify one section");
  await section.scrollIntoViewIfNeeded();
  const image = section.locator("img");
  assert.equal(await image.count(), 1, "The journey should contain exactly one image");
  assert.equal(await image.getAttribute("src"), stillPath);
  await page.waitForFunction(
    ({ path, failed }) => {
      const image = document.querySelector(`img[src="${path}"]`);
      return (
        image instanceof HTMLImageElement &&
        image.complete &&
        (failed ? image.naturalWidth === 0 : image.naturalWidth > 0)
      );
    },
    { path: stillPath, failed: failedImage },
  );
  if (!failedImage) await image.evaluate((element) => element.decode());
  assert.equal(await page.locator("canvas").count(), 0, "The homepage should not contain a canvas");
  assert.equal(await page.getByText("Loading the journey", { exact: true }).count(), 0);
  assert.deepEqual(
    requests.filter((path) => path.startsWith("/frames/journey/")),
    [stillPath],
    "Only one still image should be requested, with no manifest or frame sequence",
  );
  const layout = await section.evaluate((element) => ({
    height: element.getBoundingClientRect().height,
    viewport: window.innerHeight,
    position: getComputedStyle(element).position,
    stickyChildren: [...element.querySelectorAll("*")].some((child) =>
      ["sticky", "fixed"].includes(getComputedStyle(child).position),
    ),
  }));
  assert.ok(
    layout.height >= 420 && layout.height <= Math.max(420, layout.viewport * 1.2),
    `The journey should occupy normal page height, got ${layout.height}px`,
  );
  assert.ok(
    !["sticky", "fixed"].includes(layout.position) && !layout.stickyChildren,
    "The journey should scroll normally without pinning content",
  );
  assert.ok(await section.getByText(caption, { exact: true }).isVisible());
  const cta = section.getByRole("link", { name: "Browse holiday packages", exact: true });
  assert.equal(await cta.getAttribute("href"), "/holidays");
  await cta.click({ trial: true });
  return cta;
}

try {
  for (const mobile of [false, true]) {
    const state = await openCase({ mobile });
    const { context, page, requests, errors } = state;
    try {
      await page.waitForFunction(() =>
        [...document.querySelectorAll("video")].some(
          (video) => !video.paused && video.currentTime > 0.1,
        ),
      );
      await assertStaticJourney(state);
      await page.waitForFunction(() =>
        [...document.querySelectorAll("video")].every((video) => video.paused),
      );
      const pausedTimes = await page
        .locator("video")
        .evaluateAll((videos) => videos.map((video) => video.currentTime));
      await page.waitForTimeout(250);
      assert.ok(
        await page
          .locator("video")
          .evaluateAll(
            (videos, times) =>
              videos.every(
                (video, i) => video.paused && Math.abs(video.currentTime - times[i]) < 0.05,
              ),
            pausedTimes,
          ),
        "Hero video must remain paused while the journey is visible",
      );
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await page.waitForFunction(
        (times) =>
          [...document.querySelectorAll("video")].some(
            (video, i) => !video.paused && video.currentTime > times[i] + 0.1,
          ),
        pausedTimes,
      );
      assert.equal(
        await page
          .locator("video")
          .evaluateAll((videos) => videos.filter((video) => !video.paused).length),
        1,
        "Only the visible hero clip should play",
      );
      assert.deepEqual(
        requests.filter((path) => path.startsWith("/frames/journey/")),
        [stillPath],
      );
      assert.deepEqual(errors, [], "No uncaught browser errors");
      console.log(
        `PASS ${mobile ? "mobile" : "desktop"}: one decoded still, normal height, working CTA; hero pauses and resumes`,
      );
    } finally {
      await context.close();
    }
  }

  for (const [label, options] of [
    ["reduced motion", { reducedMotion: "reduce" }],
    ["Save-Data", { connection: { effectiveType: "4g", saveData: true } }],
    ["3G", { connection: { effectiveType: "3g", saveData: false } }],
  ]) {
    const state = await openCase(options);
    const { context, page, requests, errors } = state;
    try {
      await assertStaticJourney(state);
      // Cover the hero's maximum delayed-start timeout as well as initial paint.
      await page.waitForTimeout(2800);
      assert.ok(!requests.some((path) => /\.mp4$/.test(path)), `${label} must skip video`);
      assert.deepEqual(
        requests.filter((path) => path.startsWith("/frames/journey/")),
        [stillPath],
      );
      assert.ok(
        await page
          .locator("video")
          .evaluateAll((videos) =>
            videos.every((video) => !video.getAttribute("src") && video.paused),
          ),
      );
      assert.deepEqual(errors, [], "No uncaught browser errors");
      console.log(`PASS ${label}: still image and CTA work without video or frame sequence`);
    } finally {
      await context.close();
    }
  }

  const failed = await openCase({ mobile: true, failImage: true });
  try {
    const cta = await assertStaticJourney(failed, { failedImage: true });
    await cta.click();
    await failed.page.waitForURL(`${origin}/holidays`);
    assert.deepEqual(
      failed.errors,
      [],
      "Image failure must not break navigation or raise page errors",
    );
    console.log("PASS failed still image: caption remains visible and CTA navigates to holidays");
  } finally {
    await failed.context.close();
  }
} finally {
  await browser.close();
}
