import assert from "node:assert/strict";
import { toFunctionSelector } from "viem";

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("smoke", `${process.pid}-${Date.now()}`);
const { default: worker } = await import(workerUrl.href);
const bindings = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
const context = { waitUntil() {}, passThroughOnException() {} };

async function appRequest(path, init) {
  const response = await worker.fetch(new Request(`http://localhost${path}`, init), bindings, context);
  const body = await response.json();
  assert.equal(response.status, 200, `${path}: ${JSON.stringify(body)}`);
  return body;
}

async function rpc(url, method, params = []) {
  const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }) });
  assert.equal(response.status, 200, `${method} HTTP ${response.status}`);
  const body = await response.json();
  assert.equal(body.error, undefined, JSON.stringify(body.error));
  return body.result;
}

const live = await appRequest("/api/assets/NVDAx");
assert.equal(live.mode, "LIVE");
assert.equal(live.passport.asset.symbol, "NVDAx");
assert.equal(live.passport.deployment.network, "X_LAYER");
assert.match(live.passport.deployment.tokenAddress, /^0x[a-f0-9]{40}$/i);
assert.match(live.hash, /^0x[a-f0-9]{64}$/i);
assert.ok(live.passport.provenance.length >= 3);

const preflight = await appRequest("/api/preflight", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ asset: "NVDAx", action: "SWAP" }) });
assert.ok(["ALLOW", "WATCH", "PAUSE"].includes(preflight.status));
assert.match(preflight.passportHash, /^0x[a-f0-9]{64}$/i);

const mainnetChain = await rpc("https://rpc.xlayer.tech", "eth_chainId");
const testnetChain = await rpc("https://testrpc.xlayer.tech/terigon", "eth_chainId");
assert.equal(mainnetChain.toLowerCase(), "0xc4");
assert.equal(testnetChain.toLowerCase(), "0x7a0");

const code = await rpc("https://rpc.xlayer.tech", "eth_getCode", [live.passport.deployment.tokenAddress, "latest"]);
assert.notEqual(code, "0x", "Official NVDAx X Layer deployment has no bytecode");
const multiplierCall = await rpc("https://rpc.xlayer.tech", "eth_call", [{ to: live.passport.deployment.tokenAddress, data: toFunctionSelector("getCurrentMultiplier()") }, "latest"]);
assert.match(multiplierCall, /^0x(?:[a-f0-9]{64})+$/i, "getCurrentMultiplier returned malformed ABI data");

console.log(JSON.stringify({
  liveAsset: live.passport.asset.symbol,
  policy: preflight.status,
  passportHash: live.hash,
  xLayerMainnetChainId: Number.parseInt(mainnetChain, 16),
  xLayerTestnetChainId: Number.parseInt(testnetChain, 16),
  tokenAddress: live.passport.deployment.tokenAddress,
  tokenBytecode: "VERIFIED",
  onchainMultiplierRead: "VERIFIED",
}, null, 2));
