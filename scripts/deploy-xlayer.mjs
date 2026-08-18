import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  createPublicClient,
  createWalletClient,
  defineChain,
  formatEther,
  http,
  keccak256,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { compileProtocolContracts } from "./lib/solidity-artifacts.mjs";

const projectRoot = resolve(import.meta.dirname, "..");
const requestedNetwork = process.argv.includes("--network")
  ? process.argv[process.argv.indexOf("--network") + 1]
  : "testnet";
const checkOnly = process.argv.includes("--check");

const networks = {
  testnet: {
    chainId: 1952,
    name: "X Layer Testnet",
    rpcUrl: process.env.XLAYER_TESTNET_RPC_URL || "https://testrpc.xlayer.tech/terigon",
    explorer: "https://www.okx.com/web3/explorer/xlayer-test",
    deploymentFile: "xlayer-testnet.json",
  },
  mainnet: {
    chainId: 196,
    name: "X Layer Mainnet",
    rpcUrl: process.env.XLAYER_MAINNET_RPC_URL || "https://rpc.xlayer.tech",
    explorer: "https://www.okx.com/web3/explorer/xlayer",
    deploymentFile: "xlayer-mainnet.json",
  },
};

const network = networks[requestedNetwork];
assert.ok(network, "Use --network testnet or --network mainnet");

const chain = defineChain({
  id: network.chainId,
  name: network.name,
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: { default: { http: [network.rpcUrl] } },
  blockExplorers: { default: { name: "OKLink", url: network.explorer } },
});
const publicClient = createPublicClient({ chain, transport: http(network.rpcUrl, { timeout: 20_000 }) });
const artifacts = compileProtocolContracts();
const liveChainId = await publicClient.getChainId();
assert.equal(liveChainId, network.chainId, `RPC returned chain ${liveChainId}, expected ${network.chainId}`);

const artifactSummary = Object.fromEntries(
  Object.entries(artifacts).map(([name, artifact]) => [
    name,
    { bytecodeBytes: (artifact.bytecode.length - 2) / 2, bytecodeHash: keccak256(artifact.bytecode) },
  ]),
);

if (checkOnly) {
  console.log(JSON.stringify({ ok: true, mode: "CHECK_ONLY", network: network.name, chainId: liveChainId, artifacts: artifactSummary }, null, 2));
} else {

const rawPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;
assert.match(rawPrivateKey ?? "", /^0x[0-9a-fA-F]{64}$/, "DEPLOYER_PRIVATE_KEY must be a 0x-prefixed 32-byte key");
const account = privateKeyToAccount(rawPrivateKey);
const walletClient = createWalletClient({ account, chain, transport: http(network.rpcUrl, { timeout: 30_000 }) });
const deployerBalance = await publicClient.getBalance({ address: account.address });

async function deploy(name, args) {
  const artifact = artifacts[name];
  const hash = await walletClient.deployContract({
    account,
    abi: artifact.abi,
    bytecode: artifact.bytecode,
    args,
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash, confirmations: 1, timeout: 180_000 });
  assert.equal(receipt.status, "success", `${name} deployment reverted`);
  assert.ok(receipt.contractAddress, `${name} receipt did not include a contract address`);
  const code = await publicClient.getCode({ address: receipt.contractAddress });
  assert.ok(code && code !== "0x", `${name} has no runtime bytecode`);
  return { address: receipt.contractAddress, transactionHash: hash, blockNumber: receipt.blockNumber.toString() };
}

const registry = await deploy("RWARegistry", [account.address, account.address]);
const policyEngine = await deploy("PolicyEngine", [registry.address]);
const guardedExecutor = await deploy("GuardedExecutor", [policyEngine.address]);
const deployedAt = new Date().toISOString();
const deployment = {
  network: network.name,
  chainId: network.chainId,
  status: "DEPLOYED_PENDING_SMOKE_TEST",
  deployedAt,
  deployer: account.address,
  deployerBalanceAtStart: `${formatEther(deployerBalance)} OKB`,
  gitCommit: process.env.GIT_COMMIT || "SET_GIT_COMMIT_FOR_PROVENANCE",
  compiler: solcVersionFromArtifacts(),
  contracts: {
    RWARegistry: registry.address,
    PolicyEngine: policyEngine.address,
    GuardedExecutor: guardedExecutor.address,
  },
  transactions: [
    { contract: "RWARegistry", ...registry, explorerUrl: `${network.explorer}/tx/${registry.transactionHash}` },
    { contract: "PolicyEngine", ...policyEngine, explorerUrl: `${network.explorer}/tx/${policyEngine.transactionHash}` },
    { contract: "GuardedExecutor", ...guardedExecutor, explorerUrl: `${network.explorer}/tx/${guardedExecutor.transactionHash}` },
  ],
  explorer: network.explorer,
};

writeFileSync(resolve(projectRoot, "deployments", network.deploymentFile), `${JSON.stringify(deployment, null, 2)}\n`);
console.log(JSON.stringify({ ok: true, network: network.name, chainId: network.chainId, deployer: account.address, contracts: deployment.contracts, transactions: deployment.transactions }, null, 2));

function solcVersionFromArtifacts() {
  return "0.8.26";
}
}
