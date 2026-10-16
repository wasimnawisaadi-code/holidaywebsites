/** Server-only Google Cloud Vision adapter. Never import from a component. */
import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";

export async function visionText(bytes: ArrayBuffer, mime: string): Promise<string> {
  const json =
    process.env["GOOGLE_SERVICE_ACCOUNT_JSON"] ||
    (process.env["GOOGLE_APPLICATION_CREDENTIALS"]
      ? await readFile(process.env["GOOGLE_APPLICATION_CREDENTIALS"], "utf8")
      : "");
  const account = JSON.parse(json) as { client_email?: string; private_key?: string };
  if (!account.client_email || !account.private_key) throw new Error("Missing service account");
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({
    iss: account.client_email,
    scope: "https://www.googleapis.com/auth/cloud-vision",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })}`;
  const signature = createSign("RSA-SHA256")
    .update(unsigned)
    .sign(account.private_key, "base64url");
  const auth = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!auth.ok) throw new Error("Service account authentication failed");
  const token = (await auth.json()) as { access_token?: string };
  if (!token.access_token) throw new Error("No access token");
  const content = Buffer.from(bytes).toString("base64");
  const pdf = mime === "application/pdf";
  const request = pdf
    ? { inputConfig: { content, mimeType: mime }, features: [{ type: "DOCUMENT_TEXT_DETECTION" }] }
    : { image: { content }, features: [{ type: "DOCUMENT_TEXT_DETECTION" }] };
  const response = await fetch(
    `https://vision.googleapis.com/v1/${pdf ? "files" : "images"}:annotate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requests: [request] }),
      signal: AbortSignal.timeout(45_000),
    },
  );
  if (!response.ok) throw new Error("Vision request failed");
  type Annotation = {
    fullTextAnnotation?: { text?: string };
    error?: unknown;
    responses?: Annotation[];
  };
  const result = (await response.json()) as { responses?: Annotation[] };
  const outer = result.responses?.[0];
  if (!outer || outer.error) throw new Error("Vision could not read this file");
  const pages = pdf ? (outer.responses ?? []) : [outer];
  if (pages.some((page) => page.error)) throw new Error("One or more pages could not be read");
  return pages
    .map((page) => page.fullTextAnnotation?.text ?? "")
    .join("\n\n")
    .slice(0, 24000);
}
