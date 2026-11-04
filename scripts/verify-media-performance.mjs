/** Local browser regressions for homepage media. Usage: node scripts/verify-media-performance.mjs [baseUrl] */
import assert from "node:assert/strict";
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:5199";
const origin = new URL(base).origin;
assert.ok(
  ["localhost", "127.0.0.1", "[::1]"].includes(new URL(base).hostname),
  "Run media regressions against a local server only",
);
const framePattern = /\/frames\/journey\/.*\.webp$/;
const manifestPath = "/frames/journey/manifest.json";
const fallbackSelector = 'img[src="/frames/journey/mobile/f_0001.webp"]';
const browser = await chromium.launch();

async function openCase({
  mobile = false,
  reducedMotion = "no-preference",
  connection,
  manifest,
} = {}) {
  const context = await browser.newContext({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    reducedMotion,
    serviceWorkers: "block",
  });
  // Prevent analytics or other third-party requests, including sendBeacon.
  // Blocking local writes also keeps this verification read-only.
  await context.route("**/*", (route) => {
    const request = route.request();
    if (new URL(request.url()).origin !== origin || !["GET", "HEAD"].includes(request.method())) {
      return route.abort("blockedbyclient");
    }
    return route.continue();
  });
  if (manifest) {
    await context.route(`${origin}${manifestPath}`, (route) => route.fulfill(manifest));
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
  const completedFrames = new Set();
  const errors = [];
  page.on("request", (request) => requests.push(new URL(request.url()).pathname));
  page.on("requestfinished", (request) => {
    const pathname = new URL(request.url()).pathname;
    if (framePattern.test(pathname)) completedFrames.add(pathname);
  });
  page.on("pageerror", (error) => errors.push(error.message));
  const response = await page.goto(base, { waitUntil: "load" });
  assert.equal(response?.status(), 200, "Homepage should load successfully");
  return { context, page, requests, completedFrames, errors };
}

async function waitForFrames(page, completedFrames, expected) {
  const deadline = Date.now() + 30000;
  while (completedFrames.size < expected && Date.now() < deadline) {
    await page.waitForTimeout(100);
  }
  assert.equal(completedFrames.size, expected, "All expected film frames should finish loading");
}

async function scrollToFilm(page) {
  await page
    .locator("section")
    .filter({ has: page.locator("canvas") })
    .evaluate((section) => {
      window.scrollTo({
        top: window.scrollY + section.getBoundingClientRect().top + window.innerHeight,
        behavior: "instant",
      });
    });
}

async function assertStaticFallback(page) {
  await page.locator(fallbackSelector).waitFor({ state: "attached" });
  await page.locator(fallbackSelector).scrollIntoViewIfNeeded();
  await page.waitForFunction((selector) => {
    const image = document.querySelector(selector);
    return image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0;
  }, fallbackSelector);
  assert.equal(
    await page.locator("canvas").count(),
    0,
    "Fallback should replace the animated canvas",
  );
  assert.equal(await page.getByText("Loading the journey", { exact: true }).count(), 0);
}

try {
  for (const mobile of [false, true]) {
    const { context, page, requests, completedFrames, errors } = await openCase({ mobile });
    try {
      // Real playback verifies hydration and delayed startup before checking
      // that the film has not loaded; a static SSR page cannot pass this.
      await page.waitForFunction(() =>
        [...document.querySelectorAll("video")].some(
          (video) => !video.paused && video.currentTime > 0.1,
        ),
      );
      assert.ok(
        !requests.some((path) => path.startsWith("/frames/journey/")),
        "Film must not download before scrolling",
      );

      await scrollToFilm(page);
      await page.waitForFunction(() =>
        [...document.querySelectorAll("video")].every((video) => video.paused),
      );
      const pausedTimes = await page
        .locator("video")
        .evaluateAll((videos) => videos.map((video) => video.currentTime));
      const expected = mobile ? 30 : 60;
      await waitForFrames(page, completedFrames, expected);
      await page.waitForFunction(() => {
        const canvas = document.querySelector("canvas");
        const ctx = canvas?.getContext("2d");
        if (!ctx || !canvas.width || !canvas.height) return false;
        // An opaque, undrawn canvas is black. Sample actual decoded pixels.
        let coloured = 0;
        for (let y = 1; y < 8; y++) {
          for (let x = 1; x < 8; x++) {
            const pixel = ctx.getImageData(
              Math.floor((canvas.width * x) / 8),
              Math.floor((canvas.height * y) / 8),
              1,
              1,
            ).data;
            if (pixel[0] + pixel[1] + pixel[2] > 30) coloured++;
          }
        }
        return coloured > 10;
      });
      assert.equal(await page.getByText("Loading the journey", { exact: true }).count(), 0);
      const requestedFrames = new Set(requests.filter((path) => framePattern.test(path)));
      assert.equal(requestedFrames.size, expected, "Film should stay within its request budget");
      assert.ok(
        [...requestedFrames].every((path) => path.includes("/mobile/")),
        "Both viewports should use the smaller frame assets",
      );
      const stillPaused = await page
        .locator("video")
        .evaluateAll((videos) =>
          videos.map((video) => ({ paused: video.paused, time: video.currentTime })),
        );
      assert.ok(
        stillPaused.every(
          (video, i) => video.paused && Math.abs(video.time - pausedTimes[i]) < 0.05,
        ),
        "Hero video must remain paused while the film loads and paints",
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
      assert.deepEqual(errors, [], "No uncaught browser errors");
      console.log(
        `PASS ${mobile ? "mobile" : "desktop"}: deferred ${expected} small frames paint; hero pauses and resumes`,
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
    const { context, page, requests, errors } = await openCase(options);
    try {
      await assertStaticFallback(page);
      // Cover the hero's maximum delayed-start timeout, catching footage that
      // might otherwise start after the static fallback initially appears.
      await page.waitForTimeout(2800);
      assert.ok(
        !requests.some((path) => /\.mp4$/.test(path) || path === manifestPath),
        `${label} must skip video and the frame manifest`,
      );
      assert.ok(
        requests
          .filter((path) => framePattern.test(path))
          .every((path) => path === "/frames/journey/mobile/f_0001.webp"),
        "Only the static fallback frame should load",
      );
      assert.ok(
        await page
          .locator("video")
          .evaluateAll((videos) =>
            videos.every((video) => !video.getAttribute("src") && video.paused),
          ),
      );
      assert.deepEqual(errors, [], "No uncaught browser errors");
      console.log(`PASS ${label}: static image loads without video or frame sequence`);
    } finally {
      await context.close();
    }
  }

  for (const [label, manifest] of [
    ["failed manifest", { status: 503, contentType: "application/json", body: "{}" }],
    ["invalid JSON manifest", { status: 200, contentType: "application/json", body: "{" }],
    [
      "incomplete manifest",
      { status: 200, contentType: "application/json", body: '{"count":120,"pad":4}' },
    ],
  ]) {
    const { context, page, requests, errors } = await openCase({ manifest });
    try {
      await scrollToFilm(page);
      await assertStaticFallback(page);
      assert.equal(requests.filter((path) => path === manifestPath).length, 1);
      assert.deepEqual(errors, [], "Manifest failure must not cause an uncaught browser error");
      console.log(`PASS ${label}: loaded static fallback with no browser errors`);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
