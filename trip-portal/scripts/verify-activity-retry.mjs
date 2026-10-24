import assert from "node:assert/strict";
import fs from "node:fs/promises";
import ts from "typescript";

// Exercise the actual handler with isolated storage and session dependencies.
const source = await fs.readFile(new URL("../src/lib/quick-activity.ts", import.meta.url), "utf8");
let code = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
code = code
  .replace(/^import .* from "\.\/[^"\n]+";\r?\n/gm, "")
  .replace(/^import .* from "@tanstack\/react-start";\r?\n/gm, "");
code = code.replace('await import("./db")', "globalThis.__activityTest.db");
code = `const {createServerFn, requireSession, UUID, nightsBetween, isLatLng, TOUR_GUIDE_ROLE, makeRoomFor, mutationError}=globalThis.__activityTest;\n${code}`;
const tables = { trip_steps: [], trip_blocks: [] };
let signedIn = true,
  failBlock = true;
globalThis.__activityTest = {
  createServerFn: () => ({
    validator() {
      return this;
    },
    handler(fn) {
      return fn;
    },
  }),
  requireSession: async () => {
    if (!signedIn) throw Error("Not signed in.");
  },
  UUID: /^[0-9a-f-]{36}$/i,
  nightsBetween: () => 1,
  isLatLng: () => false,
  TOUR_GUIDE_ROLE: "Tour guide",
  makeRoomFor: async () => 1,
  mutationError: (e, fallback) =>
    e.message === "Not signed in." ? "Your sign-in expired." : fallback,
  db: {
    select: async (query) => {
      if (query.startsWith("trip_days?")) return [{ id: "day" }];
      const table = query.split("?")[0];
      const id = query.match(/[?&]id=eq\.([^&]+)/)?.[1];
      return (tables[table] ?? []).filter((row) => !id || row.id === id);
    },
    insert: async (table, row) => {
      if (table === "trip_blocks" && failBlock) {
        failBlock = false;
        throw Error("Simulated interrupted block write");
      }
      tables[table].push({ ...row });
    },
    update: async (table, filter, patch) => {
      const id = filter.match(/id=eq\.([^&]+)/)[1];
      Object.assign(
        tables[table].find((row) => row.id === id),
        patch,
      );
    },
  },
};
const { saveQuickActivity } = await import(
  `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`
);
const tripId = "11111111-1111-4111-8111-111111111111";
const draft = {
  tripId,
  dayId: "22222222-2222-4222-8222-222222222222",
  requestId: "33333333-3333-4333-8333-333333333333",
  kind: "transfer",
  title: "Airport pickup",
  time: "09:00",
  duration: "1 hour",
  location: "Airport",
  description: "Meet in arrivals",
  paths: [],
  fields: {
    driverName: "Test Driver",
    driverPhoto: `${tripId}/driver.png`,
    vehiclePhoto: `${tripId}/car.png`,
  },
};
const log = console.error;
console.error = () => {};
try {
  assert.equal((await saveQuickActivity({ data: draft })).ok, false);
  assert.equal(tables.trip_steps.length, 1);
  const saved = await saveQuickActivity({ data: draft });
  assert.equal(saved.ok, true);
  assert.equal(tables.trip_steps.length, 1);
  assert.equal(tables.trip_blocks.length, 1);
  assert.equal(tables.trip_blocks[0].payload.driverPhoto, draft.fields.driverPhoto);
  assert.equal(tables.trip_blocks[0].payload.vehiclePhoto, draft.fields.vehiclePhoto);
  assert.equal((await saveQuickActivity({ data: draft })).stepId, saved.stepId);
  assert.equal(tables.trip_blocks.length, 1);
  console.log(
    "PASS interrupted save retries without duplicate stops or missing driver/vehicle photos",
  );
  signedIn = false;
  const expired = await saveQuickActivity({ data: draft });
  assert.equal(expired.ok, false);
  assert.match(expired.reason, /sign-in expired/);
  assert.equal(tables.trip_steps.length, 1);
  console.log("PASS expired session returns an actionable failure without writes");
} finally {
  console.error = log;
  delete globalThis.__activityTest;
}
