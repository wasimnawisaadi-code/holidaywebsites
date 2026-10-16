/** Real component checks with synthetic photos and mocked storage. No account access required. */
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixture = await fs.mkdtemp(path.join(os.tmpdir(), "nawi-photo-check-"));
const component = (name) =>
  JSON.stringify(path.join(root, "src/components", name).replaceAll("\\", "/"));
const html = (name) => `<div id="root"></div><script type="module" src="/${name}.jsx"></script>`;
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jrZkAAAAASUVORK5CYII=",
  "base64",
);
const photo = (name) => ({ name, mimeType: "image/png", buffer: png });

await fs.writeFile(path.join(fixture, "photos.html"), html("photos"));
await fs.writeFile(
  path.join(fixture, "photos.jsx"),
  `
import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {PhotoManager} from ${component("PhotoManager.tsx")};
window.uploaded=[]; window.busyStates=[]; let retried=false;
function App(){
  const [paths,setPaths]=useState([]);
  return <><PhotoManager paths={paths} urls={{}} disabled={false}
    onChange={p=>{window.paths=p;setPaths(p)}}
    onBusy={b=>window.busyStates.push(b)}
    onUpload={async(file,progress)=>{
      window.uploaded.push(file.name); progress?.(50);
      await new Promise(r=>setTimeout(r,60));
      if(file.name.startsWith('retry-')&&!retried){retried=true;throw Error('Connection dropped')}
      progress?.(100); return 'trip/'+file.name;
    }}/><output>{paths.length}</output></>;
}
createRoot(document.getElementById('root')).render(<App/>);
`,
);
await fs.writeFile(
  path.join(fixture, "mock.js"),
  `
export const saveDayGallery=async({data})=>{
  if(window.failSave)throw Error('Save failed');
  window.saved=data;return{ok:true};
};
export const uploadDirect=async(file,opts)=>{
  opts.onProgress?.(50);await new Promise(r=>setTimeout(r,50));
  return{ok:true,path:'trip/'+file.name};
};
`,
);
await fs.writeFile(path.join(fixture, "day.html"), html("day"));
await fs.writeFile(
  path.join(fixture, "day.jsx"),
  `
import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {DayPhotos} from ${component("DayPhotos.tsx")};
const makeDay=paths=>({id:'day',day_number:1,steps:paths.length?[{blocks:[{kind:'gallery',payload:{dayGallery:true,paths}}]}]:[]});
function App(){
  const[open,setOpen]=useState(true),[day,setDay]=useState(makeDay([]));
  window.refreshPaths=paths=>setDay(makeDay(paths));
  return <><button onClick={()=>setOpen(v=>!v)}>Toggle day</button><div hidden={!open}>
    <DayPhotos day={day} tripId="trip" onPendingChange={p=>window.pending=p}
      onSaved={async()=>{
        await new Promise(r=>setTimeout(r,60));
        if(window.refreshFails)throw Error('Refresh failed');
        setDay(makeDay(window.saved.paths)); window.saveComplete=true;
      }}/></div></>;
}
createRoot(document.getElementById('root')).render(<App/>);
`,
);

const server = await createServer({
  configFile: false,
  root: fixture,
  plugins: [react()],
  resolve: {
    alias: [
      { find: "react", replacement: path.join(root, "node_modules/react") },
      { find: "react-dom", replacement: path.join(root, "node_modules/react-dom") },
      { find: "@/lib/day-gallery", replacement: path.join(fixture, "mock.js") },
      { find: "@/lib/uploads", replacement: path.join(fixture, "mock.js") },
    ],
  },
  server: { host: "127.0.0.1", port: 4208, strictPort: true, fs: { allow: [fixture, root] } },
});
let browser;
try {
  await server.listen();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 850 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("http://127.0.0.1:4208/photos.html");
  await page
    .locator('input[type="file"]')
    .setInputFiles([photo("same.png"), photo("retry.png"), photo("same.png"), photo("last.png")]);
  await page.waitForFunction(() => document.querySelector("output")?.textContent === "3");
  await page.getByRole("button", { name: "Retry failed photos" }).waitFor();
  assert.match(await page.locator("body").innerText(), /retry.png: Connection dropped/);
  assert.equal(await page.locator("img").count(), 3);
  await page.getByRole("button", { name: "Retry failed photos" }).click();
  await page.waitForFunction(
    () =>
      document.querySelector("output")?.textContent === "4" &&
      !document.querySelector('[aria-busy="true"]'),
  );
  const state = await page.evaluate(() => ({
    paths: window.paths,
    uploaded: window.uploaded,
    busy: window.busyStates,
  }));
  assert.equal(new Set(state.uploaded).size, 5);
  assert.deepEqual(state.busy, [true, false, true, false]);
  await page.getByRole("button", { name: "Make photo 4 the gallery cover" }).click();
  assert.equal((await page.evaluate(() => window.paths))[0], state.paths[3]);
  await page.getByRole("button", { name: "Move photo 1 later" }).click();
  assert.equal((await page.evaluate(() => window.paths))[1], state.paths[3]);
  await page.getByRole("button", { name: "Remove photo 2" }).click();
  assert.equal(await page.locator("img").count(), 3);
  await page
    .locator('input[type="file"]')
    .setInputFiles([{ name: "bad.heic", mimeType: "image/heic", buffer: png }, photo("good.png")]);
  await page.waitForFunction(() => document.querySelector("output")?.textContent === "4");
  await page.getByRole("button", { name: "Retry failed photos" }).waitFor();
  assert.match(await page.locator("body").innerText(), /bad.heic: Use a non-empty/);
  await page
    .locator('input[type="file"]')
    .setInputFiles(Array.from({ length: 17 }, (_, i) => photo(`more${i}.png`)));
  assert.match(await page.locator("body").innerText(), /There is room for 16 more photos/);
  assert.equal((await page.evaluate(() => window.paths)).length, 4);
  console.log(
    "PASS: bulk upload, partial failure, retry, unique filenames, cover/order/removal, validation and collection limit",
  );

  await page.goto("http://127.0.0.1:4208/day.html");
  const leaveWarning = () =>
    page.evaluate(() => {
      const event = new Event("beforeunload", { cancelable: true });
      dispatchEvent(event);
      return event.defaultPrevented;
    });
  await page.locator('input[type="file"]').setInputFiles([photo("day.png")]);
  await page.waitForFunction(
    () => window.pending === true && !document.querySelector('[aria-busy="true"]'),
  );
  assert.equal(await leaveWarning(), true);
  await page.evaluate(() => window.refreshPaths(["trip/external.png"]));
  assert.equal(await page.locator("img").count(), 1);
  await page.getByRole("button", { name: "Toggle day" }).click();
  await page.getByRole("button", { name: "Toggle day" }).click();
  assert.equal(await page.locator("img").count(), 1);
  await page.getByRole("button", { name: "Save day photos", exact: true }).click();
  await page.waitForFunction(() => window.saveComplete && window.pending === false);
  assert.equal((await page.evaluate(() => window.saved.paths)).length, 1);
  assert.match((await page.evaluate(() => window.saved.paths))[0], /day-/);
  assert.equal(await leaveWarning(), false);
  await page.evaluate(() => window.refreshPaths(["trip/refreshed.png"]));
  await page.waitForFunction(() => !document.querySelector("img"));
  assert.match(await page.locator("body").innerText(), /Photo 1 · saved/);
  await page.locator('input[type="file"]').setInputFiles([photo("second.png")]);
  await page.waitForFunction(
    () => window.pending === true && !document.querySelector('[aria-busy="true"]'),
  );
  await page.evaluate(() => {
    window.refreshFails = true;
    window.refreshPaths(["trip/stale-while-editing.png"]);
  });
  await page.getByRole("button", { name: "Save day photos", exact: true }).click();
  await page.waitForFunction(() => window.pending === false);
  assert.match(await page.locator("body").innerText(), /Day photos saved. Refresh this page/);
  assert.match(await page.locator("body").innerText(), /Photo collection · 2 \/ 20/);
  assert.equal((await page.evaluate(() => window.saved.paths)).length, 2);
  await page.getByRole("button", { name: "Remove photo 2" }).click();
  await page.evaluate(() => {
    window.failSave = true;
  });
  await page.getByRole("button", { name: "Save day photos", exact: true }).click();
  await page
    .getByText("Could not save. Your selected photos are still here; please retry.")
    .waitFor();
  assert.equal(await leaveWarning(), true);
  assert.match(await page.locator("body").innerText(), /Photo collection · 1 \/ 20/);
  await page.evaluate(() => {
    window.failSave = false;
    window.refreshFails = false;
  });
  await page.getByRole("button", { name: "Save day photos", exact: true }).click();
  await page.waitForFunction(() => window.pending === false);
  assert.equal((await page.evaluate(() => window.saved.paths)).length, 1);
  assert.deepEqual(errors, []);
  console.log(
    "PASS: unsaved state survives collapse and loader refresh, explicit save, clean refresh sync, reload warning, saved state retained when refresh fails; no browser errors",
  );
} finally {
  await browser?.close();
  await server.close();
  if (
    path.dirname(fixture) === path.resolve(os.tmpdir()) &&
    path.basename(fixture).startsWith("nawi-photo-check-")
  ) {
    await fs.rm(fixture, { recursive: true, force: true });
  }
}
