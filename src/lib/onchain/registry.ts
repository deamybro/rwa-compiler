import { createPublicClient, defineChain, http, isAddress, keccak256, stringToHex } from "viem";

const registryAbi = [
  {
    type: "function",
    name: "getPassport",
    stateMutability: "view",
    inputs: [{ name: "assetId", type: "bytes32" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "manifestHash", type: "bytes32" },
          { name: "status", type: "uint8" },
          { name: "updatedAt", type: "uint64" },
          { name: "validUntil", type: "uint64" },
          { name: "version", type: "uint64" },
        ],
      },
    ],
  },
] as const;

const xLayer = defineChain({
  id: 196,
  name: "X Layer Mainnet",
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.xlayer.tech"] } },
  blockExplorers: { default: { name: "OKLink", url: "https://www.okx.com/web3/explorer/xlayer" } },
});

export type RegistryVerification = {
  status: "NOT_CONFIGURED" | "MATCH" | "MISMATCH" | "UNAVAILABLE";
  matches: boolean | null;
  registryAddress: `0x${string}` | null;
  manifestHash: `0x${string}` | null;
  version: string | null;
  checkedAt: string | null;
  error?: string;
};

export async function verifyRegistryPassport(
  symbol: string,
  localHash: `0x${string}`,
): Promise<RegistryVerification> {
  const configuredAddress = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS;
  if (!configuredAddress) {
    return { status: "NOT_CONFIGURED", matches: null, registryAddress: null, manifestHash: null, version: null, checkedAt: null };
  }
  if (!isAddress(configuredAddress)) {
    return { status: "UNAVAILABLE", matches: null, registryAddress: null, manifestHash: null, version: null, checkedAt: new Date().toISOString(), error: "Configured registry address is invalid" };
  }

  try {
    const client = createPublicClient({ chain: xLayer, transport: http(process.env.XLAYER_MAINNET_RPC_URL || "https://rpc.xlayer.tech", { timeout: 15_000 }) });
    const assetId = keccak256(stringToHex(symbol.trim()));
    const state = await client.readContract({ address: configuredAddress, abi: registryAbi, functionName: "getPassport", args: [assetId] });
    const manifestHash = state.manifestHash;
    const matches = manifestHash.toLowerCase() === localHash.toLowerCase();
    return {
      status: matches ? "MATCH" : "MISMATCH",
      matches,
      registryAddress: configuredAddress,
      manifestHash,
      version: state.version.toString(),
      checkedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "UNAVAILABLE",
      matches: null,
      registryAddress: configuredAddress,
      manifestHash: null,
      version: null,
      checkedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Registry read failed",
    };
  }
}
