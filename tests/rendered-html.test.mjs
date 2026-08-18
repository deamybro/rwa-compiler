import assert from "node:assert/strict";
import test from "node:test";

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
const { default: worker } = await import(workerUrl.href);

function request(path, accept = "text/html") {
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders every required product route", async () => {
  const routes = ["/", "/terminal", "/asset/NVDAx", "/compiler", "/demo", "/developers", "/about"];
  for (const route of routes) {
    const response = await request(route);
    assert.equal(response.status, 200, route);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i, route);
    const html = await response.text();
    assert.match(html, /RWA Compiler/i, route);
    assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i, route);
  }
});

test("health API exposes honest provider state", async () => {
  const response = await request("/api/health", "application/json");
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.service, "rwa-compiler");
  assert.equal(typeof body.aiConfigured, "boolean");
});

test("detail metadata is asset-specific and does not inherit the sitewide OG image", async () => {
  const response = await request("/asset/NVDAx");
  const html = await response.text();
  assert.match(html, /NVDAx RWA Passport/i);
  assert.match(html, /Live NVDAx identity/i);
  assert.doesNotMatch(html, /og\.png/i);
});
