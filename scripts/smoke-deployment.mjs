import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  createPublicClient,
  createWalletClient,
  defineChain,
  encodePacked,
  http,
  keccak256,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { compileProtocolContracts } from "./lib/solidity-artifacts.mjs";

const projectRoot = resolve(import.meta.dirname, "..");
const requestedNetwork = process.argv.includes("--network")
  ? process.argv[process.argv.indexOf("--network") + 1]
  : "testnet";
const networks = {
  testnet: { chainId: 1952, name: "X Layer Testnet", rpcUrl: process.env.XLAYER_TESTNET_RPC_URL || "https://testrpc.xlayer.tech/terigon", explorer: "https://www.okx.com/web3/explorer/xlayer-test", deploymentFile: "xlayer-testnet.json" },
  mainnet: { chainId: 196, name: "X Layer Mainnet", rpcUrl: process.env.XLAYER_MAINNET_RPC_URL || "https://rpc.xlayer.tech", explorer: "https://www.okx.com/web3/explorer/xlayer", deploymentFile: "xlayer-mainnet.json" },
};
const network = networks[requestedNetwork];
assert.ok(network, "Use --network testnet or --network mainnet");

const deploymentPath = resolve(projectRoot, "deployments", network.deploymentFile);
const deployment = JSON.parse(readFileSync(deploymentPath, "utf8"));
assert.equal(deployment.chainId, network.chainId, "Deployment record chain ID mismatch");
assert.ok(deployment.contracts?.RWARegistry, "Deploy contracts before running the smoke test");

const rawPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;
assert.match(rawPrivateKey ?? "", /^0x[0-9a-fA-F]{64}$/, "DEPLOYER_PRIVATE_KEY must be a 0x-prefixed 32-byte key");
const account = privateKeyToAccount(rawPrivateKey);
assert.equal(account.address.toLowerCase(), deployment.deployer.toLowerCase(), "Key does not match the recorded deployer");

const chain = defineChain({ id: network.chainId, name: network.name, nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 }, rpcUrls: { default: { http: [network.rpcUrl] } } });
const publicClient = createPublicClient({ chain, transport: http(network.rpcUrl, { timeout: 20_000 }) });
const walletClient = createWalletClient({ account, chain, transport: http(network.rpcUrl, { timeout: 30_000 }) });
assert.equal(await publicClient.getChainId(), network.chainId, "RPC chain ID mismatch");

const artifacts = compileProtocolContracts();
const registryAddress = deployment.contracts.RWARegistry;
const policyAddress = deployment.contracts.PolicyEngine;
const executorAddress = deployment.contracts.GuardedExecutor;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://rwa-compiler.meboebube48.chatgpt.site";
const passportResponse = await fetch(`${appUrl}/api/assets/NVDAx/passport`, { signal: AbortSignal.timeout(30_000) });
assert.equal(passportResponse.ok, true, `Passport API returned ${passportResponse.status}`);
const passportPayload = await passportResponse.json();
assert.match(passportPayload.passportHash ?? "", /^0x[0-9a-f]{64}$/i, "Passport API returned an invalid hash");

const assetId = keccak256(encodePacked(["string"], ["NVDAx"]));
const action = keccak256(encodePacked(["string"], ["DEMO_GUARDED_ACTION"]));
const payloadHash = keccak256(encodePacked(["string"], [`rwa-compiler:${requestedNetwork}:smoke`]));
const reasonOk = keccak256(encodePacked(["string"], ["OK"]));
const reasonPause = keccak256(encodePacked(["string"], ["CORPORATE_ACTION_WINDOW"]));
const validUntil = BigInt(Math.floor(Date.now() / 1000) + 3600);
const transactions = [];

async function writeAndWait(label, request) {
  const hash = await walletClient.writeContract({ account, ...request });
  const receipt = await publicClient.waitForTransactionReceipt({ hash, confirmations: 1, timeout: 180_000 });
  assert.equal(receipt.status, "success", `${label} reverted`);
  transactions.push({ label, transactionHash: hash, blockNumber: receipt.blockNumber.toString(), explorerUrl: `${network.explorer}/tx/${hash}` });
}

const alreadyRegistered = await publicClient.readContract({ address: registryAddress, abi: artifacts.RWARegistry.abi, functionName: "isRegistered", args: [assetId] });
if (!alreadyRegistered) {
  await writeAndWait("register NVDAx", { address: registryAddress, abi: artifacts.RWARegistry.abi, functionName: "registerAsset", args: [assetId] });
}

await writeAndWait("anchor ALLOW Passport", { address: registryAddress, abi: artifacts.RWARegistry.abi, functionName: "updatePassport", args: [assetId, passportPayload.passportHash, 1, reasonOk, validUntil] });
const allowResult = await publicClient.readContract({ address: policyAddress, abi: artifacts.PolicyEngine.abi, functionName: "preflight", args: [assetId, action] });
assert.equal(allowResult[0], true, "ALLOW preflight was not allowed");
assert.equal(allowResult[3].toLowerCase(), passportPayload.passportHash.toLowerCase(), "Onchain Passport hash mismatch");
await writeAndWait("execute guarded action while ALLOW", { address: executorAddress, abi: artifacts.GuardedExecutor.abi, functionName: "execute", args: [assetId, action, payloadHash] });

await writeAndWait("anchor PAUSE Passport", { address: registryAddress, abi: artifacts.RWARegistry.abi, functionName: "updatePassport", args: [assetId, passportPayload.passportHash, 3, reasonPause, validUntil] });
const pauseResult = await publicClient.readContract({ address: policyAddress, abi: artifacts.PolicyEngine.abi, functionName: "preflight", args: [assetId, action] });
assert.equal(pauseResult[0], false, "PAUSE preflight unexpectedly allowed execution");
await assert.rejects(
  publicClient.simulateContract({ account, address: executorAddress, abi: artifacts.GuardedExecutor.abi, functionName: "execute", args: [assetId, action, payloadHash] }),
  "Guarded execution simulation should revert during PAUSE",
);

await writeAndWait("resume ALLOW Passport", { address: registryAddress, abi: artifacts.RWARegistry.abi, functionName: "updatePassport", args: [assetId, passportPayload.passportHash, 1, reasonOk, validUntil] });
const finalResult = await publicClient.readContract({ address: policyAddress, abi: artifacts.PolicyEngine.abi, functionName: "preflight", args: [assetId, action] });
assert.equal(finalResult[0], true, "Final ALLOW preflight was not allowed");

deployment.status = "DEPLOYED_AND_SMOKE_TESTED";
deployment.smokeTest = {
  completedAt: new Date().toISOString(),
  asset: "NVDAx",
  assetId,
  passportHash: passportPayload.passportHash,
  onchainHashMatch: true,
  allowPreflight: true,
  pausePreflight: false,
  guardedPauseRevertedInSimulation: true,
  resumedToAllow: true,
  transactions,
};
writeFileSync(deploymentPath, `${JSON.stringify(deployment, null, 2)}\n`);
console.log(JSON.stringify({ ok: true, network: network.name, chainId: network.chainId, contracts: deployment.contracts, smokeTest: deployment.smokeTest }, null, 2));
