import type { PolicyStatus, ReasonCode, VerificationState } from "../passport/schema";

export interface PolicyConfig {
  corporateActionPauseBeforeSeconds: number;
  corporateActionPauseAfterSeconds: number;
  corporateActionWatchBeforeSeconds: number;
  maxPriceAgeSeconds: number;
  maxPassportAgeSeconds: number;
  maxProofOfReservesAgeSeconds: number;
}

export const defaultPolicyConfig: PolicyConfig = {
  corporateActionPauseBeforeSeconds: 900,
  corporateActionPauseAfterSeconds: 900,
  corporateActionWatchBeforeSeconds: 86_400,
  maxPriceAgeSeconds: 300,
  maxPassportAgeSeconds: 300,
  maxProofOfReservesAgeSeconds: 86_400,
};

export interface PolicyFacts {
  assetKnown: boolean;
  deploymentStatus: VerificationState;
  proofOfReservesStatus: VerificationState;
  proofOfReservesAgeSeconds: number | null;
  priceStatus: VerificationState;
  priceAgeSeconds: number | null;
  tradingHalted: boolean;
  pendingMultiplier: boolean;
  multiplierMatches: boolean;
  corporateActionAt: string | null;
  sourceConflict: boolean;
  criticalSourceUnavailable: boolean;
  manualEmergencyPause?: boolean;
}

export interface PolicyDecision {
  allowed: boolean;
  status: PolicyStatus;
  reasonCodes: ReasonCode[];
  reason: string;
  confidence: number;
  verified: boolean;
}

const explanations: Record<ReasonCode, string> = {
  OK: "All required verified checks passed.",
  ASSET_UNKNOWN: "The asset is not present in the authoritative asset registry.",
  DEPLOYMENT_UNVERIFIED: "The X Layer token deployment could not be verified.",
  CORPORATE_ACTION_UPCOMING: "A verified corporate action is approaching its safety window.",
  CORPORATE_ACTION_WINDOW: "A multiplier activation is inside the configured safety window.",
  MULTIPLIER_PENDING: "A new multiplier has been published and is awaiting activation.",
  MULTIPLIER_MISMATCH: "The authoritative multiplier and observed state do not match.",
  PROOF_OF_RESERVES_STALE: "Proof-of-reserves data is outside the permitted freshness threshold.",
  ORACLE_STALE: "Price or oracle data is outside the permitted freshness threshold.",
  SOURCE_CONFLICT: "Authoritative and extracted sources conflict.",
  SOURCE_STALE: "The Passport or a critical source is stale.",
  TRADING_HALTED: "The authoritative source reports trading halted.",
  SYSTEM_UNAVAILABLE: "A critical verification source is unavailable.",
  MANUAL_EMERGENCY_PAUSE: "The protocol emergency pause is active.",
};

export function evaluatePolicy(facts: PolicyFacts, now = new Date(), config = defaultPolicyConfig): PolicyDecision {
  const hard: ReasonCode[] = [];
  const watch: ReasonCode[] = [];
  if (facts.manualEmergencyPause) hard.push("MANUAL_EMERGENCY_PAUSE");
  if (!facts.assetKnown) hard.push("ASSET_UNKNOWN");
  if (facts.deploymentStatus !== "VERIFIED") hard.push("DEPLOYMENT_UNVERIFIED");
  if (facts.tradingHalted) hard.push("TRADING_HALTED");
  if (facts.criticalSourceUnavailable) hard.push("SYSTEM_UNAVAILABLE");
  if (facts.sourceConflict) hard.push("SOURCE_CONFLICT");
  if (!facts.multiplierMatches) hard.push("MULTIPLIER_MISMATCH");
  if (facts.proofOfReservesStatus === "STALE" || (facts.proofOfReservesAgeSeconds !== null && facts.proofOfReservesAgeSeconds > config.maxProofOfReservesAgeSeconds)) hard.push("PROOF_OF_RESERVES_STALE");
  if (facts.priceStatus === "STALE" || (facts.priceAgeSeconds !== null && facts.priceAgeSeconds > config.maxPriceAgeSeconds)) watch.push("ORACLE_STALE");

  if (facts.corporateActionAt) {
    const secondsToEvent = (Date.parse(facts.corporateActionAt) - now.getTime()) / 1000;
    if (secondsToEvent <= config.corporateActionPauseBeforeSeconds && secondsToEvent >= -config.corporateActionPauseAfterSeconds) hard.push("CORPORATE_ACTION_WINDOW");
    else if (secondsToEvent > 0 && secondsToEvent <= config.corporateActionWatchBeforeSeconds) watch.push("CORPORATE_ACTION_UPCOMING");
  }
  if (facts.pendingMultiplier && !hard.includes("CORPORATE_ACTION_WINDOW")) watch.push("MULTIPLIER_PENDING");

  const uniqueHard: ReasonCode[] = [...new Set(hard)];
  const uniqueWatch: ReasonCode[] = [...new Set(watch)];
  const reasonCodes: ReasonCode[] = uniqueHard.length ? uniqueHard : uniqueWatch.length ? uniqueWatch : ["OK"];
  const status: PolicyStatus = uniqueHard.length ? "PAUSE" : uniqueWatch.length ? "WATCH" : "ALLOW";
  const verified = !facts.criticalSourceUnavailable && !facts.sourceConflict;
  return { allowed: status !== "PAUSE", status, reasonCodes, reason: explanations[reasonCodes[0]], confidence: verified ? 1 : 0.5, verified };
}

