import { z } from "zod";

export const verificationStateSchema = z.enum([
  "VERIFIED",
  "CORROBORATED",
  "AI_EXTRACTED",
  "UNVERIFIED",
  "STALE",
  "CONFLICT",
]);

export const policyStatusSchema = z.enum(["ALLOW", "WATCH", "PAUSE"]);

export const reasonCodeSchema = z.enum([
  "OK",
  "ASSET_UNKNOWN",
  "DEPLOYMENT_UNVERIFIED",
  "CORPORATE_ACTION_UPCOMING",
  "CORPORATE_ACTION_WINDOW",
  "MULTIPLIER_PENDING",
  "MULTIPLIER_MISMATCH",
  "PROOF_OF_RESERVES_STALE",
  "ORACLE_STALE",
  "SOURCE_CONFLICT",
  "SOURCE_STALE",
  "TRADING_HALTED",
  "SYSTEM_UNAVAILABLE",
  "MANUAL_EMERGENCY_PAUSE",
]);

export const provenanceSchema = z.object({
  field: z.string().min(1),
  value: z.unknown(),
  sourceType: z.enum(["XSTOCKS_API", "X_LAYER_RPC", "AI_PROVIDER", "DEMO_FIXTURE"]),
  sourceUri: z.string().min(1),
  retrievedAt: z.string().datetime(),
  verification: verificationStateSchema,
  contentHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  note: z.string().optional(),
});

export const rwaPassportSchema = z.object({
  schemaVersion: z.literal("1.0.0"),
  asset: z.object({
    symbol: z.string().min(1),
    name: z.string().min(1),
    underlyingSymbol: z.string().min(1),
    assetClass: z.literal("TOKENIZED_EQUITY"),
    identityStatus: verificationStateSchema,
  }),
  deployment: z.object({
    network: z.literal("X_LAYER"),
    chainId: z.literal(196),
    tokenAddress: z.string().nullable(),
    status: verificationStateSchema,
  }),
  backing: z.object({
    type: z.literal("1_TO_1"),
    status: verificationStateSchema,
    verifiedAt: z.string().datetime().nullable(),
  }),
  proofOfReserves: z.object({
    status: verificationStateSchema,
    timestamp: z.string().datetime().nullable(),
    source: z.string(),
    sharesHeld: z.string().nullable(),
    circulatingSupply: z.string().nullable(),
  }),
  price: z.object({
    value: z.number().nonnegative().nullable(),
    currency: z.literal("USD"),
    timestamp: z.string().datetime().nullable(),
    freshnessSeconds: z.number().nonnegative().nullable(),
    status: verificationStateSchema,
  }),
  multiplier: z.object({
    current: z.string(),
    pending: z.string().nullable(),
    activationTimestamp: z.string().datetime().nullable(),
    status: verificationStateSchema,
  }),
  corporateAction: z.object({
    status: z.enum(["NONE", "UPCOMING", "ACTIVE", "UPDATED", "UNKNOWN"]),
    type: z.enum(["DIVIDEND", "STOCK_SPLIT", "REVERSE_SPLIT", "OTHER"]).nullable(),
    effectiveAt: z.string().datetime().nullable(),
    source: z.string().nullable(),
  }),
  market: z.object({
    state: z.enum(["OPEN", "CLOSED", "HALTED", "UNKNOWN"]),
    period: z.string().nullable(),
  }),
  riskState: z.object({
    status: policyStatusSchema,
    reasonCodes: z.array(reasonCodeSchema),
    reason: z.string(),
    confidence: z.number().min(0).max(1),
    verified: z.boolean(),
  }),
  provenance: z.array(provenanceSchema),
  compiledAt: z.string().datetime(),
  validUntil: z.string().datetime(),
});

export type VerificationState = z.infer<typeof verificationStateSchema>;
export type PolicyStatus = z.infer<typeof policyStatusSchema>;
export type ReasonCode = z.infer<typeof reasonCodeSchema>;
export type Provenance = z.infer<typeof provenanceSchema>;
export type RWAPassport = z.infer<typeof rwaPassportSchema>;

