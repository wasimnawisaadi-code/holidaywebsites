import assert from "node:assert/strict";
import { generateKeyPairSync, verify } from "node:crypto";
import { readFileSync } from "node:fs";
import ts from "typescript";

// Isolated adapter test: generated credentials and mocked provider responses.
const source = ts.transpileModule(readFileSync("src/lib/vision-ocr.ts", "utf8"), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText;
const { visionText } = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
);
const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const original = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const originalFetch = globalThis.fetch;
process.env.GOOGLE_SERVICE_ACCOUNT_JSON = JSON.stringify({
  client_email: "test@example.invalid",
  private_key: privateKey.export({ type: "pkcs8", format: "pem" }),
});
let mode = "image";
let calls = 0;
globalThis.fetch = async (url, init) => {
  calls++;
  if (url === "https://oauth2.googleapis.com/token") {
    const assertion = init.body.get("assertion");
    const [header, payload, signature] = assertion.split(".");
    assert.ok(
      verify(
        "RSA-SHA256",
        Buffer.from(`${header}.${payload}`),
        publicKey,
        Buffer.from(signature, "base64url"),
      ),
    );
    const claims = JSON.parse(Buffer.from(payload, "base64url"));
    assert.equal(claims.scope, "https://www.googleapis.com/auth/cloud-vision");
    assert.equal(claims.exp - claims.iat, 3600);
    return Response.json({ access_token: "test-token" });
  }
  assert.equal(init.headers.Authorization, "Bearer test-token");
  const body = JSON.parse(init.body);
  assert.equal(body.requests[0].features[0].type, "DOCUMENT_TEXT_DETECTION");
  if (mode === "image") {
    assert.equal(url, "https://vision.googleapis.com/v1/images:annotate");
    return Response.json({ responses: [{ fullTextAnnotation: { text: "FZ 331\nDXB 08:15" } }] });
  }
  assert.equal(url, "https://vision.googleapis.com/v1/files:annotate");
  assert.equal(body.requests[0].inputConfig.mimeType, "application/pdf");
  return Response.json({
    responses: [
      {
        responses:
          mode === "error"
            ? [{ error: { code: 3 } }]
            : [
                { fullTextAnnotation: { text: "Page one" } },
                { fullTextAnnotation: { text: "Page two" } },
              ],
      },
    ],
  });
};
try {
  assert.match(await visionText(new ArrayBuffer(8), "image/png"), /FZ 331/);
  mode = "pdf";
  assert.equal(await visionText(new ArrayBuffer(8), "application/pdf"), "Page one\n\nPage two");
  mode = "error";
  await assert.rejects(
    () => visionText(new ArrayBuffer(8), "application/pdf"),
    /pages could not be read/,
  );
  assert.equal(calls, 6);
  console.log(
    "PASS Vision JWT signature, scoped authentication, image OCR, ordered PDF pages and partial-page error handling",
  );
} finally {
  globalThis.fetch = originalFetch;
  if (original === undefined) delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  else process.env.GOOGLE_SERVICE_ACCOUNT_JSON = original;
}
