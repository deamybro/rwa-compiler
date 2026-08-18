import { getXStockAsset, getXStockMultiplier } from "../adapters/xstocks";
import type { Extraction } from "../ai/compiler";

export interface VerifiedClaim {
  claim: Extraction["claims"][number];
  verification: "VERIFIED" | "CORROBORATED" | "UNVERIFIED" | "CONFLICT";
  evidence: string;
  authoritativeValue: unknown;
}

function activationToTime(value: number | string): number | null {
  if (value === 0 || value === "0" || value === "") return null;
  const parsed = typeof value === "number"
    ? (value > 10_000_000_000 ? value : value * 1000)
    : Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function verifyClaims(extraction: Extraction): Promise<VerifiedClaim[]> {
  return Promise.all(extraction.claims.map(async (claim) => {
    try {
      const [asset, multiplier] = await Promise.all([
        getXStockAsset(claim.assetSymbol),
        getXStockMultiplier(claim.assetSymbol),
      ]);
      const authoritativeTime = activationToTime(multiplier.activationDateTime);
      const claimedTime = claim.effectiveAt ? Date.parse(claim.effectiveAt) : null;
      const timeMatches = authoritativeTime !== null && claimedTime !== null && Math.abs(authoritativeTime - claimedTime) <= 60_000;
      const reasonMatches = multiplier.reason
        ? claim.eventType.replaceAll("_", " ").toLowerCase().includes(multiplier.reason.toLowerCase()) ||
          multiplier.reason.toLowerCase().includes(claim.eventType.split("_")[0].toLowerCase())
        : false;

      if (authoritativeTime !== null && timeMatches && reasonMatches) {
        return {
          claim,
          verification: "VERIFIED" as const,
          evidence: "The asset, event type, and activation time match the official xStocks multiplier source.",
          authoritativeValue: multiplier,
        };
      }
      if (authoritativeTime !== null) {
        return {
          claim,
          verification: "CONFLICT" as const,
          evidence: "The asset exists, but the extracted event does not match the current official pending multiplier. Official data wins.",
          authoritativeValue: multiplier,
        };
      }
      return {
        claim,
        verification: "UNVERIFIED" as const,
        evidence: `${asset.symbol} is authoritative, but no matching pending multiplier is currently published.`,
        authoritativeValue: multiplier,
      };
    } catch {
      return {
        claim,
        verification: "UNVERIFIED" as const,
        evidence: "The authoritative source could not verify this claim.",
        authoritativeValue: null,
      };
    }
  }));
}

