import { z } from "zod";
import { compilePassport } from "@/src/lib/passport/compiler";

const requestSchema = z.object({
  asset: z.string().min(2).max(24),
  action: z.string().min(1).max(32).transform((value) => value.toUpperCase()),
});

export async function POST(request: Request) {
  try {
    const input = requestSchema.parse(await request.json());
    const { passport, hash } = await compilePassport(input.asset);
    return Response.json({
      asset: passport.asset.symbol,
      action: input.action,
      allowed: passport.riskState.status !== "PAUSE",
      status: passport.riskState.status,
      reasonCode: passport.riskState.reasonCodes[0],
      reason: passport.riskState.reason,
      confidence: passport.riskState.confidence,
      verified: passport.riskState.verified,
      validUntil: passport.validUntil,
      passportHash: hash,
      sources: passport.provenance,
    });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: "Invalid preflight request", issues: error.issues }, { status: 400 });
    return Response.json({ error: error instanceof Error ? error.message : "Preflight unavailable" }, { status: 503 });
  }
}

