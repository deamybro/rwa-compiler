import { getLiveAssetBundle, assetUrl, priceUrl, multiplierUrl, proofUrl } from "../adapters/xstocks";
import { evaluatePolicy } from "../policy/engine";
import { canonicalHash } from "./canonical";
import { rwaPassportSchema, type Provenance, type RWAPassport, type VerificationState } from "./schema";

function isoFromActivation(value: number | string): string | null {
  if (value === 0 || value === "0" || value === "") return null;
  if (typeof value === "number") {
    const milliseconds = value > 10_000_000_000 ? value : value * 1000;
    return new Date(milliseconds).toISOString();
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
}

function eventType(reason: string | null | undefined): RWAPassport["corporateAction"]["type"] {
  const normalized = reason?.toLowerCase() ?? "";
  if (normalized.includes("reverse")) return "REVERSE_SPLIT";
  if (normalized.includes("split")) return "STOCK_SPLIT";
  if (normalized.includes("dividend")) return "DIVIDEND";
  return reason ? "OTHER" : null;
}

function ageSeconds(timestamp: string, now: Date) {
  return Math.max(0, Math.floor((now.getTime() - Date.parse(timestamp)) / 1000));
}

export async function compilePassport(symbol: string, now = new Date()): Promise<{ passport: RWAPassport; hash: `0x${string}` }> {
  const normalizedSymbol = symbol.trim();
  const retrievedAt = now.toISOString();
  const bundle = await getLiveAssetBundle(normalizedSymbol);
  const asset = bundle.asset.status === "fulfilled" ? bundle.asset.value : null;
  const price = bundle.price.status === "fulfilled" ? bundle.price.value : null;
  const multiplier = bundle.multiplier.status === "fulfilled" ? bundle.multiplier.value : null;
  const proof = bundle.proof.status === "fulfilled" ? bundle.proof.value : null;
  const xLayerDeployment = asset?.deployments.find((item) => item.network.toLowerCase() === "xlayer") ?? null;
  const activationTimestamp = multiplier ? isoFromActivation(multiplier.activationDateTime) : null;
  const hasPendingMultiplier = Boolean(multiplier && multiplier.newMultiplier > 0 && activationTimestamp);
  const failures = [bundle.asset, bundle.price, bundle.multiplier, bundle.proof].filter((item) => item.status === "rejected").length;
  const provenance: Provenance[] = [];

  const addProvenance = (
    field: string,
    value: unknown,
    sourceUri: string,
    verification: VerificationState,
    note?: string,
  ) => provenance.push({
    field,
    value,
    sourceType: "XSTOCKS_API",
    sourceUri,
    retrievedAt,
    verification,
    contentHash: canonicalHash(value),
    ...(note ? { note } : {}),
  });

  if (asset) addProvenance("asset", asset, assetUrl(normalizedSymbol), "VERIFIED");
  if (price) addProvenance("price.value", price.quote, priceUrl(normalizedSymbol), "VERIFIED", "The public endpoint returns a quote without an upstream timestamp; retrievedAt is tracked separately.");
  if (multiplier) addProvenance("multiplier", multiplier, multiplierUrl(normalizedSymbol), "VERIFIED");
  if (proof) addProvenance("proofOfReserves", proof, proofUrl(normalizedSymbol), "VERIFIED");

  const proofAge = proof ? ageSeconds(proof.timestamp, now) : null;
  const proofStatus: VerificationState = !proof ? "UNVERIFIED" : proofAge! > 86_400 ? "STALE" : "VERIFIED";
  const priceStatus: VerificationState = price ? "VERIFIED" : "UNVERIFIED";

  const decision = evaluatePolicy({
    assetKnown: Boolean(asset),
    deploymentStatus: xLayerDeployment ? "VERIFIED" : "UNVERIFIED",
    proofOfReservesStatus: proofStatus,
    proofOfReservesAgeSeconds: proofAge,
    priceStatus,
    priceAgeSeconds: price ? 0 : null,
    tradingHalted: Boolean(asset?.isTradingHalted || asset?.trading?.isTradingHalted),
    pendingMultiplier: hasPendingMultiplier,
    multiplierMatches: true,
    corporateActionAt: activationTimestamp,
    sourceConflict: false,
    criticalSourceUnavailable: !asset || !multiplier || !proof,
  }, now);

  const passport = rwaPassportSchema.parse({
    schemaVersion: "1.0.0",
    asset: {
      symbol: asset?.symbol ?? normalizedSymbol,
      name: asset?.name ?? `${normalizedSymbol} (unverified)`,
      underlyingSymbol: asset?.underlyingSymbol ?? "UNKNOWN",
      assetClass: "TOKENIZED_EQUITY",
      identityStatus: asset ? "VERIFIED" : "UNVERIFIED",
    },
    deployment: {
      network: "X_LAYER",
      chainId: 196,
      tokenAddress: xLayerDeployment?.address ?? null,
      status: xLayerDeployment ? "VERIFIED" : "UNVERIFIED",
    },
    backing: {
      type: "1_TO_1",
      status: proofStatus,
      verifiedAt: proof?.timestamp ?? null,
    },
    proofOfReserves: {
      status: proofStatus,
      timestamp: proof?.timestamp ?? null,
      source: proofUrl(normalizedSymbol),
      sharesHeld: proof?.sharesHeld ?? null,
      circulatingSupply: proof?.circulatingSupply ?? null,
    },
    price: {
      value: price?.quote ?? null,
      currency: "USD",
      timestamp: price ? retrievedAt : null,
      freshnessSeconds: price ? 0 : null,
      status: priceStatus,
    },
    multiplier: {
      current: multiplier ? String(multiplier.currentMultiplier) : "0",
      pending: hasPendingMultiplier ? String(multiplier?.newMultiplier) : null,
      activationTimestamp,
      status: multiplier ? "VERIFIED" : "UNVERIFIED",
    },
    corporateAction: {
      status: hasPendingMultiplier ? "UPCOMING" : multiplier ? "NONE" : "UNKNOWN",
      type: hasPendingMultiplier ? eventType(multiplier?.reason) : null,
      effectiveAt: activationTimestamp,
      source: multiplier ? multiplierUrl(normalizedSymbol) : null,
    },
    market: {
      state: asset?.isTradingHalted || asset?.trading?.isTradingHalted
        ? "HALTED"
        : asset?.trading?.openNow === true
          ? "OPEN"
          : asset?.trading?.openNow === false
            ? "CLOSED"
            : "UNKNOWN",
      period: asset?.trading?.currentPeriod ?? null,
    },
    riskState: decision,
    provenance,
    compiledAt: retrievedAt,
    validUntil: new Date(now.getTime() + 300_000).toISOString(),
  });

  if (failures > 0 && provenance.length === 0) {
    throw new Error("All authoritative xStocks sources are unavailable");
  }

  return { passport, hash: canonicalHash(passport) };
}

