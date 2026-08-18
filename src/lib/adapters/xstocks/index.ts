import { z } from "zod";

export const XSTOCKS_API_ROOT = "https://api.backed.fi/api/v2";

const deploymentSchema = z.object({
  address: z.string(),
  network: z.string(),
  wrapperAddress: z.string().optional(),
  wrapperAddressV2: z.string().optional(),
  supportsAtomicSwaps: z.boolean().optional(),
}).passthrough();

export const xStockAssetSchema = z.object({
  id: z.string(),
  name: z.string(),
  symbol: z.string(),
  underlyingSymbol: z.string(),
  description: z.string().optional(),
  logo: z.string().optional(),
  isTradingHalted: z.boolean().default(false),
  trading: z.object({
    currency: z.string().optional(),
    currentPeriod: z.string().nullable().optional(),
    openNow: z.boolean().optional(),
    isTradingHalted: z.boolean().optional(),
  }).passthrough().optional(),
  deployments: z.array(deploymentSchema),
}).passthrough();

export const xStockPriceSchema = z.object({ quote: z.number().nonnegative() }).passthrough();

export const xStockMultiplierSchema = z.object({
  currentMultiplier: z.number().nonnegative(),
  newMultiplier: z.number().nonnegative(),
  activationDateTime: z.union([z.number(), z.string()]),
  reason: z.string().nullable(),
}).passthrough();

export const xStockProofSchema = z.object({
  symbol: z.string(),
  timestamp: z.string().datetime(),
  sharesHeld: z.string(),
  circulatingSupply: z.string(),
  holdings: z.array(z.object({ provider: z.string(), quantity: z.string(), symbol: z.string() }).passthrough()),
}).passthrough();

export type XStockAsset = z.infer<typeof xStockAssetSchema>;
export type XStockPrice = z.infer<typeof xStockPriceSchema>;
export type XStockMultiplier = z.infer<typeof xStockMultiplierSchema>;
export type XStockProof = z.infer<typeof xStockProofSchema>;

type CacheEntry = { expiresAt: number; value: unknown };
const cache = new Map<string, CacheEntry>();

async function fetchValidated<T>(url: string, schema: z.ZodType<T>, ttlMs = 30_000): Promise<T> {
  const cached = cache.get(url);
  if (cached && cached.expiresAt > Date.now()) return cached.value as T;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(url, {
      headers: { accept: "application/json", "user-agent": "rwa-compiler/1.0" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`xStocks ${response.status} at ${url}`);
    const parsed = schema.parse(await response.json());
    cache.set(url, { expiresAt: Date.now() + ttlMs, value: parsed });
    return parsed;
  } finally {
    clearTimeout(timer);
  }
}

export function assetUrl(symbol: string) {
  return `${XSTOCKS_API_ROOT}/public/assets/${encodeURIComponent(symbol)}`;
}

export function priceUrl(symbol: string) {
  return `${assetUrl(symbol)}/price-data`;
}

export function multiplierUrl(symbol: string) {
  return `${assetUrl(symbol)}/multiplier?network=XLayer`;
}

export function proofUrl(symbol: string) {
  return `${XSTOCKS_API_ROOT}/public/proof-of-reserves/${encodeURIComponent(symbol)}`;
}

export async function getXStockAsset(symbol: string) {
  return fetchValidated(assetUrl(symbol), xStockAssetSchema, 60_000);
}

export async function getXStockPrice(symbol: string) {
  return fetchValidated(priceUrl(symbol), xStockPriceSchema, 20_000);
}

export async function getXStockMultiplier(symbol: string) {
  return fetchValidated(multiplierUrl(symbol), xStockMultiplierSchema, 20_000);
}

export async function getXStockProof(symbol: string) {
  return fetchValidated(proofUrl(symbol), xStockProofSchema, 60_000);
}

export async function getLiveAssetBundle(symbol: string) {
  const [asset, price, multiplier, proof] = await Promise.allSettled([
    getXStockAsset(symbol),
    getXStockPrice(symbol),
    getXStockMultiplier(symbol),
    getXStockProof(symbol),
  ]);
  return { asset, price, multiplier, proof };
}

