import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixture = await fs.mkdtemp(path.join(os.tmpdir(), "editor-recovery-"));
const component = (name) =>
  JSON.stringify(path.join(root, "src/components", name).replaceAll("\\", "/"));
await fs.writeFile(
  path.join(fixture, "index.html"),
  '<div id="root"></div><script type="module" src="/app.jsx"></script>',
);
await fs.writeFile(
  path.join(fixture, "mock.js"),
  `
export const guessType = name => name.endsWith('.png') ? 'image/png' : '';
export const uploadDirect = async file => { window.calls++; await new Promise(r=>{if(window.holdUploads)window.releases.push(r);else setTimeout(r,150)}); return {ok:true,path:'trip/'+file.name}; };
export const importPhotoFromLink = async () => { window.calls++; await new Promise(r=>setTimeout(r,150)); return {ok:false,reason:'Your sign-in expired. Sign in in another tab, then retry here. Your details are still here.'}; };
`,
);
await fs.writeFile(
  path.join(fixture, "app.jsx"),
  `
import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {SinglePhoto} from ${component("SinglePhoto.tsx")};
import {FormatTextarea} from ${component("FormatTextarea.tsx")};
import {TransferDriverFields} from ${component("TransferDriverFields.tsx")};
window.calls=0; window.busy=[];
window.releases=[]; window.transferBusy=[];
function App(){ const[p,setP]=useState(); const[v,setV]=useState({}); return <>
<SinglePhoto label="Driver photo" folder="trip" path={p} onChange={setP} onBusy={b=>window.busy.push(b)} />
<FormatTextarea name="description" aria-label="Instructions" defaultValue="1234567890" maxLength={10}/>
<div data-testid="transfer"><TransferDriverFields tripId="trip" values={v} set={patch=>setV(old=>({...old,...patch}))} onBusy={b=>window.transferBusy.push(b)}/></div>
</>; }
createRoot(document.getElementById('root')).render(<App/>);
`,
);
const server = await createServer({
  configFile: false,
  root: fixture,
  plugins: [react()],
  resolve: {
    alias: [
      { find: "react", replacement: path.dirname(require.resolve("react/package.json")) },
      { find: "react-dom", replacement: path.dirname(require.resolve("react-dom/package.json")) },
      { find: "@/lib/uploads", replacement: path.join(fixture, "mock.js") },
      { find: "@", replacement: path.join(root, "src") },
    ],
  },
  server: { host: "127.0.0.1", port: 0, fs: { allow: [fixture, path.resolve(root, "../..")] } },
});
let browser;
try {
  await server.listen();
  browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(server.resolvedUrls.local[0]);
  await page.getByRole("button", { name: "Bold", exact: true }).click();
  assert.equal(await page.getByLabel("Instructions").inputValue(), "1234567890");
  assert.match(await page.locator("body").innerText(), /formatting exceeds/);
  await page.getByLabel("Instructions").fill("Hi");
  await page.getByRole("button", { name: "Bold", exact: true }).click();
  assert.equal(await page.getByLabel("Instructions").inputValue(), "[b]Hi[/b]");
  console.log("PASS formatting respects the save limit and preserves text");
  await page
    .locator("input[type=file]")
    .first()
    .setInputFiles({
      name: "driver.png",
      mimeType: "",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jrZkAAAAASUVORK5CYII=",
        "base64",
      ),
    });
  await page.locator("img").waitFor();
  assert.equal(await page.evaluate(() => document.querySelector("img").complete), true);
  await page.getByRole("button", { name: "Remove", exact: true }).click();
  assert.equal(await page.locator("img").count(), 0);
  console.log("PASS photo without MIME type uploads, previews and removes");
  await page
    .getByLabel("Driver photo: paste a photo or link")
    .first()
    .evaluate((el) => {
      for (let i = 0; i < 2; i++) {
        const d = new DataTransfer();
        d.setData("text", "https://example.com/photo.png");
        el.dispatchEvent(new ClipboardEvent("paste", { bubbles: true, clipboardData: d }));
      }
    });
  await page.getByRole("link", { name: "Sign in in a new tab" }).waitFor();
  assert.equal(await page.evaluate(() => window.calls), 2);
  assert.deepEqual(await page.evaluate(() => window.busy), [true, false, true, false]);
  assert.deepEqual(errors, []);
  console.log("PASS duplicate paste blocked and expired session offers recovery");
  await page.evaluate(() => {
    window.holdUploads = true;
  });
  const files = page.getByTestId("transfer").locator("input[type=file]");
  const image = {
    name: "parallel.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jrZkAAAAASUVORK5CYII=",
      "base64",
    ),
  };
  await files.nth(0).setInputFiles(image);
  await files.nth(1).setInputFiles(image);
  await page.waitForFunction(() => window.releases.length === 2);
  await page.evaluate(() => window.releases[0]());
  await page.getByTestId("transfer").locator("img").waitFor();
  assert.deepEqual(await page.evaluate(() => window.transferBusy), [true]);
  await page.evaluate(() => window.releases[1]());
  await page.waitForFunction(() => window.transferBusy.length === 2);
  assert.deepEqual(await page.evaluate(() => window.transferBusy), [true, false]);
  console.log("PASS both photo uploads must finish before the form becomes ready");
} finally {
  await browser?.close();
  await server.close();
  await fs.rm(fixture, { recursive: true, force: true });
}
